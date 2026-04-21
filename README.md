# TaskPay — Vercel + GitHub Setup Guide

## 🚀 Deploy karne ke steps:

### Step 1: GitHub pe upload karo
1. GitHub par naya repository banao (e.g. `taskpay`)
2. Ye saare files upload karo (ya `git push` karo)

### Step 2: Vercel se connect karo
1. [vercel.com](https://vercel.com) pe login karo
2. **"Add New Project"** → GitHub repo select karo
3. Framework: **Other** (no framework)
4. Root directory: `/` (default rehne do)
5. **Deploy** dabao

### Step 3: Environment Variables (ZARURI!)
Vercel Dashboard → Project → Settings → **Environment Variables** mein ye sab add karo:

| Variable Name            | Value                          |
|--------------------------|--------------------------------|
| `FIREBASE_PROJECT_ID`    | Firebase project ID            |
| `FIREBASE_PRIVATE_KEY_ID`| Service account private key ID |
| `FIREBASE_PRIVATE_KEY`   | Service account private key    |
| `FIREBASE_CLIENT_EMAIL`  | Service account client email   |
| `FIREBASE_CLIENT_ID`     | Service account client ID      |
| `FIREBASE_CERT_URL`      | Service account cert URL       |
| `FIREBASE_DATABASE_URL`  | Firebase Realtime DB URL       |
| `CPAGRIP_SECRET`         | CPAGrip postback secret        |

> ⚠️ FIREBASE_PRIVATE_KEY mein `\n` characters honge — Vercel mein paste karte waqt unhe as-is paste karo (quotes ke bina)

### Step 4: URL update karo
Vercel deploy hone ke baad jo URL mile (e.g. `taskpay.vercel.app`), usse:
- `contact.html`, `about.html`, `privacy.html` mein `YOUR_VERCEL_URL` replace karo
- CPAGrip dashboard mein postback URL update karo:
  ```
  https://taskpay.vercel.app/api/reward?uid={tracking_id}&payout={payout}&offer_name={offer_name}&status={status}
  ```

### Step 5: Firebase Authorized Domains
Firebase Console → Authentication → Settings → **Authorized domains** mein apna Vercel domain add karo.

---

## 📂 File Structure

```
taskpay/
├── index.html          ← Main app
├── admin.html          ← Admin panel
├── about.html
├── contact.html
├── privacy.html
├── manifest.json       ← PWA config
├── sw.js               ← Service Worker
├── icon-192.png
├── icon-512.png
├── ads.txt
├── vercel.json         ← Vercel config ✅
├── .gitignore
├── api/
│   ├── reward.js       ← Vercel serverless function ✅
│   └── package.json
└── netlify/            ← Purana Netlify (ignore karo)
    └── functions/
        └── reward.js
```

---

## 🔥 Firebase Offers Add Karne Ka Tarika

Admin panel (`/admin.html`) se offers add karo ya directly Firebase Console mein:

**Path:** `offers/{auto-id}`
```json
{
  "title": "Offer ka naam",
  "description": "Kya karna hai",
  "link": "https://offer-url.com",
  "amount": 500,
  "image_url": "https://image-url.com/img.png",
  "status": "active",
  "order": 1
}
```

**status = "active"** hoga tabhi app mein dikhega.
