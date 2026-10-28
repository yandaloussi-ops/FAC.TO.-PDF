import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2, Copy, Receipt, CreditCard } from 'lucide-react';
import { Book } from '../types';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MoroccanCheckoutModalProps {
  book: Book;
  onClose: () => void;
  lang?: 'fr' | 'ar';
}

export const MoroccanCheckoutModal: React.FC<MoroccanCheckoutModalProps> = ({
  book,
  onClose,
  lang = 'ar',
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // حساب كاش بلاس المعتمد (يمكن تعديله لاحقاً)
  const CASH_PLUS_ACCOUNT = "CP-9840-2026-N";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(lang === 'ar' ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت' : 'Taille max 5 Mo');
        return;
      }
      setErrorMessage('');
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(CASH_PLUS_ACCOUNT);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setErrorMessage(lang === 'ar' ? 'يرجى إرفاق صورة وصل الإيداع' : 'Veuillez joindre le reçu');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. رفع صورة الوصل إلى Firebase Storage
      const storageRef = ref(storage, `receipts/${Date.now()}_${receiptFile.name}`);
      const uploadResult = await uploadBytes(storageRef, receiptFile);
      const receiptUrl = await getDownloadURL(uploadResult.ref);

      // 2. حفظ طلب الشراء في قاعدة البيانات Firestore
      await addDoc(collection(db, 'paymentOrders'), {
        bookId: book.id,
        bookTitle: book.title,
        bookPrice: book.price || 0,
        studentName,
        studentEmail,
        studentPhone,
        receiptUrl,
        status: 'pending', // حالة الطلب بانتظار موافقة الأدمن
        createdAt: serverTimestamp(),
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting order:', err);
      setIsSubmitting(false);
      setErrorMessage(
        lang === 'ar' 
          ? 'حدث خطأ أثناء رفع الوصل، يرجى المحاولة مرة أخرى.' 
          : 'Erreur lors de l\'envoi du reçu.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'ar' ? 'الدفع عبر كاش بلاس (Cash Plus)' : 'Paiement via Cash Plus'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'تأكيد الشراء وإرسال مفتاح التفعيل' : 'Validation et envoi de clé'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">
                {lang === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Demande envoyée avec succès!'}
              </h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                {lang === 'ar'
                  ? `تم استلام وصل الدفع بنجاح. سيتم مراجعة الوصل وإرسال مفتاح تفعيل كتاب (${book.title}) تلقائياً إلى بريدك الإلكتروني:`
                  : `Votre reçu a été reçu. La clé d'activation pour (${book.title}) sera envoyée à votre email:`}
              </p>
              <div className="p-3 bg-slate-900/60 rounded-xl text-emerald-300 font-mono text-sm border border-slate-700 inline-block">
                {studentEmail}
              </div>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg"
                >
                  {lang === 'ar' ? 'إغلاق النافذة' : 'Fermer'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Book Info Summary */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{book.title}</h4>
                  <p className="text-xs text-slate-400">{book.author}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">
                    {book.price ? `${book.price} DH` : 'مجاني'}
                  </span>
                </div>
              </div>

              {/* Cash Plus Instructions */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
                  <span>{lang === 'ar' ? 'معلومات الإيداع بوكالة كاش بلاس:' : 'Information de dépôt Cash Plus:'}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                  <span className="font-mono text-sm font-bold text-white">{CASH_PLUS_ACCOUNT}</span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedAccount ? (lang === 'ar' ? 'تم النسخ!' : 'Copié!') : (lang === 'ar' ? 'نسخ الحساب' : 'Copier')}
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'الاسم الكامل للطالب' : 'Nom complet'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Votre nom'}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'البريد الإلكتروني (لتلقي مفتاح التفعيل)' : 'Email (pour recevoir la clé)'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'رقم الهاتف' : 'Numéro de téléphone'}
                  </label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="06XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Upload Receipt File */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'صورة وصل الإيداع (Cash Plus)' : 'Reçu de paiement'} *
                  </label>
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center transition-colors bg-slate-900/50">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {receiptPreview ? (
                      <div className="flex items-center justify-center gap-3">
                        <Receipt className="w-8 h-8 text-emerald-400" />
                        <span className="text-xs text-slate-200 font-medium truncate max-w-[200px]">
                          {receiptFile?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-7 h-7 mx-auto text-slate-400" />
                        <p className="text-xs text-slate-300 font-medium">
                          {lang === 'ar' ? 'اضغط هنا لرفع صورة الوصل' : 'Cliquez pour télécharger le reçu'}
                        </p>
                        <p className="text-[10px] text-slate-500">PNG, JPG, PDF (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === 'ar' ? 'جاري رفع الوصل والطلب...' : 'Envoi en cours...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'ar' ? 'تأكيد الطلب وإرسال الوصل' : 'Confirmer et envoyer'}</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
