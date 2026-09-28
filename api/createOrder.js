export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed' });
  }

  const amount = req.body.amount || 0;
  if (amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Fallback to Test Key if env variables are not set
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_zMhPqqVjBwLtzw';
  
  // NOTE: Secret Key must be set in Vercel Dashboard Environment Variables
  const key_secret = process.env.RAZORPAY_KEY_SECRET; 

  if (!key_secret) {
    return res.status(500).json({ error: 'Razorpay Secret Key not configured in Vercel environment' });
  }

  try {
    const authString = Buffer.from(key_id + ':' + key_secret).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + authString
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'INR',
        receipt: 'rcptid_' + Math.floor(Math.random() * 10000)
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
