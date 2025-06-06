// Netlify Function : Callback PayDunya
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const body = JSON.parse(event.body);
  const { invoice } = body;
  if (invoice && invoice.status === 'completed') {
    // Extraction de l'ID annonce depuis return_url (ex: .../retour?id=ANNONCE_ID)
    let annonceId = null;
    if (invoice.actions && invoice.actions.return_url) {
      const url = new URL(invoice.actions.return_url);
      annonceId = url.searchParams.get('id');
    }
    if (!annonceId) {
      return { statusCode: 400, body: 'ID annonce introuvable dans return_url' };
    }
    // Publier l'annonce dans Supabase
    const { error: updateError } = await supabase
      .from('annonces')
      .update({ status: 'published' })
      .eq('id', annonceId);
    if (updateError) {
      return { statusCode: 500, body: 'Erreur publication annonce: ' + updateError.message };
    }
    // Log de la transaction
    await supabase.from('transactions').insert({
      user_id: invoice.custom_data?.user_id || null,
      amount: invoice.total_amount,
      type: 'annonce',
      status: 'paid',
      reference: invoice.token
    });
    return { statusCode: 200, body: 'OK' };
  }
  return { statusCode: 400, body: 'Paiement non validé' };
};
