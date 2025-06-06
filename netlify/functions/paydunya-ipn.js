// netlify/functions/paydunya-ipn.js
require('dotenv').config();
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
import { createPaydunyaCheckout } from './paydunya.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const body = JSON.parse(event.body);
  const { userId, annonceId, type, boostOption, credits, packName } = body; // type: 'annonce' | 'boost' | 'pack'

  let amount = 200;
  let description = "Paiement pour publication d'annonce";
  let itemName = "Publication d'annonce";

  if (type === 'boost') {
    // Exemple de prix boost (à adapter selon ta logique)
    if (boostOption === '24h') amount = 300;
    else if (boostOption === '7d') amount = 800;
    else if (boostOption === '30d') amount = 2500;
    else amount = 500;
    description = `Paiement pour boost d'annonce (${boostOption || 'autre'})`;
    itemName = `Boost d'annonce (${boostOption || 'autre'})`;
  } else if (type === 'pack') {
    // Exemple de prix pack (à adapter selon ta logique)
    if (credits === 3) amount = 500;
    else if (credits === 10) amount = 1500;
    else if (credits === 30) amount = 3500;
    else amount = credits * 200;
    description = `Achat de pack de crédits (${packName || credits + ' crédits'})`;
    itemName = `Pack de crédits (${packName || credits + ' crédits'})`;
  }

  // Préparer le payload PayDunya
  const payload = {
    invoice: {
      items: [
        {
          name: itemName,
          quantity: 1,
          unit_price: amount
        }
      ],
      total_amount: amount,
      description
    },
    store: {
      name: 'Daloa Market',
      tagline: 'Vente locale à Daloa'
    },
    actions: {
      return_url: `https://daloa-market.netlify.app/payment-success`,
      cancel_url: `https://daloa-market.netlify.app/payment-failure`,
      callback_url: `https://daloa-market.netlify.app/.netlify/functions/paydunya-ipn-callback`
    }
  };

  try {
    const paydunyaRes = await createPaydunyaCheckout(payload);
    return {
      statusCode: 200,
      body: JSON.stringify({ checkout_url: paydunyaRes.checkout_url, token: paydunyaRes.token })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};