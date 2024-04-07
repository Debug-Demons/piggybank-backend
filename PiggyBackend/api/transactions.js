//For manlipulating transactions with firestore.
//Need to talk with josh for some clearfications 
//For Customer related Processing
// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) { // Checks if admin is not already initialized
    const serviceAccount = require('../path/to/your/firebase-adminsdk-credentials.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
const db = admin.firestore;

export default router;