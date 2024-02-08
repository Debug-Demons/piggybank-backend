// src/controllers/UserController.js
const firebase = require('../config/firebaseConfig');
const { collection, addDoc } = require('firebase/firestore');

const createUser = async (req, res) => {
  try {
    const docRef = await addDoc(collection(firebase.firestore(), "users"), {
      first: req.body.first,
      last: req.body.last,
      born: req.body.born
    });
    res.status(200).send({ message: "User created successfully", userId: docRef.id });
  } catch (e) {
    res.status(400).send({ error: "Error adding user", details: e });
  }
};

module.exports = { createUser };
