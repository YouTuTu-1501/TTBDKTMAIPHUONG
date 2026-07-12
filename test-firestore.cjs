const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const doc = await db.collection('appData').doc('main').get();
  console.log(JSON.stringify(doc.data().students, null, 2));
}
run();
