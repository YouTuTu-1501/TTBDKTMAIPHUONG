import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIUX_yjHxjtK9IkZ-xaJfdpRIJB5RL0m8",
  authDomain: "ttbdktmaiphuong.firebaseapp.com",
  databaseURL: "https://ttbdktmaiphuong-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ttbdktmaiphuong",
  storageBucket: "ttbdktmaiphuong.firebasestorage.app",
  messagingSenderId: "1031860568801",
  appId: "1:1031860568801:web:df08fa02bce7e9708eada0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDoc(doc(db, 'appData', 'main'));
  if (snap.exists()) {
    const data = snap.data();
    console.log("Students count:", data.students ? data.students.length : 0);
  } else {
    console.log("No data found");
  }
  process.exit();
}
check();
