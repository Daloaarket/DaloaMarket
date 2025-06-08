// Netlify Function : Callback PayDunya pour traitement des paiements
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

exports.handler = async (event) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // PayDunya envoie les données en application/x-www-form-urlencoded
    const body = event.body;
    let data;
    
    try {
      // Essayer de parser comme JSON d'abord
      data = JSON.parse(body);
    } catch {
      // Si ce n'est pas du JSON, parser comme form data
      const params = new URLSearchParams(body);
      const dataParam = params.get('data');
      if (dataParam) {
        data = JSON.parse(dataParam);
      } else {
        throw new Error('Format de données invalide');
      }
    }

    console.log('Callback PayDunya reçu:', data);

    if (!data || !data.invoice) {
      throw new Error('Données de facture manquantes');
    }

    const invoice = data.invoice;
    const customData = invoice.custom_data || {};

    // Vérifier le statut du paiement
    if (invoice.status === 'completed') {
      // Mettre à jour la transaction
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          paydunya_token: invoice.token 
        })
        .eq('paydunya_token', invoice.token);

      if (updateTransactionError) {
        console.error('Erreur mise à jour transaction:', updateTransactionError);
      }

      // Traitement selon le type de paiement
      const paymentType = customData.type;
      const userId = customData.user_id;

      if (paymentType === 'annonce' && customData.listing_id) {
        // Publier l'annonce
        const { error: publishError } = await supabase
          .from('listings')
          .update({ status: 'active' })
          .eq('id', customData.listing_id)
          .eq('user_id', userId);

        if (publishError) {
          console.error('Erreur publication annonce:', publishError);
        }

      } else if (paymentType === 'boost' && customData.listing_id) {
        // Appliquer le boost
        const boostDuration = customData.boost_option;
        let boostedUntil = new Date();
        
        if (boostDuration === '24h') {
          boostedUntil.setDate(boostedUntil.getDate() + 1);
        } else if (boostDuration === '7d') {
          boostedUntil.setDate(boostedUntil.getDate() + 7);
        } else if (boostDuration === '30d') {
          boostedUntil.setDate(boostedUntil.getDate() + 30);
        }

        const { error: boostError } = await supabase
          .from('listings')
          .update({ 
            boosted_until: boostedUntil.toISOString(),
            status: 'active'
          })
          .eq('id', customData.listing_id)
          .eq('user_id', userId);

        if (boostError) {
          console.error('Erreur application boost:', boostError);
        }

      } else if (paymentType === 'pack' && customData.credits) {
        // Ajouter les crédits
        const creditsToAdd = parseInt(customData.credits);
        
        const { error: creditsError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: userId,
            credits: creditsToAdd,
            total_earned: creditsToAdd,
            last_update: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (creditsError) {
          // Si upsert échoue, essayer une mise à jour
          const { error: updateCreditsError } = await supabase.rpc(
            'add_user_credits',
            { 
              target_user_id: userId, 
              credit_amount: creditsToAdd,
              reason: `Achat pack ${customData.pack_name || creditsToAdd + ' crédits'}`
            }
          );

          if (updateCreditsError) {
            console.error('Erreur ajout crédits:', updateCreditsError);
          }
        }
      }

      console.log(`Paiement ${paymentType} traité avec succès pour l'utilisateur ${userId}`);

    } else if (invoice.status === 'cancelled' || invoice.status === 'failed') {
      // Mettre à jour la transaction comme échouée
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('paydunya_token', invoice.token);

      if (updateTransactionError) {
        console.error('Erreur mise à jour transaction échouée:', updateTransactionError);
      }

      console.log(`Paiement échoué/annulé pour le token ${invoice.token}`);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ 
        success: true, 
        message: 'Callback traité avec succès',
        status: invoice.status 
      })
    };

  } catch (error) {
    console.error('Erreur callback PayDunya:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message || 'Erreur lors du traitement du callback'
      })
    };
  }
};