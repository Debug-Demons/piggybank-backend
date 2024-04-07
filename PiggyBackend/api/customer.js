// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore(); // Adjusted to call firestore as a method: admin.firestore()

// Endpoint for getting user records from uid
router.get('/:uid', async (req, res) => {
    const uid = req.params.uid;
    try {
        const userRef = db.collection('Customers').doc(uid);
        const doc = await userRef.get();
        if (doc.exists) {
            res.status(200).json(doc.data());
        } else {
            res.status(404).send({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send({ message: 'Failed to retrieve user' });
    }
});

// Define a Post Route to create a new user/customer.
router.post('/createCustomerUser', async (req, res) => {
    const { email, password, otherUserInfo } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password
        });

        const uid = userRecord.uid;
        await db.collection('users').doc(uid).set(otherUserInfo);
        res.status(201).send({ uid, message: 'Customer User created successfully with UID: ' + uid });
    } catch (error) {
        console.error('Error creating new customer user:', error);
        res.status(500).send({ error: error.message });
    }
});

export default router;
