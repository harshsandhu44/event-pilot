import admin from 'firebase-admin';

let adminApp: admin.app.App;

export const initializeAdmin = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    adminApp = admin.apps[0]!;
  }

  return adminApp;
};

export const getAdminAuth = () => {
  if (!adminApp) initializeAdmin();
  return admin.auth();
};

export const getAdminDb = () => {
  if (!adminApp) initializeAdmin();
  return admin.firestore();
};
