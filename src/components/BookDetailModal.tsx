import React, { useState } from 'react';
import { Book, StudentProfile, MoroccanPaymentMethod, PaymentDetails } from '../types';
import { MoroccanCheckoutModal } from './MoroccanCheckoutModal';
import { triggerBrowserDownload, generateCourseSummaryText } from '../utils/downloadHelper';
import {
  X,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Receipt,
  GraduationCap,
  Landmark,
  CheckCircle,
  CreditCard,
  Building2,
  Wallet,
  Download,
  ShoppingBag,
  Share2,
} from 'lucide-react';
import { generateDefaultCoverSvg } from '../utils/storage';
import { BookShareModal } from './BookShareModal';

interface BookDetailModalProps {
  book: Book;
  student: StudentProfile;
  isAcquired: boolean;
  adminRib?: string;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onAcquire: (
    bookId: string,
    method?: MoroccanPaymentMethod,
    details?: PaymentDetails,
    drmCode?: string
  ) => void;
  lang: 'fr' | 'ar';
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  student,
  isAcquired,
  adminRib = '011 780 0000 998877665544 90',
  onClose,
  onOpenReader,
  onAcquire,
  lang,
}) => {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [syllabusDownloaded, setSyllabusDownloaded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDownloadSyllabus = () => {
    const text = generateCourseSummaryText({
      title: book.title,
      titleAr: book.titleAr,
      author: book.author,
      university: book.university,
      facultyLabel: book.facultyLabel,
      semester: book.semester,
      totalPages: book.totalPages,
      isbn: book.isbn,
      description: book.description,
      studentName: student.fullName || 'Étudiant Visiteur',
      studentId: student.studentId || 'ETU-2026',
      drmLicenseKey: isAcquired ? (student.drmLicenseKey || 'LICENCE-ACTIVE') : 'SPECIMEN-ACADEMIQUE-AUTORISE',
    });

    const safe = book.title.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    const ok = triggerBrowserDownload(`Plan_Cours_${safe}.txt`, text, 'text/plain;charset=utf-8');
    if (ok) {
      setSyllabusDownloaded(true);
      setTimeout(() => setSyllabusDownloaded(false), 3500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
            {/* Left Column: Book Cover & Quick Meta */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div
                onClick={() => {
                  if (isAcquired) {
                    onClose();
                    onOpenReader(book);
                  } else if (book.isFree) {
                    onAcquire(book.id);
                  } else {
                    setIsCheckoutModalOpen(true);
                  }
                }}
                className="group/detailCover relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100 cursor-pointer"
                title={
                  isAcquired
                    ? (lang === 'fr' ? 'Cliquer pour ouvrir le cours' : 'انقر للمطالعة في القارئ المشفر')
                    : (lang === 'fr' ? 'Cliquer pour accéder au cours au tarif préférentiel' : 'انقر على الغلاف للاقتناء بالتعريفة التفضيلية للطلبة')
                }
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = generateDefaultCoverSvg(
                      book.title,
                      book.author,
                      book.faculty
                    );
                  }}
                  className="w-full h-full object-cover group-hover/detailCover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Interactive Acquisition / Read Overlay */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover/detailCover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-center">
                  {isAcquired ? (
                    <span className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Lire dans le Lecteur' : 'فتح المقرر'}</span>
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Tarif Préférentiel Étudiant' : 'اقتناء بالتعريفة التفضيلية'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* License details */}
              <div className="w-full mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Protocole DRM Universitaire' : 'حماية رقمية مشددة مانعة للنسخ'}</span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {lang === 'fr'
                    ? 'Consultation in-app exclusive. Impression et capture d\'écran strictement bloquées conformément aux droits de propriété intellectuelle.'
                    : 'مطالعة تفاعلية داخل التطبيق حصراً. طباعة المستند وتصوير الشاشة محجوب بنظام حماية مشفر للحفاظ على حقوق المؤلف.'}
                </p>
              </div>
            </div>

            {/* Right Column: Book Details & Central Payment */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-stone-100 text-stone-700">
                    {book.facultyLabel}
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-900">
                    {book.semester}
                  </span>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-800">
                    {book.edition}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug mb-1">
                  {book.title}
                </h1>
                {book.titleAr && (
                  <h2 className="text-base font-bold text-stone-600 mb-2">
                    {book.titleAr}
                  </h2>
                )}

                <div className="flex items-center gap-2 text-xs text-stone-600 mb-4 pb-3 border-b border-stone-200">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-stone-900">{book.author}</span>
                  <span>·</span>
                  <span>{book.university}</span>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
                    {lang === 'fr' ? 'Présentation du cours' : 'توصيف المقرر والأهداف'}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Moroccan Payment Systems Overview Box */}
                {!book.isFree && !isAcquired && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-sky-50/80 border border-amber-200/90 rounded-2xl mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <Landmark className="w-4 h-4 text-amber-700" />
                        <span>{lang === 'fr' ? 'Systèmes de Paiement & Encaissement Maroc' : 'أنظمة الأداء والتحصيل المعتمدة بالمغرب'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-bold">
                        {lang === 'fr' ? 'Disponible pour tous les étudiants' : 'متاح للجميع حتى بدون بطاقة'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 pt-1">
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 rounded-lg border border-stone-200/80">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span><strong>CMI / Carte :</strong> 3D-Secure</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 rounded-lg border border-stone-200/80">
                        <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span><strong>Virement :</strong> Attijari / CIH</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 rounded-lg border border-stone-200/80">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Cash (Sans Carte) :</strong> Wafacash</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 rounded-lg border border-stone-200/80">
                        <Wallet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span><strong>M-Wallet :</strong> MT Cash / Orange</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase / Action Section */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[11px] text-stone-500">
                      {lang === 'fr' ? 'Tarif étudiant négocié' : 'السعر المعتمد للطلبة'}
                    </div>
                    {book.isFree ? (
                      <div className="text-xl font-black text-emerald-700">
                        {lang === 'fr' ? 'Gratuit (Open-Access)' : 'مجاني تماماً'}
                      </div>
                    ) : (
                      <div className="text-2xl font-black text-stone-900 tabular-nums">
                        {book.priceMAD}{' '}
                        <span className="text-xs font-semibold text-stone-500">
                          {lang === 'fr' ? 'MAD / Dirhams' : 'درهم مغربي'}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAcquired && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'fr' ? 'Livre dans votre bibliothèque' : 'متاح في رصيدك'}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {isAcquired ? (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(book);
                        }}
                        className="flex-1 py-3 px-4 bg-stone-950 hover:bg-stone-850 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'fr' ? 'Ouvrir dans le Lecteur Sécurisé' : 'بدء القراءة الآمنة'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="py-3 px-3.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title={lang === 'fr' ? 'Partager le lien du cours avec vos camarades pour bénéficier du tarif préférentiel' : 'تقاسم رابط المقرر مع الزملاء للتسجيل بالمنصة والاستفادة من التعريفة التفضيلية'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>{lang === 'fr' ? 'Partager le cours' : 'تقاسم المقرر'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReader(book);
                        }}
                        className="py-3 px-4 border border-stone-300 hover:border-stone-400 text-stone-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          {lang === 'fr'
                            ? `Consulter l'extrait (P. 1-${book.sampleMaxPage})`
                            : `معاينة العينة (ص 1-${book.sampleMaxPage})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSyllabus}
                        className={`py-3 px-3.5 border font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          syllabusDownloaded
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'border-stone-300 hover:border-stone-400 text-stone-700 bg-stone-50'
                        }`}
                        title="Télécharger le plan officiel et syllabus du cours"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                        <span>{syllabusDownloaded ? (lang === 'fr' ? 'Fiche téléchargée !' : 'تم التحميل!') : (lang === 'fr' ? 'Plan du cours' : 'بطاقة المقرر')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="py-3 px-3.5 border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title={lang === 'fr' ? 'Partager le lien du cours pour inscription et accès au tarif préférentiel' : 'تقاسم رابط المقرر للتسجيل والاستفادة من التعريفة التفضيلية للطلبة'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>{lang === 'fr' ? 'Partager le cours' : 'تقاسم المقرر'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (book.isFree) {
                            onAcquire(book.id);
                          } else {
                            setIsCheckoutModalOpen(true);
                          }
                        }}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {book.isFree
                            ? lang === 'fr'
                              ? 'Activer le polycopié gratuit'
                              : 'تفعيل المطبوع مجاناً'
                            : lang === 'fr'
                            ? `Activer la Licence Étudiant (${book.priceMAD} DH)`
                            : `تفعيل الترخيص الأكاديمي (${book.priceMAD} درهم)`}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Moroccan Payment Gateway Modal */}
      {isCheckoutModalOpen && (
        <MoroccanCheckoutModal
          book={book}
          student={student}
          adminRib={adminRib}
          onClose={() => setIsCheckoutModalOpen(false)}
          onSuccess={(method, details, drmCode) => {
            onAcquire(book.id, method, details, drmCode);
            setIsCheckoutModalOpen(false);
          }}
          lang={lang}
        />
      )}

      {/* Book Share Modal */}
      <BookShareModal
        book={book}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
        sharedBy="student"
        onPreviewBook={(b) => {
          setIsShareModalOpen(false);
          onOpenReader(b);
        }}
      />
    </>
  );
};
