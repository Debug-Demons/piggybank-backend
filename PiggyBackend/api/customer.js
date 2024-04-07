// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore(); // Adjusted to call firestore as a method: admin.firestore()

// Endpoint for getting user records from uid
// Endpoint for getting user records based on a UID field within the documents
router.get('/:uid', async (req, res) => {
    const uid = req.params.uid;
    try {
        // Query the 'Customers' collection for documents where the 'UID' field matches the provided UID
        const querySnapshot = await db.collection('Customers').where('UID', '==', uid).get();

        if (!querySnapshot.empty) {
            // Assuming UID is unique and there's only one document matching it
            const docData = querySnapshot.docs[0].data();
            res.status(200).json(docData);
        } else {
            // If no documents found
            res.status(404).send({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).send({ message: 'Failed to retrieve customer' });
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
