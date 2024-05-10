//For manlipulating transactions with firestore.
//Need to talk with josh for some clearfications 
//For Customer related Processing
// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) { // Checks if admin is not already initialized
    const serviceAccount = require('../');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore(); 



//This adds a transaction to business user
router.post('/addTransactionBusiness/:uid', async (req, res) => {
  const businessUid = req.params.uid;
  const { customerName, businessName,  paymentMethod, orderTotal, items } = req.body;

  // Generate a unique ID for the transaction
  const transactionUid = admin.firestore().collection('dummy').doc().id;

  // Transaction data structure
  const transactionData = {
    customerName,
    orderTotal,
    items,
    businessName,
    dateOfpurchase: admin.firestore.FieldValue.serverTimestamp(),
    paymentMethod,
    uid: transactionUid
  };

  try {
    // Get a reference to the business document
    const businessDocRef = admin.firestore().collection('Business').doc(businessUid);

    // Add the product to the 'Products' subcollection of this business
    await businessDocRef.collection('Transaction').doc(productUid).set(productData);

    // Respond to the client
    res.status(201).send({
        message: 'Transaction successfully created',
        productId: productUid
    });
} catch (error) {
    console.error('Error creating Transaction:', error);
    res.status(500).send({ message: 'Failed to create Transaction', error: error.message });
}
});






  router.get('/getTransactionDataBusiness/:uid', async (req, res) => {
    const businessUid = req.params.uid; // UID for business

    try {
        // Get a reference to the business document
        const businessRef = db.collection('Business').doc(businessUid);

        // Attempt to retrieve the Products subcollection
        const productsSnapshot = await businessRef.collection('Transaction').get();

        if (productsSnapshot.empty) {
            // If there are no products found
            res.status(404).send({ message: 'No Transactions found for this business' });
        } else {
            // Collect all products into an array
            const products = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Send back the array of products
            res.status(200).json(products);
        }
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).send({ message: 'Failed to get transaction', error: error.message });
    }
});
 



//DO NOT DELETE 
export default router;