import emailjs from '@emailjs/browser';
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Upload, CheckCircle2, Loader2, CreditCard } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  price: number;
}

interface MoroccanCheckoutModalProps {
  book: Book;
  student?: { name?: string; email?: string; phone?: string } | null;
  adminRib?: string;
  onClose: () => void;
  onSuccess?: (method: string, details: any, drmCode?: string) => void;
  lang?: string;
}

export const MoroccanCheckoutModal: React.FC<MoroccanCheckoutModalProps> = ({
  book,
  student,
  onClose,
}) => {
  const [studentName, setStudentName] = useState(student?.name || '');
  const [studentEmail, setStudentEmail] = useState(student?.email || '');
  const [studentPhone, setStudentPhone] = useState(student?.phone || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !studentName || !studentEmail) {
      alert('الرجاء إدخال الاسم، البريد الإلكتروني، وإرفاق صورة وصل الإيداع.');
      return;
    }

    setUploading(true);
    try {
      // 1. رفع صورة الوصل إلى Firebase Storage
      const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
      const uploadResult = await uploadBytes(storageRef, receiptFile);
      const receiptUrl = await getDownloadURL(uploadResult.ref);
// 2. إرسال البريد الإلكتروني عبر EmailJS (بحماية try/catch لكي لا يتوقف الكود)
    try {
      const templateParams = {
        student_name: studentName,
        student_email: studentEmail,
        book_title: typeof bookTitle !== 'undefined' ? bookTitle : 'مطبوع',
        receipt_url: receiptUrl,
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
    } catch (emailErr) {
      console.error('خطأ في إرسال البريد:', emailErr);
    }

    // 3. فتح الواتساب في نافذة جديدة (لكي يستمر الكود أسفله في حفظ الطلب في Firestore)
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const textMessage = encodeURIComponent(
      `مرحباً، أود تأكيد طلبي لشراء المطبوع\n` +
      `الاسم: ${studentName}\n` +
      `البريد الإلكتروني: ${studentEmail}\n` +
      `رابط وصل الدفع: ${receiptUrl}`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${textMessage}`, '_blank');
      // 2. حفظ الطلب في Firestore بحالة pending
      await addDoc(collection(db, 'paymentOrders'), {
        bookId: book?.id || '',
        bookTitle: book?.title || '',
        bookPrice: book?.price ?? 0,
        studentName,
        studentEmail,
        studentPhone,
        receiptUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
// إرسال بريد إلكتروني لتأكيد الطلب عبر Resend
try {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName,
      studentEmail,
      bookTitle: book?.title,
      receiptUrl,
    }),
  });
} catch (emailErr) {
  console.error('Failed to send confirmation email:', emailErr);
}
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm dir-rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-right space-y-5 relative shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <CreditCard className="w-3.5 h-3.5" /> الدفع عبر Cash Plus
              </span>
              <h3 className="text-xl font-bold text-white">تأكيد طلب شراء الكتاب</h3>
              <p className="text-xs text-slate-400 mt-1">
                الكتاب: <strong className="text-slate-200">{book.title}</strong> — السعر: <strong className="text-emerald-400">{book.price} DH</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">صورة وصل الإيداع (Cash Plus) *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 mt-4"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إرسال الطلب والوصل...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>إرسال الطلب للمراجعة</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">تم إرسال طلبك بنجاح!</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              تم استلام صورة الوصل بنجاح. سيقوم المسؤول بمراجعة الطلب وتأكيده، وستتلقى مفتاح التفعيل الخاص بك قريباً.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
