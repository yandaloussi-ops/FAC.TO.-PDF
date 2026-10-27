"use client";

import { useState } from "react";
import { db, storage } from "./firebase"; // تأكد من مطابقة مسار ملف firebase.ts الخاص بك
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

export default function UploadBook() {
  const [title, setTitle] = useState("");
  const [professor, setProfessor] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("الرجاء اختيار ملف PDF أولاً");

    setUploading(true);

    // 1. تجهيز مسار الرفع في Storage
    const storageRef = ref(storage, `books/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // 2. تتبع تقدم الرفع
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("خطأ في الرفع:", error);
        alert("حدث خطأ أثناء الرفع");
        setUploading(false);
      },
      async () => {
        // 3. سحب رابط التحميل بعد نجاح الرفع
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 4. حفظ البيانات مع الرابط في Firestore
        try {
          await addDoc(collection(db, "books"), {
            title,
            professor,
            secretCode,
            fileUrl: downloadURL,
            createdAt: new Date(),
          });
          alert("تم رفع الكتاب بنجاح!");
          setTitle("");
          setProfessor("");
          setSecretCode("");
          setFile(null);
          setProgress(0);
        } catch (err) {
          console.error("خطأ في قاعدة البيانات:", err);
          alert("تم رفع الملف لكن فشل حفظ البيانات");
        }
        setUploading(false);
      }
    );
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "sans-serif",
      }}
    >
      <h2>لوحة الأستاذ والمسؤول: رفع كتاب جديد</h2>

      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <input
          type="text"
          placeholder="عنوان الكتاب"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: "10px", textAlign: "right", direction: "rtl" }}
        />

        <input
          type="text"
          placeholder="اسم الأستاذ"
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
          required
          style={{ padding: "10px", textAlign: "right", direction: "rtl" }}
        />

        <input
          type="text"
          placeholder="الكود السري (للطلبة)"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
          required
          style={{ padding: "10px", textAlign: "right", direction: "rtl" }}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          required
          style={{ padding: "10px", direction: "rtl" }}
        />

        {uploading && (
          <div
            style={{
              backgroundColor: "#eee",
              borderRadius: "5px",
              height: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                backgroundColor: "#0070f3",
                height: "100%",
                transition: "width 0.3s",
              }}
            ></div>
          </div>
        )}
        {uploading && (
          <p style={{ fontSize: "14px", margin: "0" }}>
            جاري الرفع... {Math.round(progress)}%
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: "10px",
            backgroundColor: uploading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: uploading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {uploading ? "جاري المعالجة..." : "رفع الكتاب"}
        </button>
      </form>
    </div>
  );
}
