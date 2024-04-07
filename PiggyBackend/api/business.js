// For Business related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore;

router.get('/:uid', async (req, res) => {
    const uid = req.params.uid;
    try {
        // Query the 'Business' collection for documents where the 'UID' field matches the provided UID
        const querySnapshot = await db.collection('Business').where('uid', '==', uid).get(); 

        if (!querySnapshot.empty) {
            // Assuming UID is unique and there's only one document matching it
            const docData = querySnapshot.docs[0].data();
            res.status(200).json(docData);
        } else {
            // If no documents found
            res.status(404).send({ message: 'Business data not found' });
        }
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).send({ message: 'Failed to retrieve Business data' });
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