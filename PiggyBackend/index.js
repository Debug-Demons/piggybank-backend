// Import express using ESM syntax
import express from 'express';
const app = express();

//import { authenticateUser } from './authMiddleware.js';
//import authRoutes from './api/auth.js';
import admin from 'firebase-admin';
import { createRequire } from 'module';

// Create a require function
const require = createRequire(import.meta.url);

// Use require to load the JSON file
const credentials = require('./config/piggybank-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

app.use(express.json());

app.use(express.urlencoded({extended: true}));

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

// Create a new express application instance

// Define the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies

//app.use('/api/auth', authRoutes);
//const registerRoute = authRoutes.register;
// Define a route
app.get('/', (req, res) => {
  res.send('Hello PiggyBackend');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
