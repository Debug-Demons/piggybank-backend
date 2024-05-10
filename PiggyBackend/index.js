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

app.post('/customer/:Email/update-loyalty', async (req, res) => {
  const { Email } = req.params;
  const { loyalty } = req.body;

  // Ensure loyalty is a number and not NaN (Not-a-Number)
  const parsedLoyalty = parseFloat(loyalty);
  if (isNaN(parsedLoyalty)) {
    return res.status(400).send('Invalid loyalty amount.');
  }

  try {
    // Find the customer document using the email
    const customerQuerySnapshot = await db.collection('Customers')
      .where('Email', '==', Email).limit(1).get();

    if (customerQuerySnapshot.empty) {
      return res.status(404).send('Customer not found.');
    }

    // Retrieve the document ID of the customer
    const customerDoc = customerQuerySnapshot.docs[0];
    const customerRef = db.collection('Customers').doc(customerDoc.id);

    // Initialize the loyalty amount to zero if not already present
    const customerData = customerDoc.data();
    if (customerData.loyalty === undefined) {
      await customerRef.set({ loyalty: 0 }, { merge: true });
    }

    // Update the customer's loyalty amount (increment or decrement)
    await customerRef.update({
      loyalty: admin.firestore.FieldValue.increment(parsedLoyalty)
    });

    // Inform the user of the amount that was changed
    res.status(200).send(`Loyalty amount of ${parsedLoyalty} applied successfully.`);
  } catch (error) {
    console.error('Error updating loyalty amount:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/customer/:Email/loyalty', async (req, res) => {
  const { Email } = req.params;

  try {
    // Query for the customer document using the email
    const customerQuerySnapshot = await db.collection('Customers')
      .where('Email', '==', Email).limit(1).get();

    if (customerQuerySnapshot.empty) {
      return res.status(404).send('Customer not found.');
    }

    // Retrieve the first matching document
    const customerDoc = customerQuerySnapshot.docs[0];
    const customerData = customerDoc.data();
    
    // Extract the roundup amount, or set to zero if not available
    const loyalty = customerData.loyalty || 0;

    res.status(200).send({ loyalty });
  } catch (error) {
    console.error('Error retrieving roundup amount:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function to get the current price of a stock
async function getCurrentPrice(symbol) {
  const response = await alpaca.getLatestTrade(symbol);
  return response.price;
}
// Function to get the current price of AAPL stock
async function getCurrentPriceOfApple() {
  try {
      const response = await alpaca.getLatestTrade('AAPL');
      return response.price;
  } catch (error) {
      console.error('Error getting Apple stock price:', error);
      return null;
  }
}

// Function to update the customer's roundup amount
async function updateCustomerRoundup(customerId, roundupAmount) {
  try {
      await db.collection('customers').doc(customerId).update({
          roundupAmount: admin.firestore.FieldValue.increment(roundupAmount)
      });
      console.log(`Updated roundup amount for customer ${customerId} to ${roundupAmount}`);
  } catch (error) {
      console.error('Error updating customer roundup amount:', error);
  }
}

// Function to update the roundup amount for all customers
async function updateRoundupAmounts() {
  try {
      const customersSnapshot = await db.collection('customers').get();
      const batch = db.batch();

      customersSnapshot.forEach(doc => {
          const customerData = doc.data();
          const newRoundupAmount = customerData.roundupAmount * 1.01; // Increase by 1%
          const customerRef = db.collection('customers').doc(doc.id);
          batch.update(customerRef, { roundupAmount: newRoundupAmount });
      });

      await batch.commit();
      console.log('Roundup amounts updated successfully.');
  } catch (error) {
      console.error('Failed to update roundup amounts:', error);
  }
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
    const businessDoc = await db.collection('Business').doc(businessId).get();
    const customerDoc = await db.collection('Customers').doc(customerId).get();

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

app.get('/customers/loyalty/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Query the 'customers' collection for a customer with the given email address
    const querySnapshot = await db.collection('Customers').where('Email', '==', email).limit(1).get();
    
    // Check if the query returned any results
    if (querySnapshot.empty) {
      return res.status(404).send('Customer not found');
    }

    // Assuming the query will return a single document (due to `.limit(1)`), retrieve the first one
    const customerDoc = querySnapshot.docs[0];
    const customerData = customerDoc.data();

    // Extract and send back the roundup (loyalty) amount
    const loyalty = customerData.loyalty ?? 0;
    res.json({ email, loyalty });
  } catch (error) {
    console.error('Error fetching customer by email:', error);
    res.status(500).send('Internal Server Error');
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

// Endpoint to retrieve a list of all products
app.get('/api/products', async (req, res) => {
  try {
    // Fetch the products collection from Firestore
    const snapshot = await db.collection('Products').get();

    // Create an array to hold the products
    const products = [];
    
    // Iterate through each document and push it to the array
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Send the array as a JSON response
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
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
