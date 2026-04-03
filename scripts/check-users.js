
const admin = require('firebase-admin');
const serviceAccount = {
  projectId: "pasivezero",
  clientEmail: "firebase-adminsdk-fbsvc@pasivezero.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIgXU7DByf8Dem\n0w8pifo7at+UxbTyROLhc1WM39mi2oT4kGoAwq/YgeT1RuWDWNhaKvJw9OT+j0jO\n58n5XPm9kb23EieAMDc3TuwKryBGhtjcQ/XBiQgI5XW88wABGJLndhhpQU2Jyadm\nNpBhkThih7sfb1eyhnAlh0hy7jOpG1n/3s7RC51eqt9asav2dsiQy2DD1lnOJqOm\nGz7dv0BI2WORrh5t+RG7FGMsfpmFk0Fd8D4dB8M3Vc34J3HFGxYQbiB14f74W91I\nbT0KQHiwPMFE8U2BCtgOnQFBT0Fr5YM63gXg4goaGtLk1BdreXyJP02ivKMNy/RG\nqiWqiyi7AgMBAAECggEAIQZls0CW9GcCG5m27R4bV68OPXhlCeR7xCuVgzsZoz+/\n2BsdQpvOj+gxOI8hXYWEOTHKtf04PI+ILAA0nbyJLAa1y1ITrIMEjTkUGtxmggdS\n79DHyUVTS/fTcThLH2MXS0WB1tBZP6E1z9mb5V4gfeYiVZamyLJpBV1nevquCqO6\ng17QRFLxglhuCMsDI/9KR9Jw0qhC8NdXoulb2jmAcRaPrpAMa3oou9i9XwI55KGG\nukgH6CQh9X3NX98WtTkdk7/0rfo/Ndb+0m2IwCRk6CU4SkQd67mr/UkUv0JEuX2L\n1uAJu+LtRJBhgoi9XVPRu541UYBYEa2g9ZkBbM+KUQKBgQDn1IQFZcb8tPskuB+f\na3WFJdoqrOXwvLg0JkPB5qhxLf5lLAdsufJF/qJDNEyqvf2oBzG5k224tnUhW60J\n9HqxWqEDV0oHW30gF6h5ZFXuLu8Iw9cLs5OGF4sKVg4YYCgNXXibnmr5bXw1uP7c\ny2OVdldUW0TiLfdsdGdc5WdiywKBgQDdaOa05s95wBBQfWIPyrUIxBWotKWk44LL\ny5D8mf8Ktl8htPmX1CXPoyE8rvVaZLQNq1gYvsWFg6VsbqX1KlwAd3y7FH4QraTk\ndCwZ/jr1yFFHlPqFWVDcJWi9Y2X3tf0/f45DTul9eH0gIbxmpu9f+nfrDnydDRZK\niM1U0O1j0QKBgQCdqV+ntBHh5sstq7KF3rTrulRm1XMDh7TWcnd+NPm1DwyFja32\n+XaUt5lujvDc5ZzOWyYsCOGDz0JVT12c+ZE/cF00QnbsDgJIgw5mkCAIfg6+LUHg\niV34waYjf2bSmQJkJH9ThidGPnlMp+VcD05IZVT63583Gv+72GY7PSBUhQKBgHIm\nLyt9A+KFPuQAgJobrBIE5hXAbNYB5eEj5nAVBQSE2a8LGtNIMOZH+E7M9PnRiXKy\nsAyx7ivTn2mz8iPf3ubus4PQIN6AZ87Qhhwwkj09NYpuKGqvjZyyPLnHkT6QuSwP\nm0zgVki14ey69+MElc0p2MF7Cov9v0xWE2ZzALDBAoGAOf+lHF+/yBi1cH1DR7c1\nYoGHpv5i6MaEz+NbdqbaEGzYQD0df8ZGIkdwovY7g94Jb0WJkP5CN8MI3QX73kmy\nKbkAZyw5eJWPDDHJq+DdJaS9eY2whdJX67MP/suAlJCe4iU3MT1jCsYnIfgVJGsq\niVNARSDXhu9h4ZygiFsTo8o=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listUsers() {
  const snapshot = await db.collection('users').limit(5).get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data().email || doc.data().phoneNumber || doc.data().displayName);
  });
}

listUsers().catch(console.error);
