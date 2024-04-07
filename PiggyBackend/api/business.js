// For Business related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore;

router.get('/:uid', async (req, res) => {
    // Extract the `uid` from the request parameters. This `uid` is expected to be part of the URL.
    const uid = req.params.uid;
    try {
        // Create a reference to the specific document in the 'Customers' collection that matches the `uid`.
        const userRef = db.collection('Business').doc(uid);
        // Asynchronously retrieve the document from Firestore.
        const doc = await userRef.get();
        // Check if the document exists.
        if (doc.exists) {
            // If the document exists, respond with status code 200 (OK) and the document data in JSON format.
            res.status(200).json(doc.data());
        } else {
            // If the document does not exist, respond with status code 404 (Not Found) and a message.
            res.status(404).send({ message: 'Business User not found' });
        }
    } catch (error) {
        // If an error occurs during the operation, log the error and respond with status code 500 (Internal Server Error) and a message.
        console.error('Error fetching user:', error);
        res.status(500).send({ message: 'Failed to retrieve user' });
    }
});


router.post('/createBusinessUser', async (req, res) => {
    // Extract the user details from the request body
    const { email, password, otherUserInfo } = req.body; //NEED MORE INFO 

    try {
        // Use Firebase Admin SDK to create a new user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password // It's important to securely handle passwords and not log them
        });

        // Extract the UID assigned by Firebase to the new user
        const uid = userRecord.uid;

        // Store additional information about the user in Firestore using the UID as the document ID
        await db.collection('users').doc(uid).set(otherUserInfo);

        // Respond to the client with the UID of the newly created user and a success message
        res.status(201).send({ uid, message: ' Customer User created successfully with UID: ' + uid });
    } catch (error) {
        // Log any errors that occur during the process and send a 500 internal server error response
        console.error('Error creating new customer user:', error);
        res.status(500).send({ error: error.message });
    }
});


export default router;