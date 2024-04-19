// For Customer related Processing
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();
const db = admin.firestore();

//Might need to integrate storage bucket here for pictures
//Look at old IT database site for examples as to how you added in photos.

//first endpoint should be inserting a new product into a business
/**
 * Logic should follow like this
 *
 *  uid of user is sent here along with a json file with the records for a new product as input
 *  first it should check to see if there is a collection within the record called products
 *  if so preceed as normal
 *  if not then create the collection and proceed
 *
 * it should then insert the record into the collection along with a uid
 * if successful send back a messsage stating success
 * if not send a error code along with failure message
 */

//
router.post('/create/:uid', async (req, res) => {
    const businessUid = req.params.uid; // This is the UID of the business
    const { name, price } = req.body;

    // Generate a new UID for the product or you can let Firestore generate it automatically
    const productUid = admin.firestore().collection('dummy').doc().id;

    const productData = {
        name,
        price,
        uid: productUid // this is the new uid generated for the product
    };

    try {
        // Get a reference to the business document
        const businessDocRef = admin.firestore().collection('Business').doc(businessUid);

        // Add the product to the 'Products' subcollection of this business
        await businessDocRef.collection('Products').doc(productUid).set(productData);

        // Respond to the client
        res.status(201).send({
            message: 'Product successfully created',
            productId: productUid
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send({ message: 'Failed to create product', error: error.message });
    }
});


//second endpoint should be reteriving data from collection
/**
 * Logic should follow like this
 * using uid of business as input
 * if user is found and there a collection called Products in it
 * grab everything from collection
 * if uid cannot be found send back error message
 * otherwise send back everything within that collection
 */
router.get('/getProductData/:uid', async (req, res) => {
    const businessUid = req.params.uid; // UID for business

    try {
        // Get a reference to the business document
        const businessRef = db.collection('Business').doc(businessUid);

        // Attempt to retrieve the Products subcollection
        const productsSnapshot = await businessRef.collection('Products').get();

        if (productsSnapshot.empty) {
            // If there are no products found
            res.status(404).send({ message: 'No products found for this business' });
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
        console.error('Error getting products:', error);
        res.status(500).send({ message: 'Failed to get products', error: error.message });
    }
});



//This just updates the price of the product

router.put('/updateProductRecord/:businessUid/:productUid', async (req, res)=>{
    const businessUid = req.params.businessUid;
    const productUid = req.params.productUid;
    const { price } = req.body;  // Assuming new price is sent in the request body

    const productDocRef = admin.firestore()
    .collection('Business')
    .doc(businessUid)
    .collection('Products')
    .doc(productUid);

    try{
            // Check if the product exists before deleting
        const productSnapshot = await productDocRef.get();
        if (!productSnapshot.exists) {
        return res.status(404).json({ message: "Product not found" });
        }

        //Update the price field of the document
        await productDocRef.update({
            price: price
        });

        res.status(200).send({
            message: 'Product price updated successfully',
            productId: productUid,
            newPrice: price
        });
    }catch(error){
        console.error('Error updating product:', error);
        res.status(500).send({ message: 'Failed to update product', error: error.message });
    }
});

//endpoint to delete a product
router.delete('/deleteProductRecord/:businessUid/:productUid', async (req, res)=>{
    const businessUid = req.params.businessUid;
    const productUid = req.params.productUid;
    try{
        const productDocRef = admin.firestore()
        .collection('Business')
        .doc(businessUid)
        .collection('Products')
        .doc(productUid);

            // Check if the product exists before deleting
        const productSnapshot = await productDocRef.get();
        if (!productSnapshot.exists) {
            return res.status(404).json({ message: "Product not found" });
        }

        await productDocRef.delete();

        return res.status(200).json({ message: "Product deleted successfully" });

    }catch (error){
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product" });

    }
});
export default router;