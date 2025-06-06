// PayDunya API integration (Node.js)
import axios from 'axios';

const PAYDUNYA_MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY || '';
const PAYDUNYA_PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY || '';
const PAYDUNYA_TOKEN = process.env.PAYDUNYA_TOKEN || '';
const PAYDUNYA_MODE = process.env.PAYDUNYA_MODE || 'live';

async function createPaydunyaCheckout(data) {
  const url = 'https://app.paydunya.com/api/v1/checkout-invoice/create';
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': PAYDUNYA_MASTER_KEY,
      'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_PRIVATE_KEY,
      'PAYDUNYA-TOKEN': PAYDUNYA_TOKEN,
      'PAYDUNYA-MODE': PAYDUNYA_MODE
    }
  });
  return response.data.response;
}

module.exports = { createPaydunyaCheckout };
