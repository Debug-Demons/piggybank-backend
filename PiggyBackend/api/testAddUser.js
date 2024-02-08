import { db } from '../config/firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';

async function testAddUser() {
  try {
    const docRef = await addDoc(collection(db, "Customers"), {
      Address: "1 Coding Lane",
      Email: "adalovelace3@gmail.com",
      name: { // Using a map to represent the name
        first: "Ada",
        last: "Lovelace"
      },
      accountCreationDate: "02/03/2024",
      dateOfBirth: "1816",
      phoneNumber: "0101010102"
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

testAddUser();
