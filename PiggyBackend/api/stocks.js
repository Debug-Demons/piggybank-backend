//For Stock Related Processing
//Note: I'm assuming that this will be using mostly alpaca for stock related processing.
//If this is unneccesart 
// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) { // Checks if admin is not already initialized
    const serviceAccount = require('../config/piggybank-firebase-adminsdk.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
const db = admin.firestore;








//DO NOT DELETE 
export default router;