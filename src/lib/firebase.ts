import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDIUX_yjHxjtK9IkZ-xaJfdpRIJB5RL0m8",
  authDomain: "ttbdktmaiphuong.firebaseapp.com",
  databaseURL: "https://ttbdktmaiphuong-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ttbdktmaiphuong",
  storageBucket: "ttbdktmaiphuong.firebasestorage.app",
  messagingSenderId: "1031860568801",
  appId: "1:1031860568801:web:df08fa02bce7e9708eada0",
  measurementId: "G-ZTYX341NNG"
};

const app = initializeApp(firebaseConfig);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const db = getFirestore(app);
const auth = getAuth(app);
const secondaryAuth = getAuth(secondaryApp);

export { db, auth, secondaryAuth };
