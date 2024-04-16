//For manlipulating transactions with firestore.
//Need to talk with josh for some clearfications 
//For Customer related Processing
// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) { // Checks if admin is not already initialized
    const serviceAccount = require('../');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore(); 

//This will not handle the payment processing of the app
//Instead we are going to just store the "receipts" that square will send us into our database.



router.post('/addTransaction/:uid', async (reg, res)=>{
  
})




//DO NOT DELETE 
export default router;