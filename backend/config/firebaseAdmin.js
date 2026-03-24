const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

let initialized = false;

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    initialized = true;
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId
      });
      initialized = true;
    } catch (error) {
      initialized = false;
    }
  }
}

const isFirebaseAdminReady = () => initialized || admin.apps.length > 0;

module.exports = { admin, isFirebaseAdminReady };
