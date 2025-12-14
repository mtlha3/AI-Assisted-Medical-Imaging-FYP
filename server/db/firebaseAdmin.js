const admin = require("firebase-admin");
const serviceAccount = require("./finalyearproject-bb61e-firebase-adminsdk-fbsvc-c8d1edfe76.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
