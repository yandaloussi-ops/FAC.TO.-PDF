import emailjs from '@emailjs/browser';
import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Upload, CheckCircle2, Loader2, CreditCard, Phone, Key, ShieldCheck, ExternalLink } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  price?: number;
  priceMAD?: number;
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
  adminRib,
  onClose,
  onSuccess,
  lang = 'ar',
}) => {
  const [studentName, setStudentName] = useState(student?.name || '');
  const [studentEmail, setStudentEmail] = useState(student?.email || '');
  const [studentPhone, setStudentPhone] = useState(student?.phone || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [issuedDrmKey, setIssuedDrmKey] = useState<string>('');

  const actualPrice = (book as any)?.priceMAD ?? book?.price ?? 23;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !studentName.trim() || !studentEmail.trim()) {
      alert(lang === 'fr' ? 'Veuillez remplir votre nom, email et joindre le reçu.' : 'يرجى إدخال الاسم، البريد الإلكتروني، وإرفاق صورة وصل الدفع.');
      return;
    }

    setUploading(true);
    try {
      // 1. رفع صورة الوصل إلى Firebase Storage
      const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
      const uploadResult = await uploadBytes(storageRef, receiptFile);
      const receiptUrl = await getDownloadURL(uploadResult.ref);

      // 2. محاولة إرسال إشعار بريدي عبر EmailJS
      try {
        const emailjsServiceId = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EMAILJS_SERVICE_ID) || (import.meta as any)?.env?.VITE_EMAILJS_SERVICE_ID || '';
        const emailjsTemplateId = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) || (import.meta as any)?.env?.VITE_EMAILJS_TEMPLATE_ID || '';
        const emailjsPublicKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) || (import.meta as any)?.env?.VITE_EMAILJS_PUBLIC_KEY || '';

        if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
          const templateParams = {
            student_name: studentName,
            student_email: studentEmail,
            student_phone: studentPhone,
            book_title: book?.title || 'Livre universitaire',
            receipt_url: receiptUrl,
          };

          await emailjs.send(
            emailjsServiceId,
            emailjsTemplateId,
            templateParams,
            emailjsPublicKey
          );
        }
      } catch (emailErr) {
        console.warn('EmailJS notice:', emailErr);
      }

      // 3. توليد مفتاح ترخيص DRM رسمي للطالب
      const generatedDrmKey = `FAC-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setIssuedDrmKey(generatedDrmKey);

      // 4. حفظ كود الـ DRM في Firestore
      await addDoc(collection(db, 'drm_keys'), {
        key: generatedDrmKey,
        bookId: book?.id || '',
        bookTitle: book?.title || '',
        studentEmail: studentEmail.trim().toLowerCase(),
        studentName: studentName.trim(),
        studentPhone: studentPhone.trim(),
        deviceId: null,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // 5. حفظ الطلب في Firestore (paymentOrders) مع تقسيم المستحقات
      const authorCut = Math.round(actualPrice * 0.80 * 100) / 100;
      const platformCut = Math.round(actualPrice * 0.20 * 100) / 100;

      await addDoc(collection(db, 'paymentOrders'), {
        bookId: book?.id || '',
        bookTitle: book?.title || '',
        bookAuthor: (book as any)?.author || '',
        bookPrice: actualPrice,
        authorPart: authorCut,
        platformPart: platformCut,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone.trim(),
        receiptUrl: receiptUrl,
        drmKey: generatedDrmKey,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // 5.5. الربط الآلي الشامل لحساب الطالب في Firestore (Comptes Étudiants)
      try {
        const cleanEmail = studentEmail.trim().toLowerCase();
        const studentDocId = cleanEmail.replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'students', studentDocId), {
          id: studentDocId,
          fullName: studentName.trim(),
          name: studentName.trim(),
          email: cleanEmail,
          phone: studentPhone.trim(),
          status: 'active',
          acquiredBookIds: arrayUnion(book.id),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (stdErr) {
        console.warn('Error auto-syncing student profile:', stdErr);
      }

      // 6. تجهيز رسالة الواتساب الموجهة إلى الإدارة (طلب الشراء دون ذكر المفتاح فيها)
      const adminWhatsApp = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) || (import.meta as any)?.env?.VITE_WHATSAPP_NUMBER || '212645987915';
      const cleanPhone = adminWhatsApp.replace(/[^0-9]/g, '');

      const textMessage = encodeURIComponent(
        `مرحباً إدارة FAC en PDF 🎓\n` +
        `أود تأكيد طلبي لاقتناء المطبوع الجامعي:\n` +
        `📘 الكتاب: ${book?.title}\n` +
        `👤 الاسم الكامل: ${studentName.trim()}\n` +
        `📱 رقم هاتف الطالب: ${studentPhone.trim() || 'غير محدد'}\n` +
        `📧 البريد الأكاديمي: ${studentEmail.trim()}\n` +
        `💰 المبلغ المدفوع: ${actualPrice} درهم\n` +
        `🧾 رابط صورة وصل الدفع (Cash Plus / تحويل):\n${receiptUrl}`
      );

      try {
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${textMessage}`, '_blank');
      } catch (waErr) {
        console.warn('WhatsApp launch error:', waErr);
      }

      // 7. محاولة إرسال إشعار بريدي عبر Resend
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: studentName.trim(),
            studentEmail: studentEmail.trim().toLowerCase(),
            bookTitle: book?.title,
            receiptUrl: receiptUrl,
          }),
        });
      } catch (resendErr) {
        console.warn('Resend notice:', resendErr);
      }

      // 8. استدعاء رد النجاح لفك قفل الكتاب محلياً في حساب الطالب
      if (onSuccess) {
        onSuccess('Cash Plus / Virement Bancaire', { receiptUrl, studentPhone }, generatedDrmKey);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(lang === 'fr' ? 'Une erreur est survenue lors de l\'envoi du reçu.' : 'حدث خطأ أثناء رفع الوصل، يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 text-right space-y-5 relative shadow-2xl text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <CreditCard className="w-3.5 h-3.5" /> الدفع عبر Cash Plus / تحويل بنكي
              </span>
              <h3 className="text-xl font-bold text-white">تأكيد طلب اقتناء المطبوع</h3>
              <p className="text-xs text-slate-400 mt-1">
                الكتاب: <strong className="text-slate-200">{book?.title}</strong> — السعر: <strong className="text-emerald-400">{actualPrice} درهم</strong>
              </p>
            </div>

            {/* الحساب التجاري للإدارة */}
            <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-xs text-slate-200 my-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  رقم حساب Cash Plus:
                </span>
                <span className="font-mono font-bold text-amber-400 text-xs dir-ltr tracking-wider select-all">
                  835780030017922633209157
                </span>
              </div>

              {adminRib && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 font-medium">الحساب البنكي الرسمي (RIB):</span>
                  <span className="font-mono font-bold text-amber-300 text-xs dir-ltr tracking-wider select-all">
                    {adminRib}
                  </span>
                </div>
              )}
            </div>

            {/* نموذج إدخال معلومات الطالب ورفع الوصل */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل للطالب *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="مثال: ذ. فلان الفلاني"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني الجامعي أو الشخصي *</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@uae.ac.ma أو example@gmail.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف (واتساب للتأكيد) *</label>
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">صورة وصل الدفع (Cash Plus أو تحويل بنكي) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  يرجى التقاط صورة واضحة لوصل العملية الورقي أو لقطة شاشة للتحويل.
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 mt-4 cursor-pointer shadow-lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري رفع الوصل وتوليد الترخيص...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>تأكيد الطلب وإرسال الوصل للإدارة</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* شاشة النجاح: تسليم مفتاح التفعيل المؤقت للطالب فوراً على شاشته */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">تم إرسال طلبك بنجاح!</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              تم رفع وصل الدفع وإشعار إدارة المنصة عبر الواتساب. تم تفعيل حسابك ويمكنك قراءة الكتاب كاملاً الآن.
            </p>

            {/* صندوق مفتاح التفعيل المؤقت */}
            <div className="p-4 bg-slate-800/90 border border-emerald-500/30 rounded-xl space-y-2 text-right">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  مفتاح التفعيل الخاص بك:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  نشط ومسجل
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg text-center font-mono font-bold text-emerald-400 text-sm tracking-widest select-all border border-slate-700/80 shadow-inner">
                {issuedDrmKey}
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                تم ربط هذا الترخيص باسمك وبريدك الأكاديمي وجهازك. احتفظ بهذا الرمز للرجوع إليه.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>بدء قراءة الكتاب الآن في القارئ المحمي</span>
              <span>📖</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
