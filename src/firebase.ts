// استدعاء الدوال الأساسية من مكتبة فايربيز
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// إعدادات الاتصال الخاصة بتطبيقك
const firebaseConfig = {
  apiKey: "AIzaSyAme2_8CbbQWYRrHELYbhnhWOK5HAwrnR0",
  authDomain: "fac-en-pdf.firebaseapp.com",
  projectId: "fac-en-pdf",
  storageBucket: "fac-en-pdf.firebasestorage.app",
  messagingSenderId: "856507614335",
  appId: "1:856507614335:web:3e9a54c4fedd1f282dab4a"
};

// تهيئة الاتصال بفايربيز
const app = initializeApp(firebaseConfig);

// تفعيل وتصدير الخدمات لنستخدمها في باقي ملفات المشروع
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
