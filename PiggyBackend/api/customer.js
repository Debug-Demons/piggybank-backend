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
        const querySnapshot = await db.collection('Customers').where('uid', '==', uid).get(); 

        if (!querySnapshot.empty) {
            // Assuming UID is unique and there's only one document matching it
            const docData = querySnapshot.docs[0].data();
            res.status(200).json(docData);
        } else {
            // If no documents found
            res.status(404).send({ message: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error fetching Customer user:', error);
        res.status(500).send({ message: 'Failed to retrieve Customer data', error: error.message });

    }
});


// POST endpoint to create a new user and customer record
router.post('/create', async (req, res) => {
    // Extract user and customer information from request body
    const {
        email,
        password,
        name,
        phoneNumber,
        address } = req.body;

    try {
        // Create a new user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Prepare customer information for Firestore
        const customerInfo = {
            email,
            uid: userRecord.uid, // Use the UID provided by Firebase Auth
            name, // Assuming this is an object { first: 'John', last: 'Doe' }
            accountCreationDate: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
            phoneNumber,
            address,
        };

        // Add the customer record to the 'customers' collection in Firestore
        await admin.firestore().collection('Customers').doc(userRecord.uid).set(customerInfo);

        // Respond to the client
        res.status(201).send({
            message: 'Successfully created new user and customer record',
            uid: userRecord.uid,
        });
    } catch (error) {
        console.error('Error creating new user and customer record:', error);
        res.status(500).send({ message: 'Failed to create user and customer record', error: error.message });
    }
});


//update user profile
//I'm 

router.put('/updateCustomer/:uid', async (req, res) =>{
    const userId = req.params.uid;
    const updatedUserData = req.body;

    try {
        // Update the user profile in Firebase
        await firebase.firestore().collection('Customers').doc(userId).update(updatedUserData);
        res.status(200).json({ message: 'User profile updated successfully' });
      } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update user profile' });
      }

    });



//DO NOT DELETE 
export default router;