// Import express using ESM syntax
import express from 'express';
import admin from 'firebase-admin';

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

// Use imported routes
app.use('/api/customers', customerRoutes.default);
app.use('/api/business', businessRoutes.default);
app.use('/api/transactions', transactionsRoutes.default);
app.use('/api/stocks', stocksRoutes.default);

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

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello PiggyBackend');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
