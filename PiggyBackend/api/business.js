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


router.post('/create', async (req, res) => {
    // Extract user and customer information from request body
    const { email, password,  name, phoneNumber, address, businessType ,industryType} = req.body;
  
    try {
        // Create a new user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Prepare customer information for Firestore
        const businessInfo = {
            email,
            uid: userRecord.uid, // Use the UID provided by Firebase Auth
            name, //Not an object like customer
            accountCreationDate: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
            businessType,
            industryType,
            phoneNumber,
            address,
        };

        // Add the customer record to the 'customers' collection in Firestore
        await admin.firestore().collection('Business').doc(userRecord.uid).set(businessInfo);

        // Respond to the client
        res.status(201).send({
            message: 'Successfully created new user and business record',
            uid: userRecord.uid,
        });
    } catch (error) {
        console.error('Error creating new user and customer record:', error);
        res.status(500).send({ message: 'Failed to create user and business record', error: error.message });
    }
});








//DO NOT DELETE 
export default router;