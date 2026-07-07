// Cấu trúc tích hợp Firebase Realtime Database (SDK v10+)
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push } from "firebase/database";

// Thông tin cấu hình Firebase của bạn (Lấy từ Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
export const database = getDatabase(app);

// Ví dụ hàm thêm học sinh mới vào Firebase
export const addStudentToFirebase = (classId: string, studentData: any) => {
  const classRef = ref(database, `classes/${classId}/students`);
  const newStudentRef = push(classRef);
  return set(newStudentRef, studentData);
};

// Ví dụ hàm lắng nghe danh sách học sinh theo thời gian thực
export const listenToClassStudents = (classId: string, callback: (data: any) => void) => {
  const classRef = ref(database, `classes/${classId}/students`);
  onValue(classRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
