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
  router.post('/addTransactionBusiness/:businessUid', async (req, res) => {
    const businessUid = req.params.businessUid;  // Corrected to use the right parameter name
    const { customerName, businessName, customerEmail, paymentMethod, orderTotal, items } = req.body;
  
    const transactionUid = admin.firestore().collection('dummy').doc().id;  // Dummy collection is used to generate ID, make sure this is intentional
    const transactionData = {
      customerName: customerName,
      customerEmail: customerEmail,
      orderTotal: orderTotal,
      items: items,
      businessName: businessName,
      dateOfpurchase: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: paymentMethod,
      uid: transactionUid
    };
  
    try {
      // Get a reference to the business document
      const businessDocRef = admin.firestore().collection('Business').doc(businessUid);
  
      // Correctly use the document ID to set the transaction data
      await businessDocRef.collection('Transaction').doc(transactionUid).set(transactionData);
  
      // Respond to the client with the correct ID
      res.status(201).send({
          message: 'Transaction successfully created for business',
          transactionUid: transactionUid  // Corrected the key here from productId to transactionUid
      });
    } catch (error) {
      console.error('Error creating Transaction:', error);
      res.status(500).send({ message: 'Failed to create transaction for business', error: error.message });
    }
  });
  

  router.post('/addTransactionCustomer/:customerUid', async (req, res) => {
    const customerUid = req.params.customerUid;  // Extract the customer UID from the route parameters
    const { customerName, businessName, customerEmail, paymentMethod, orderTotal, items } = req.body;
  
    const transactionUid = admin.firestore().collection('dummy').doc().id;  // Generating an ID for the transaction
    const transactionData = {
      customerName: customerName,
      customerEmail: customerEmail,
      orderTotal: orderTotal,
      items: items,
      businessName: businessName,
      dateOfpurchase: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: paymentMethod,
      uid: transactionUid
    };
  
    try {
      // Get a reference to the customer document
      const customerDocRef = admin.firestore().collection('Customers').doc(customerUid);
  
      // Add the transaction to the 'Transaction' subcollection of this customer
      await customerDocRef.collection('Transaction').doc(transactionUid).set(transactionData);
  
      // Respond to the client
      res.status(201).send({
          message: 'Transaction successfully created',
          transactionUid: transactionUid
      });
    } catch (error) {
      console.error('Error creating Transaction:', error);
      res.status(500).send({ message: 'Failed to create transaction', error: error.message });
    }
  });
  


router.get('/getTransactionBusiness/:uid', async (req, res)=>{
   const businessUid = req.params.uid; // UID for business

    try {
        // Get a reference to the business document
        const businessRef = db.collection('Business').doc(businessUid);

        // Attempt to retrieve the Products subcollection
        const transactionSnapshot = await businessRef.collection('transactions').get();

        if (transactionSnapshot.empty) {
            // If there are no transaction found
            res.status(404).send({ message: 'No transaction found for this business' });
        } else {
            // Collect all transaction into an array
            const transactions = transactionSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Send back the array of transactions
            res.status(200).json(transactions);
        }
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).send({ message: 'Failed to get transaction', error: error.message });
    }
});

router.get('/getTransactionsCustomers/:uid', async (req, res)=>{
    const customerUid = req.params.uid;
    try {
      const customerRef = db.collection('Customer').doc(customerUid);

      const transactionSnapshot = await customerRef.collection('transaction').get();

      if (transactionSnapshot.empty) {
        // If there are no transaction found
        res.status(404).send({ message: 'No transaction found for this business' });
      } else {
        //collect all transaction into array
        const transactions = transactionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      // Send back the array of transactions
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).send({ message: 'Failed to get transaction', error: error.message });
    }
})


//DO NOT DELETE 
export default router;