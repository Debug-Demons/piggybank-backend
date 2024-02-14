// Import express using ESM syntax
import express from 'express';
import { authenticateUser } from './authMiddleware.js';
import authRoutes from './api/auth.js';

// Create a new express application instance
const app = express();

// Define the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/auth', authRoutes);
const registerRoute = authRoutes.register;
// Define a route
app.get('/', (req, res) => {
  res.send('Hello PiggyBackend');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
