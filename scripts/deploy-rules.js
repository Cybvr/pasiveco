require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env.local');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });

  const rulesContent = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');

  async function deployRules() {
    console.log('Deploying Firestore rules to project:', projectId);
    
    try {
      const securityRules = admin.securityRules();
      const ruleset = await securityRules.createRuleset({
        content: rulesContent,
      });
      await securityRules.releaseFirestoreRuleset(ruleset.name);
      
      console.log('Successfully deployed Firestore rules!');
    } catch (error) {
      console.error('Error deploying rules:', error.message);
      process.exit(1);
    }
  }

  deployRules();
} catch (error) {
  console.error('Failed to initialize Admin SDK:', error.message);
  process.exit(1);
}
