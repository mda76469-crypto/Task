// ══════════════════════════════════════════════════════
//  TaskPay — CPAGrip Postback Handler
//  Vercel Serverless Function: api/reward.js
//
//  CPAGrip Postback URL:
//  https://YOUR_VERCEL_URL/api/reward?uid={tracking_id}&payout={payout}&offer_name={offer_name}&status={status}
// ══════════════════════════════════════════════════════

const admin = require('firebase-admin');

// ── Firebase Admin singleton init ──
function getFirebase() {
  if (admin.apps.length > 0) return admin.app();
  return admin.initializeApp({
    credential: admin.credential.cert({
      type:                        'service_account',
      project_id:                  process.env.FIREBASE_PROJECT_ID,
      private_key_id:              process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key:                 (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email:                process.env.FIREBASE_CLIENT_EMAIL,
      client_id:                   process.env.FIREBASE_CLIENT_ID,
      auth_uri:                    'https://accounts.google.com/o/oauth2/auth',
      token_uri:                   'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:        process.env.FIREBASE_CERT_URL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const COIN_MULTIPLIER = 5000; // $1 = 5000 coins
const POSTBACK_SECRET  = process.env.CPAGRIP_SECRET || '';

// ── Vercel handler format ──
module.exports = async (req, res) => {

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // CPAGrip GET postback bhejta hai
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const { uid, payout, offer_name, status, secret } = req.query;

  console.log('[CPAGrip Postback]', JSON.stringify({ uid, payout, offer_name, status }));

  // ── Validation ──
  if (!uid || !payout) {
    return res.status(400).send('Missing: uid or payout');
  }
  if (status !== '1') {
    // Not completed — still return 1 so CPAGrip doesn't retry
    return res.status(200).send('1');
  }
  if (POSTBACK_SECRET && secret !== POSTBACK_SECRET) {
    return res.status(403).send('Forbidden');
  }

  const payoutFloat = parseFloat(payout);
  if (isNaN(payoutFloat) || payoutFloat <= 0) {
    return res.status(400).send('Invalid payout');
  }

  const coinsToAdd = Math.round(payoutFloat * COIN_MULTIPLIER);

  try {
    getFirebase();
    const db      = admin.database();
    const userRef = db.ref('users/' + uid);

    // User exist check
    const snap = await userRef.once('value');
    if (!snap.exists()) {
      console.error('[CPAGrip] User not found:', uid);
      return res.status(404).send('User not found');
    }

    // Atomic coins + totalEarned increment
    await userRef.update({
      coins:       admin.database.ServerValue.increment(coinsToAdd),
      totalEarned: admin.database.ServerValue.increment(coinsToAdd),
    });

    // Transaction history mein save karo
    await db.ref('users/' + uid + '/transactions').push({
      type:      'offerwall',
      amount:    coinsToAdd,
      offer:     offer_name || 'CPAGrip Offer',
      payout:    payoutFloat,
      date:      new Date().toISOString(),
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    console.log('[CPAGrip] +' + coinsToAdd + ' coins credited to ' + uid);

    // CPAGrip ko "1" chahiye — success
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('1');

  } catch (err) {
    console.error('[CPAGrip] Firebase error:', err.message);
    return res.status(500).send('Internal Server Error');
  }
};
    
