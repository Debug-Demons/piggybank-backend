// Import express using ESM syntax
import express from 'express';

const app = express();
import { investInTechGiants } from './api/transactions/alpacaAPI.js';
import admin from 'firebase-admin';
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: 'PK4CGHPK2KFGO9WWB6NR',
  secretKey: 'TAg0UHcAkW2fJG9z57HTjg9GJAPovWIAM2QIKOfz',
  paper: true, // Set to false when using in production
});
// Dynamic import for Firebase Admin SDK configuration
const credentials = await import('./config/piggybank-firebase-adminsdk.json', {
  assert: { type: 'json' }
});

// Firebase Admin initialization with ESM syntax
admin.initializeApp({
  credential: admin.credential.cert(credentials.default)
});

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamically import route modules as they are now ESM as well
const customerRoutes = await import('./api/customer.js');
const businessRoutes = await import('./api/business.js');
const transactionsRoutes = await import('./api/transactions.js');
const stocksRoutes = await import('./api/stocks.js');
const productRoutes = await import('./api/products.js');
// Use imported routes
app.use('/api/customers', customerRoutes.default);
app.use('/api/business', businessRoutes.default);
app.use('/api/transactions', transactionsRoutes.default);
app.use('/api/stocks', stocksRoutes.default);
app.use('/api/products', productRoutes.default);




app.post('/invest', async (req, res) => {
  const { amount } = req.body;

  try {
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount provided." });
    }

    const results = await investInTechGiants(amount);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/register', async (req, res) => {
  const user = { 
    email: req.body.email,
    password: req.body.password
  } 
  try {
    const userResponse = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: false,
      disabled: false,
      businessAcc: false,
      adminAcc: false
    });
    res.json({ 
      message: 'User created successfully!', 
      userId: userResponse.uid,
      user: userResponse 
    });
//
app.set('trust proxy', true);

// Helper function to get the current price of a stock
async function getCurrentPrice(symbol) {
  const response = await alpaca.getLatestTrade(symbol);
  return response.price;
}

app.post('/buy-stocks', async (req, res) => {
  console.log("Received request:", req.body);
  const { amount } = req.body;
  const symbols = ['AAPL', 'MSFT', 'GOOGL']; // Example stocks

  try {
      const investmentPerStock = (amount / symbols.length - 0.01).toFixed(2);

      for (const symbol of symbols) {
          await alpaca.createOrder({
              symbol: symbol,
              notional: investmentPerStock,
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


//app.post('/transaction', handleTransaction);

// Create a new express application instance


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
