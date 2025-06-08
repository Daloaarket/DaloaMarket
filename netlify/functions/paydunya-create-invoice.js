// Netlify Function : Création d'une facture PayDunya
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

// Configuration PayDunya Production
const PAYDUNYA_CONFIG = {
  MASTER_KEY: process.env.PAYDUNYA_MASTER_KEY,
  PRIVATE_KEY: process.env.PAYDUNYA_PRIVATE_KEY,
  PUBLIC_KEY: process.env.PAYDUNYA_PUBLIC_KEY,
  TOKEN: process.env.PAYDUNYA_TOKEN,
  MODE: process.env.PAYDUNYA_MODE || 'live',
  BASE_URL: 'https://app.paydunya.com/api/v1'
};

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
    const { userId, type, annonceId, boostOption, credits, packName } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'userId requis' })
      };
    }

    // Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Utilisateur non trouvé' })
      };
    }

    // Calculer le montant et la description selon le type
    let amount = 200;
    let description = "Publication d'annonce sur DaloaMarket";
    let itemName = "Publication d'annonce";

    if (type === 'boost') {
      const boostPrices = {
        '24h': 300,
        '7d': 800,
        '30d': 2500
      };
      amount = boostPrices[boostOption] || 500;
      description = `Boost d'annonce (${boostOption}) sur DaloaMarket`;
      itemName = `Boost d'annonce (${boostOption})`;
    } else if (type === 'pack') {
      const packPrices = {
        3: 500,
        10: 1500,
        30: 3500
      };
      amount = packPrices[credits] || credits * 200;
      description = `Achat de pack de crédits (${packName || credits + ' crédits'}) sur DaloaMarket`;
      itemName = `Pack de crédits (${packName || credits + ' crédits'})`;
    }

    // Préparer les données pour PayDunya
    const invoiceData = {
      invoice: {
        total_amount: amount,
        description: description,
        items: {
          item_0: {
            name: itemName,
            quantity: 1,
            unit_price: amount.toString(),
            total_price: amount.toString(),
            description: description
          }
        }
      },
      store: {
        name: 'DaloaMarket',
        tagline: 'Marketplace locale de Daloa'
      },
      customer: {
        name: user.full_name || 'Utilisateur DaloaMarket',
        email: user.email,
        phone: user.phone || ''
      },
      actions: {
        return_url: `${process.env.VITE_APP_URL}/payment/success?type=${type}&user_id=${userId}${annonceId ? `&listing_id=${annonceId}` : ''}`,
        cancel_url: `${process.env.VITE_APP_URL}/payment/failure?type=${type}`,
        callback_url: `${process.env.VITE_APP_URL}/.netlify/functions/paydunya-callback`
      },
      custom_data: {
        user_id: userId,
        type: type,
        listing_id: annonceId || null,
        boost_option: boostOption || null,
        credits: credits || null,
        pack_name: packName || null
      }
    };

    // Appel à l'API PayDunya
    const response = await axios.post(
      `${PAYDUNYA_CONFIG.BASE_URL}/checkout-invoice/create`,
      invoiceData,
      {
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.MASTER_KEY,
          'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.PRIVATE_KEY,
          'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.TOKEN,
          'PAYDUNYA-MODE': PAYDUNYA_CONFIG.MODE
        }
      }
    );

    if (response.data.response_code !== '00') {
      throw new Error(response.data.response_text || 'Erreur lors de la création de la facture');
    }

    // Enregistrer la transaction en base
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        listing_id: annonceId || null,
        amount: amount,
        type: type,
        status: 'pending',
        paydunya_token: response.data.token
      });

    if (transactionError) {
      console.error('Erreur enregistrement transaction:', transactionError);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        checkout_url: response.data.response_text,
        token: response.data.token,
        amount: amount,
        description: description
      })
    };

  } catch (error) {
    console.error('Erreur PayDunya:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.message || 'Erreur lors de la création du paiement'
      })
    };
  }
};