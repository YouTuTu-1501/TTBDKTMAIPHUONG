import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Tạm thời import config nội bộ cho AI Studio preview
import fallbackConfig from '../../firebase-applet-config.json';

// Cấu hình linh hoạt: Ưu tiên dùng biến môi trường (cho GitHub Pages)
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

// Xác định Database ID: 
// - Nếu có cấu hình VITE_FIREBASE_PROJECT_ID (tức là đang dùng dự án Firebase riêng của user trên Github Pages), mặc định database là "(default)"
// - Nếu không (đang chạy trong AI Studio), dùng ID của AI Studio
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID 
             || (import.meta.env.VITE_FIREBASE_PROJECT_ID ? '(default)' : fallbackConfig.firestoreDatabaseId);

const app = initializeApp(config);
const db = getFirestore(app, dbId);
const auth = getAuth(app);

export { db, auth };
