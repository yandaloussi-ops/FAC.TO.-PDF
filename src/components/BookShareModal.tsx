import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import QRCode from 'qrcode';
import {
  Share2,
  QrCode,
  Copy,
  Check,
  Download,
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Send,
  UserCheck,
} from 'lucide-react';

interface BookShareModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'ar';
  sharedBy?: 'professor' | 'student';
  onPreviewBook?: (book: Book) => void;
}

export const BookShareModal: React.FC<BookShareModalProps> = ({
  book,
  isOpen,
  onClose,
  lang,
  sharedBy = 'professor',
  onPreviewBook,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  if (!isOpen || !book) return null;

  // Build the direct permalink for this book
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}#course=${encodeURIComponent(book.id)}`;

  // Generate QR Code data URL on open or when book changes
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(
      shareUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#1c1917', // stone-900
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && isMounted && url) {
          setQrDataUrl(url);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [shareUrl]);

  // Formatted academic announcement message for WhatsApp / Telegram / Groups
  const announcementMessage =
    lang === 'fr'
      ? `📚 Polycopié Universitaire Officiel sur FAC en PDF\n\n` +
        `📖 Titre du cours : ${book.title}\n` +
        `👨‍🏫 Enseignant : ${book.author} (${book.authorTitle || 'Enseignant-Chercheur'})\n` +
        `🏛️ Établissement : ${book.facultyLabel || book.faculty}\n` +
        `🎓 Tarif préférentiel subventionné réservé aux étudiants : ${book.isFree || book.priceMAD === 0 ? 'Gratuit' : `${book.priceMAD} MAD`}\n` +
        `🔒 Consultation in-app sécurisée DRM protégée\n\n` +
        `👉 Lien d'inscription pour bénéficier du tarif préférentiel étudiant et accéder au cours :\n${shareUrl}`
      : `📚 مقرر جامعي معتمد على تطبيق FAC en PDF\n\n` +
        `📖 المقرر: ${book.titleAr || book.title}\n` +
        `👨‍🏫 الأستاذ: ${book.author} (${book.authorTitle || 'أستاذ باحث'})\n` +
        `🏛️ المؤسسة: ${book.facultyLabel || book.faculty}\n` +
        `🎓 التعريفة التفضيلية المدعومة المخصصة للطلبة: ${book.isFree || book.priceMAD === 0 ? 'مجاني بالكامل' : `${book.priceMAD} درهم مغربي`}\n` +
        `🔒 مطالعة تفاعلية محمية داخل التطبيق بحسابك الأكاديمي\n\n` +
        `👉 رابط التسجيل والانخراط للاستفادة من الأثمنة التفضيلية للطلبة والدخول التلقائي للاقتناء:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleCopyAnnouncement = async () => {
    try {
      await navigator.clipboard.writeText(announcementMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Cours-${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(announcementMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      lang === 'fr'
        ? `Lien d'inscription et accès au cours "${book.title}" de ${book.author} sur FAC en PDF`
        : `رابط التسجيل والانخراط لمقرر "${book.titleAr || book.title}" للأستاذ ${book.author} على FAC en PDF`
    )}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Academic Prestige Branding */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-amber-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {lang === 'fr' ? 'Partager le Lien du Cours Universitaire' : 'تقاسم ونشر رابط المقرر الأكاديمي'}
                </h2>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  {lang === 'fr' ? 'Tarif Préférentiel Étudiant' : 'تعريفة تفضيلية للطلبة'}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                {sharedBy === 'professor'
                  ? lang === 'fr'
                    ? 'Partagez le lien avec vos étudiants : ils s\'inscrivent pour bénéficier du tarif préférentiel puis accèdent à l\'acquisition'
                    : 'شارك رابط المقرر مع طلبتك: يتيح التسجيل أولاً للاستفادة من الأثمنة التفضيلية المدعومة للطلبة ثم الدخول التلقائي للاقتناء'
                  : lang === 'fr'
                  ? 'Partagez cette référence avec vos camarades pour qu\'ils bénéficient du tarif préférentiel étudiant'
                  : 'تقاسم رابط المرجع مع زملائك للاستفادة من التعريفة التفضيلية المخصصة للطلبة والمذاكرة الجماعية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={lang === 'fr' ? 'Fermer' : 'إغلاق'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Pedagogical Guidance Notice */}
          <div className="p-4 bg-gradient-to-r from-sky-50 to-amber-50/70 border border-sky-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-stone-800 leading-relaxed">
              <span className="font-bold text-sky-950 block mb-0.5">
                {lang === 'fr'
                  ? '🎓 Parcours Étudiant : Inscription Préalable & Tarif Préférentiel Subventionné'
                  : '🎓 مسار الطالب: التسجيل أولاً للاستفادة من التعريفة التفضيلية المدعومة للطلبة ثم الاقتناء التلقائي'}
              </span>
              <p className="text-[11px] text-stone-600">
                {lang === 'fr'
                  ? 'Ce lien et QR code dirigent l\'étudiant en premier lieu vers le formulaire d\'inscription afin de valider son statut académique et bénéficier de la tarification préférentielle subventionnée. Une fois son compte validé, l\'étudiant accède automatiquement au module pour finaliser son acquisition et débloquer sa lecture sécurisée.'
                  : 'يوجه هذا الرابط ورمز QR الطالب أولاً إلى مطبوع التسجيل والانخراط بالمنصة لإثبات صفته الجامعية والاستفادة من الأثمنة التفضيلية المدعومة المخصصة للطلبة، ومن ثمة يتم تحويله تلقائياً لعملية اقتناء رخصته وتفعيل مطالعته التفاعلية المحمية.'}
              </p>
            </div>
          </div>

          {/* 1. VISUAL BOOK CARD PREVIEW ("يظهر الرابط على شكل صورة غلاف الكتاب لذى الطلبة كما في المكتبة") */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>
                  {lang === 'fr'
                    ? 'Aperçu de la carte du livre (tel qu\'il s\'affiche aux étudiants dans la bibliothèque)'
                    : 'معاينة بطاقة المرجع (كما تظهر للطلبة في المكتبة عند فتح الرابط)'}
                </span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {lang === 'fr' ? 'Accès In-App' : 'غلاف تفاعلي'}
              </span>
            </div>

            {/* The Book Card Preview */}
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Cover Image */}
              <div className="relative shrink-0 group">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-24 sm:w-28 h-32 sm:h-38 object-cover rounded-xl shadow-md border border-stone-200 group-hover:scale-102 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1.5 left-1.5 bg-stone-900/85 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                  {book.isFree || book.priceMAD === 0 ? 'Gratuit' : `${book.priceMAD} DH`}
                </div>
              </div>

              {/* Book Info */}
              <div className="flex-1 min-w-0 text-center sm:text-start space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[10px]">
                  <span className="font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                    {book.facultyLabel || book.faculty}
                  </span>
                  <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {book.semester}
                  </span>
                  <span className="font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>DRM Protégé</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-stone-900 leading-snug">
                  {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
                </h3>

                <div className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold text-stone-800">{book.author}</span>
                  <span className="text-[11px] text-stone-400">({book.authorTitle || 'Enseignant'})</span>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>

                {/* Direct Action */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {onPreviewBook && (
                    <button
                      type="button"
                      onClick={() => onPreviewBook(book)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'S\'inscrire & Accéder au Cours' : 'التسجيل والاستفادة من التعريفة التفضيلية'}</span>
                    </button>
                  )}
                  <span className="text-[11px] text-stone-500">
                    {lang === 'fr'
                      ? 'L\'étudiant valide son statut pour accéder au tarif préférentiel subventionné.'
                      : 'يسجل الطالب لفتح حسابه والاستفادة من التعريفة التفضيلية للطلبة.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. QR CODE & DIRECT LINK ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Code Column */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-2">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>{lang === 'fr' ? 'QR Code Officiel du Cours' : 'رمز الاستجابة السريعة (QR)'}</span>
              </div>

              {qrDataUrl ? (
                <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-stone-200 mb-3">
                  <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 object-contain" />
                </div>
              ) : (
                <div className="w-36 h-36 bg-stone-200 rounded-2xl animate-pulse flex items-center justify-center mb-3 text-xs text-stone-500">
                  Génération QR...
                </div>
              )}

              <p className="text-[10px] text-stone-500 max-w-xs mb-3 leading-relaxed">
                {lang === 'fr'
                  ? 'Idéal pour l\'amphi ou le syllabus. Le scan mène à l\'inscription et au tarif préférentiel.'
                  : 'امسحه بكاميرا الهاتف للوصول الفوري، أو اطبعه في مطبوع المحاضرات أو اعرضه في سلايدات الدرس.'}
              </p>

              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl}
                className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? 'Télécharger le QR (PNG)' : 'تحميل صورة QR Code'}</span>
              </button>
            </div>

            {/* Direct Link & Social Quick Share */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>{lang === 'fr' ? 'Lien d\'Accès au Cours (Tarif Préférentiel)' : 'رابط المقرر (للتسجيل والاستفادة من التعريفة التفضيلية)'}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    {lang === 'fr' ? 'Accès Étudiant' : 'مخصص للطلبة'}
                  </span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 p-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                    title={lang === 'fr' ? 'Copier le lien' : 'نسخ الرابط'}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? (lang === 'fr' ? 'Copié !' : 'تم النسخ') : (lang === 'fr' ? 'Copier' : 'نسخ')}</span>
                  </button>
                </div>
              </div>

              {/* Social / Class Group Sharing */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-stone-700">
                  {lang === 'fr' ? 'Partager sur les groupes d\'étudiants :' : 'مشاركة فورية مع مجموعات الطلبة :'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTelegram}
                    className="py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-sky-200" />
                    <span>Telegram</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAnnouncement}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    copiedText
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-stone-300 hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  {copiedText ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>
                    {copiedText
                      ? lang === 'fr'
                        ? 'Message complet copié !'
                        : 'تم نسخ نص الإعلان بالكامل!'
                      : lang === 'fr'
                      ? 'Copier le message d\'annonce complet'
                      : 'نسخ الإعلان الجاهز لمجموعات الدراسة'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'fr'
                ? 'L\'inscription préalable permet de certifier le statut d\'étudiant et d\'accéder à la lecture sécurisée in-app.'
                : 'التسجيل الأكاديمي يتيح إثبات صفة الطالب والاستفادة من التعريفة التفضيلية والمطالعة الآمنة.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};
