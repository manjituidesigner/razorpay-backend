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

  const plan_id = req.body.plan_id;
  const total_count = req.body.total_count || 120; // Default to 10 years

  if (!plan_id) {
    return res.status(400).json({ error: 'Missing plan_id' });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_zMhPqqVjBwLtzw';
  const key_secret = process.env.RAZORPAY_KEY_SECRET; 

  if (!key_secret) {
    return res.status(500).json({ error: 'Razorpay Secret Key not configured in Vercel environment' });
  }

  try {
    const authString = Buffer.from(key_id + ':' + key_secret).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + authString
      },
      body: JSON.stringify({
        plan_id: plan_id,
        total_count: total_count,
        customer_notify: 1 // Razorpay will send email/sms to customer
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
