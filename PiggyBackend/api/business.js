// For Business related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();


//Endpoint for getting data 
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
        console.error('Error fetching Business user:', error);
        res.status(500).send({ message: 'Failed to retrieve Business data', error: error.message });
    }
});

//endpoint for creating a new business user.
//http://localhost:3000/api/business/create
router.post('/create', async (req, res) => {
    // Extract user and Business information from request body
       //This should match with the data structure of our data model in firestore
       const {
        email,
        password,
        address,
        accountCreationDate,
        businessType,
        industryType,
        name,
        phoneNumber,
        uid  } = req.body;

        //Note this won't have the collections when we first create it. To do that 
  
    try {
        // Create a new user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Prepare customer information for Firestore
        const businessInfo = {
               //This should match with the data structure of our data model in firestore
                accountCreationDate:admin.firestore.FieldValue.serverTimestamp(), //Timestamp with current date of creation. 
                address,
                businessType,
                email,
                industryType,
                name,
                phoneNumber,
                uid: userRecord.uid,

        //Note this won't have the collections when we first create it. To do that we first need the user to create a product
        //To add to the POS System. This would be done on the front end where it will send the information to the expressjs server
        };

        // Add the customer record to the 'Business' collection in Firestore
        await admin.firestore().collection('Business').doc(userRecord.uid).set(businessInfo);

        // Respond to the client
        res.status(201).send({
            message: 'Successfully created new user and business record',
            uid: userRecord.uid,
        });
    } catch (error) {
        console.error('Error creating new user and Business record:', error);
        res.status(500).send({ message: 'Failed to create user and business record', error: error.message });
    }
});




router.put('/updateBusiness/:uid', async(req, res )=>{
    try {

        const userId = req.params.uid;
        const updatedUserData = req.body;
        // Update the user profile in Firebase
        await firebase.firestore().collection('Business').doc(userId).update(updatedUserData);
        res.status(200).json({ message: 'User profile updated successfully' });
      } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Failed to update user profile' });
      }
    });




//DO NOT DELETE 
export default router;