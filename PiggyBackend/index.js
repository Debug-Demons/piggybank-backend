// Import express using ESM syntax
import express from 'express';
import admin from 'firebase-admin';
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId: 'PK25AFS81STTIF3JC6BD',
  secretKey: 'aXWElyb751HU3gKUDEgbC7dnckFWM2KYSNaCQeVj',
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

const db = admin.firestore();
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




//
app.set('trust proxy', true);

// Helper function to get the current price of a stock
async function getCurrentPrice(symbol) {
  const response = await alpaca.getLatestTrade(symbol);
  return response.price;
}

app.post('/buy-stocks', async (req, res) => {
  console.log("Received request to buy:", req.body);
  const { amount } = req.body;
  const symbols = ['AAPL']; // Example stocks
 
 
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
 
 // Endpoint to handle a business transaction and update a customer's roundup amount
app.post('/api/transactions/business/:businessId/customer/:customerId', async (req, res) => {
  const { businessId, customerId } = req.params;
  const { amount, description, paymentMethod, roundupAmount } = req.body;

  try {
    // Fetch the business and customer documents
    const businessDoc = await db.collection('business').doc(businessId).get();
    const customerDoc = await db.collection('customers').doc(customerId).get();

    if (!businessDoc.exists) {
      return res.status(404).send('Business not found');
    }
    if (!customerDoc.exists) {
      return res.status(404).send('Customer not found');
    }

    // Create the transaction data
    const transaction = {
      amount,
      description,
      paymentMethod,
      date: new Date().toISOString(),
      businessId,
      customerId
    };

    // Add the transaction to the business's transaction history
    const newTransaction = await db.collection('transactions').add(transaction);

    // Update the customer's roundup amount by adding the pre-calculated value
    await db.collection('customers').doc(customerId).update({
      roundupAmount: admin.firestore.FieldValue.increment(roundupAmount)
    });

    // Send a success response
    res.status(201).send(`Transaction recorded: ${newTransaction.id} | Roundup added: ${roundupAmount}`);
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).send('Internal Server Error');
  }
});
 // Add a new transaction
app.post('/transactions', async (req, res) => {
  const transaction = req.body;
  try {
    const newDoc = await db.collection('Transactions').add(transaction);
    res.status(201).send(`Transaction created with ID: ${newDoc.id}`);
  } catch (error) {
    res.status(400).send(`Error creating transaction: ${error.message}`);
  }
});

// Get all transactions for a specific business
app.get('/transactions/business/:businessId', async (req, res) => {
  const businessId = req.params.businessId;
  try {
    const querySnapshot = await db.collection('Transactions').where('businessId', '==', businessId).get();
    if (querySnapshot.empty) {
      res.status(404).send('No transactions found for the specified business');
    } else {
      const transactions = [];
      querySnapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      res.send(transactions);
    }
  } catch (error) {
    res.status(400).send(`Error fetching transactions: ${error.message}`);
  }
});
 // Add a new product
app.post('/products', async (req, res) => {
  const product = req.body;
  try {
    const newDoc = await db.collection('Products').add(product);
    res.status(201).send(`Created a new product: ${newDoc.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Edit an existing product
app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  try {
    await db.collection('Products').doc(id).update(body);
    res.send(`Product with id: ${id} has been updated`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.collection('Products').doc(id).delete();
    res.send(`Product with id: ${id} has been deleted`);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

 app.get('/customer/:id/points', async (req, res) => {
  const customerId = req.params.id;

  try {
    const customerDoc = await db.collection('customers').doc(customerId).get();
    if (!customerDoc.exists) {
      res.status(404).send('Customer not found');
    } else {
      const customerData = customerDoc.data();
      const points = customerData.points; // Assuming the points field is stored directly in the customer document
      res.send({ points });
    }
  } catch (error) {
    console.error('Error fetching customer points:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/customer-by-phone/:phone/points', async (req, res) => {
  const customerPhone = req.params.phone;

  try {
    // Query the 'customers' collection for a customer with the given phone number
    const querySnapshot = await db.collection('customers').where('phoneNumber', '==', customerPhone).limit(1).get();
    if (querySnapshot.empty) {
      res.status(404).send('Customer not found');
    } else {
      // Assuming each phone number uniquely identifies a customer
      const customerDoc = querySnapshot.docs[0];
      const customerData = customerDoc.data();
      const points = customerData.points; // Assuming the bonusPoints field exists
      res.send({ points });
    }
  } catch (error) {
    console.error('Error fetching customer bonus points:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
