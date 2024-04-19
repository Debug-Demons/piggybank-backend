// Import express using ESM syntax
import express from 'express';
import admin from 'firebase-admin';
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: 'PKJV6JGDARHDJ3ZNYEGV',
  secretKey: '11gF1Qd2aciGiAJCdLuJm1ZelSawhJWBifKIGCd3',
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
// Register route
app.post('/register', async (req, res) => {
  try {
    const userResponse = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
      emailVerified: false,
      disabled: false
    });
    res.json({
      message: 'User created successfully!',
      userId: userResponse.uid,
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Helper function to get the current price of a stock
async function getCurrentPrice(symbol) {
  const response = await alpaca.getLatestTrade(symbol);
  return response.price;
}

app.post('/buy-stocks', async (req, res) => {
  console.log("Received request to buy:", req.body);
  const { amount } = req.body;
  const symbols = ['AAPL','GOOG','MSFT']; // Example stocks

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

app.post('/sell-stocks', async (req, res) => {
  console.log("Received request to sell:", req.body);
  const { amount } = req.body;
  const symbols = ['AAPL', 'MSFT', 'GOOGL']; // Example stocks

  try {
      const investmentPerStock = (amount / symbols.length - 0.01).toFixed(2);

      for (const symbol of symbols) {
          await alpaca.createOrder({
              symbol: symbol,
              notional: investmentPerStock,
              side: 'sell',  // Change 'buy' to 'sell' to sell the stock
              type: 'market',
              time_in_force: 'day'
          });
      }

      res.send('Stocks sold successfully.');
  } catch (error) {
      console.error('Error selling stocks:', error);
      res.status(500).send('Error selling stocks');
  }
});

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello PiggyBackend');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
