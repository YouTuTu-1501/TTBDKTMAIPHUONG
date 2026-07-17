import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, "admin@school.edu.vn", "123456");
    await setDoc(doc(db, "users", cred.user.uid), {
      email: "admin@school.edu.vn",
      role: "admin",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Tài khoản Admin đã được tạo thành công!");
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log("✅ Tài khoản admin@school.edu.vn đã tồn tại trong hệ thống.");
    } else {
      console.error("Lỗi:", e.message);
    }
  }
  process.exit();
}

seed();
