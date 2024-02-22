// Import express using ESM syntax
import express from 'express';
//import { authenticateUser } from './authMiddleware.js';
//import authRoutes from './api/auth.js';
import { initializeApp } from 'firebase-admin/app';

import credentials from './config/piggybank-firebase-adminsdk.json?type=json';


initializeApp({
  credential: admin.credential.cert(credentials)
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({
      email,
      password
    });
    res.json({ message: 'User created successfully!', userId: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Create a new express application instance
const app = express();

// Define the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.urlencoded({extended: true}));

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
