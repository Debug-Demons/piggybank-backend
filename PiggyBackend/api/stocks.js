//For Stock Related Processing
//Note: I'm assuming that this will be using mostly alpaca for stock related processing.
//If this is unneccesart 
// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';
import Alpaca from '@alpacahq/alpaca-trade-api';

const router = express.Router();

const alpaca = new Alpaca({
  keyId: 'PK4CGHPK2KFGO9WWB6NR',
  secretKey: 'TAg0UHcAkW2fJG9z57HTjg9GJAPovWIAM2QIKOfz',
  paper: true, // Set to false when using in production
});

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) { // Checks if admin is not already initialized
    const serviceAccount = require('../config/piggybank-firebase-adminsdk.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
const db = admin.firestore;

// Route to buy stocks
router.post('/buy-stocks', async (req, res) => {
  console.log("Received request:", req.body);
  const { amount } = req.body;
  const symbols = ['AAPL', 'MSFT', 'GOOGL']; // Example stocks

  try {
      const investmentPerStock = amount / symbols.length;

      for (const symbol of symbols) {
          await alpaca.createOrder({
              symbol: symbol,
              qty: Math.floor(investmentPerStock / (await getCurrentPrice(symbol))),
              side: 'buy',
              type: 'market',
              time_in_force: 'day'
          });
      }

      res.send('Stocks purchased successfully.');
  } catch (error) {
      console.error('Error purchasing stocks:', error);
      res.status(500).send('Error purchasing stocks');
  }
});

// Helper function to get the current price of a stock
async function getCurrentPrice(symbol) {
  const response = await alpaca.getLatestTrade(symbol);
  return response.price;
}


//Needs integration with alpaca before we add anything to this. 




//DO NOT DELETE 
export default router;