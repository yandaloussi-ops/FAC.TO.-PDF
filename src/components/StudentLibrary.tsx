import React, { useState, useMemo } from 'react';
import { Book, StudentProfile, PaymentOrder } from '../types';
import {
  triggerBrowserDownload,
  generateOfficialReceiptText,
  generateCourseSummaryText,
} from '../utils/downloadHelper';
import {
  BookOpen,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  KeyRound,
  Laptop,
  CheckCircle2,
  Receipt,
  Download,
  Building2,
  Wallet,
  CreditCard,
  Copy,
  Check,
  ShoppingCart,
  UserCheck,
  Edit2,
  Search,
  Filter,
  Share2,
} from 'lucide-react';
import { BookShareModal } from './BookShareModal';

interface StudentLibraryProps {
  student: StudentProfile;
  allBooks: Book[];
  paymentOrders?: PaymentOrder[];
  onOpenReader: (book: Book) => void;
  onExploreCatalog: () => void;
  onRedeemCode: (code: string) => { success: boolean; messageFr: string; messageAr: string };
  onBuyBook?: (book: Book) => void;
  onEditProfile?: () => void;
  onReturnHome?: () => void;
  lang: 'fr' | 'ar';
}

export const StudentLibrary: React.FC<StudentLibraryProps> = ({
  student,
  allBooks,
  paymentOrders = [],
  onOpenReader,
  onExploreCatalog,
  onRedeemCode,
  onBuyBook,
  onEditProfile,
  onReturnHome,
  lang,
}) => {
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'buy_new' | 'receipts'>('books');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sharingBook, setSharingBook] = useState<Book | null>(null);

  // Search & Filter for "Acheter de nouveaux cours"
  const [buySearch, setBuySearch] = useState('');
  const [buyFacultyFilter, setBuyFacultyFilter] = useState('all');

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setRedeemError(null);
    setRedeemSuccess(null);

    const result = onRedeemCode(redeemInput.trim());
    if (result.success) {
      setRedeemSuccess(lang === 'ar' ? result.messageAr : result.messageFr);
      setRedeemInput('');
      setActiveTab('books');
    } else {
      setRedeemError(lang === 'ar' ? result.messageAr : result.messageFr);
    }
  };

  const studentAcquiredIds = Array.isArray(student?.acquiredBookIds)
    ? student.acquiredBookIds
    : [];

  const acquiredBooks = (allBooks || []).filter((b) =>
    b && studentAcquiredIds.includes(b.id)
  );

  const availableToBuyBooks = useMemo(() => {
    return (allBooks || []).filter((b) => b && !studentAcquiredIds.includes(b.id));
  }, [allBooks, studentAcquiredIds]);

  const filteredAvailableBooks = useMemo(() => {
    return availableToBuyBooks.filter((b) => {
      const q = buySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (b.title || '').toLowerCase().includes(q) ||
        (b.titleAr || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.facultyLabel || b.faculty || '').toLowerCase().includes(q);

      const matchFaculty =
        buyFacultyFilter === 'all' ||
        b.faculty === buyFacultyFilter ||
        (b.facultyLabel || b.faculty || '').toLowerCase().includes(buyFacultyFilter);

      return matchSearch && matchFaculty;
    });
  }, [availableToBuyBooks, buySearch, buyFacultyFilter]);

  const studentOrders = (paymentOrders || []).filter(
    (o) => o && ((student?.email && o.studentEmail === student.email) || (student?.studentId && o.studentId === student.studentId))
  );

  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const handleDownloadReceipt = (ord: PaymentOrder) => {
    const content = generateOfficialReceiptText({
      orderRef: ord.orderRef,
      bookTitle: ord.bookTitle || 'Polycopié Universitaire',
      author: 'Auteur Enseignant Titulaire',
      university: student?.university || 'Université Marocaine',
      faculty: student?.faculty || 'Faculté Universitaire',
      studentName: student?.fullName || 'Étudiant',
      studentId: student?.studentId || 'ETU-2026',
      studentEmail: student?.email || 'etudiant@univ.ac.ma',
      amountMAD: ord.amountMAD || 0,
      paymentMethod: ord.paymentMethod || 'Paiement Sécurisé',
      drmKey: ord.drmKeyGenerated || 'DRM-KEY',
      date: ord.date || new Date().toISOString(),
      deviceId: student?.registeredDevice || 'TERMINAL-PC-01-SECURE',
    });

    const ok = triggerBrowserDownload(
      `Quittance_Officielle_${ord.orderRef}.txt`,
      content,
      'text/plain;charset=utf-8'
    );

    if (ok) {
      setDownloadSuccessToast(
        lang === 'fr'
          ? `Quittance ${ord.orderRef} téléchargée avec succès !`
          : `تم تحميل الإيصال الرسمي ${ord.orderRef} بنجاح!`
      );
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    }
  };

  const handleDownloadCourseSummary = (book: Book) => {
    const content = generateCourseSummaryText({
      title: book.title || 'Support de Cours',
      titleAr: book.titleAr || book.title || 'مقرر جامعي',
      author: book.author || 'Auteur Enseignant',
      university: book.university || student?.university || 'Université Marocaine',
      facultyLabel: book.facultyLabel || book.faculty || 'Faculté Universitaire',
      semester: book.semester || 'S1',
      totalPages: book.totalPages || 1,
      isbn: book.isbn || '978-9954-22-108-4',
      description: book.description || '',
      studentName: student?.fullName || 'Étudiant',
      studentId: student?.studentId || 'ETU-2026',
      drmLicenseKey: student?.drmLicenseKey || 'FAC-2026-X892-K01',
    });

    const safeTitle = (book.title || 'cours').substring(0, 24).replace(/[^a-zA-Z0-9]/g, '_');
    const ok = triggerBrowserDownload(
      `Fiche_Synthese_${safeTitle}.txt`,
      content,
      'text/plain;charset=utf-8'
    );

    if (ok) {
      setDownloadSuccessToast(
        lang === 'fr'
          ? `Fiche de cours et attestation DRM téléchargée pour "${book.title}" !`
          : `تم تحميل بطاقة المقرر وشهادة الترخيص لـ "${book.titleAr || book.title}" بنجاح!`
      );
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Return to Home Bar */}
      {onReturnHome && (
        <div className="mb-6 pb-3 border-b border-stone-200/80 flex items-center justify-between">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>{lang === 'fr' ? 'Revenir à la page d\'Accueil' : 'العودة إلى الصفحة الرئيسية'}</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            {lang === 'fr' ? 'FAC en PDF · Votre Espace Étudiant Personnel' : 'منصة FAC en PDF · فضاء الطالب الشخصي'}
          </span>
        </div>
      )}

      {/* Download Alert Toast */}
      {downloadSuccessToast && (
        <div className="mb-6 p-4 bg-emerald-950 border border-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccessToast}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessToast(null)}
            className="text-stone-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Student Academic Identity Card with Direct Edit Profile Button */}
      <div className="mb-8 bg-gradient-to-br from-stone-900 to-stone-850 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Award className="w-4 h-4" />
              <span>{lang === 'fr' ? 'Carte d\'Étudiant Numérique Certifiée' : 'بطاقة الطالب الجامعية المعتمدة'}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">
                ✓ Étudiant Enregistré
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{student.fullName}</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {student.university} · {student.faculty}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                {lang === 'fr' ? 'N° Étudiant (Apogée)' : 'رقم التسجيل الجامعي'}
              </div>
              <div className="font-mono text-xs font-bold text-white">{student.studentId}</div>
            </div>

            <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                {lang === 'fr' ? 'Adresse E-mail' : 'البريد الإلكتروني'}
              </div>
              <div className="font-mono text-xs font-bold text-amber-300">{student.email}</div>
            </div>

            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="px-3.5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Modifier mes coordonnées, faculté, filière et téléphone"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Mettre à jour ma Fiche' : 'تحيين معطياتي'}</span>
              </button>
            )}
          </div>
        </div>

        {/* DRM Device & Protection Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">
                {lang === 'fr' ? 'Protection DRM Active' : 'حماية المحتوى مشغلة'}
              </div>
              <div className="text-[11px] text-stone-400">
                {lang === 'fr' ? 'Lecteur In-App sécurisé' : 'قراءة آمنة حصرياً بالتطبيق'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-800 text-stone-300 rounded-lg border border-stone-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white font-mono text-[11px]">
                {student.drmLicenseKey ? student.drmLicenseKey.slice(0, 16) : 'FAC-2026-X9A2'}...
              </div>
              <div className="text-[11px] text-stone-400">
                {lang === 'fr' ? 'Clé de licence individuelle' : 'مفتاح التشفير الفردي'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-800 text-stone-300 rounded-lg border border-stone-700">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">
                {lang === 'fr' ? 'Poste de Consultation Lié' : 'الجهاز المعتمد للقراءة'}
              </div>
              <div className="text-[11px] text-stone-400">
                {student.registeredDevice || 'PC / Navigateur Sécurisé (Chiffré)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header: Redeem code + Quick buy shortcut */}
      <div className="mb-8 p-5 bg-stone-50 border border-stone-200 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>{lang === 'fr' ? 'Activer un code d\'accès ou bon d\'achat' : 'تفعيل كود ترخيص مقرر أو بطاقة شحن'}</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'fr'
              ? 'Saisissez votre clé de licence DRM reçue par SMS, reçue en agence ou fournie par votre professeur.'
              : 'أدخل كود الترخيص الذي استلمته في الوكالة، أو عبر رسالة SMS، أو من أستاذ المادة لتفعيل الكتاب فوراً.'}
          </p>
        </div>

        <form onSubmit={handleRedeemSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={redeemInput}
            onChange={(e) => setRedeemInput(e.target.value)}
            placeholder="Ex: FAC-2026-X9A2-..."
            className="w-48 sm:w-64 p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            {lang === 'fr' ? 'Activer le code' : 'تفعيل الكود'}
          </button>
        </form>
      </div>

      {/* Strict Anti-Sharing & Single Device Enforcement Notice */}
      <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-950 space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {lang === 'fr'
              ? 'Règle stricte d\'attribution DRM : Ce code de licence est à usage unique et n\'est valable que pour le polycopié acheté. Il se verrouille définitivement sur le premier appareil utilisé et ne peut en aucun cas être partagé avec un tiers. Le premier utilisateur est le seul bénéficiaire.'
              : 'بروتوكول الأمان والحماية DRM: كود الترخيص صالح حصرياً للمقرر الذي تم اقتناؤه وللاستعمال لمرة واحدة فقط؛ حيث يقفل آلياً وبشكل دائم على جهاز المستفيد الأول ولا يمكن بأي حال تقاسمه أو استعماله على جهاز ثانٍ.'}
          </p>
        </div>

        {/* Quick Test Shortcuts for User Verification */}
        <div className="pt-1.5 border-t border-amber-400/30 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-stone-500 font-semibold">{lang === 'fr' ? 'Tests rapides :' : 'تجارب سريعة للأكواد:'}</span>
          <button
            type="button"
            onClick={() => setRedeemInput('FAC-2026-E552-L99')}
            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-mono font-bold border border-emerald-300 transition-colors cursor-pointer"
            title="Tester l'activation du cours Macroéconomie Moderne"
          >
            {lang === 'fr' ? 'Tester code valide (Macroéconomie)' : 'تجربة كود صالح (Macroéconomie)'}
          </button>
          <button
            type="button"
            onClick={() => setRedeemInput('FAC-2026-X892-K01')}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-mono font-bold border border-rose-300 transition-colors cursor-pointer"
            title="Tester le blocage anti-partage d'un code déjà verrouillé sur un autre poste"
          >
            {lang === 'fr' ? 'Tester blocage anti-partage' : 'تجربة حظر التقاسم (كود مقفل)'}
          </button>
        </div>
      </div>

      {redeemSuccess && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{redeemSuccess}</span>
        </div>
      )}

      {redeemError && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <span>{redeemError}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs: 1. Acquired, 2. Buy New Books, 3. Receipts */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'books'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'fr' ? `1. Mes Cours (${acquiredBooks.length})` : `1. مقرراتي المفعلة (${acquiredBooks.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('buy_new')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'buy_new'
              ? 'bg-amber-600 text-stone-950 shadow-md ring-2 ring-amber-400/50'
              : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {lang === 'fr'
              ? `2. Acquérir de Nouveaux Cours (${availableToBuyBooks.length})`
              : `2. اقتناء مقررات جديدة بالتعريفة التفضيلية (${availableToBuyBooks.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'receipts'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-500" />
          <span>
            {lang === 'fr'
              ? `3. Reçus & Codes de Paiement (${studentOrders.length})`
              : `3. إيصالات الأداء ورموز الوكالات (${studentOrders.length})`}
          </span>
        </button>
      </div>

      {/* TAB 1: ACQUIRED BOOKS GRID */}
      {activeTab === 'books' && (
        acquiredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 shadow-xs">
            <BookOpen className="w-14 h-14 mx-auto text-stone-300 mb-3" />
            <h4 className="text-base font-bold text-stone-800 mb-1">
              {lang === 'fr' ? 'Aucun livre acquis pour l\'instant' : 'لم تقم باقتناء أي كتاب بعد'}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
              {lang === 'fr'
                ? 'Choisissez les polycopiés de votre filière ci-dessous et activez votre lecture in-app sécurisée.'
                : 'اختر المطبوعات والمحاضرات المناسبة لشعبتك وسداسيك للمذاكرة المأمونة داخل التطبيق.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('buy_new')}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Acheter un livre maintenant' : 'اقتناء كتاب الآن'}</span>
              </button>

              <button
                onClick={onExploreCatalog}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'Voir le catalogue complet' : 'معاينة المعرض العام'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acquiredBooks.map((book) => {
              const rawProgress = student?.bookProgress?.[book.id];
              const progress = {
                currentPage: rawProgress?.currentPage ?? 1,
                completedPercent: rawProgress?.completedPercent ?? 0,
                lastReadAt: rawProgress?.lastReadAt || (lang === 'fr' ? 'Pas encore commencé' : 'لم تبدأ بعد'),
              };

              return (
                <div
                  key={book.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="flex p-4 gap-4">
                    {/* Book cover mini */}
                    <div className="w-20 aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Book quick info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-amber-800 truncate mb-0.5">
                        {book.facultyLabel || book.faculty} · {book.semester}
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm leading-tight line-clamp-2 mb-1">
                        {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate mb-3">{book.author}</p>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                          <span>
                            {lang === 'fr' ? `Page ${progress.currentPage} / ${book.totalPages}` : `الصفحة ${progress.currentPage} من ${book.totalPages}`}
                          </span>
                          <span>{progress.completedPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress.completedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Last Read */}
                  <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{progress.lastReadAt}</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {/* زر تقاسم رابط المقرر مع الزملاء للتسجيل والاستفادة من التعريفة التفضيلية */}
                      <button
                        type="button"
                        onClick={() => setSharingBook(book)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
                        title={lang === 'fr' ? 'Partager le lien du cours avec vos camarades pour bénéficier du tarif préférentiel' : 'تقاسم رابط المقرر مع زملائك للتسجيل بالمنصة والاستفادة من التعريفة التفضيلية'}
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>{lang === 'fr' ? 'Partager le cours' : 'تقاسم المقرر'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadCourseSummary(book)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-stone-200"
                        title="Télécharger la fiche de synthèse officielle du cours et attestation DRM"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-600" />
                        <span className="hidden sm:inline">{lang === 'fr' ? 'Fiche' : 'ملخص'}</span>
                      </button>

                      <button
                        onClick={() => onOpenReader(book)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'fr' ? 'Reprendre' : 'متابعة القراءة'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: BUY NEW BOOKS (Direct In-Student Page Purchase Mechanism) */}
      {activeTab === 'buy_new' && (
        <div className="space-y-6">
          {/* Header & Quick Filter Bar */}
          <div className="p-5 bg-amber-50/50 border border-amber-200/80 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{lang === 'fr' ? 'Acquisition de Polycopiés au Tarif Préférentiel Étudiant' : 'اقتناء المقررات الجامعية بالتعريفة التفضيلية للطلبة'}</span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {lang === 'fr'
                  ? 'Activez vos licences au tarif préférentiel subventionné par Carte CMI, Virement RIB, Agences Cash (Wafacash/Cash Plus), ou M-Wallet.'
                  : 'فعّل رخص مقرراتك بالتعريفة التفضيلية المدعومة المخصصة للطلبة عبر البطاقة البنكية، التحويل، كاش بلوس/وفاكاش، أو محفظة الهاتف.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={buySearch}
                  onChange={(e) => setBuySearch(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher un cours...' : 'بحث في المقررات...'}
                  className="pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={buyFacultyFilter}
                onChange={(e) => setBuyFacultyFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none"
              >
                <option value="all">{lang === 'fr' ? 'Toutes les disciplines' : 'جميع التخصصات'}</option>
                <option value="droit">Droit & Sciences Juridiques</option>
                <option value="economie">Économie & Gestion</option>
                <option value="sciences">Sciences & Tech</option>
                <option value="medecine">Médecine & Pharmacie</option>
              </select>
            </div>
          </div>

          {/* Grid of Books to Buy */}
          {filteredAvailableBooks.length === 0 ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl p-6">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-stone-800">
                {lang === 'fr' ? 'Aucun livre ne correspond à votre recherche' : 'لا توجد نتائج مطابقة لبحثك'}
              </h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAvailableBooks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-4 flex gap-3.5">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-20 aspect-[3/4] object-cover rounded-xl border border-stone-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {b.facultyLabel || b.faculty} · {b.semester}
                      </span>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-snug">
                        {lang === 'ar' && b.titleAr ? b.titleAr : b.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-1">
                        {b.author}
                      </p>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {b.totalPages} {lang === 'fr' ? 'pages' : 'ص'} · In-App DRM
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      {b.isFree ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {lang === 'fr' ? 'Gratuit' : 'مجاني'}
                        </span>
                      ) : (
                        <div className="text-sm font-black text-stone-900 font-mono">
                          {b.priceMAD} <span className="text-xs font-bold text-stone-500">DH</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onBuyBook && onBuyBook(b)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Acquérir ce cours' : 'اقتناء هذا المقرر'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECEIPTS & CODES (FOR STUDENTS) */}
      {activeTab === 'receipts' && (
        studentOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-3xl p-6">
            <Receipt className="w-12 h-12 mx-auto text-stone-300 mb-2" />
            <h4 className="text-sm font-bold text-stone-800 mb-1">
              {lang === 'fr' ? 'Aucun reçu de paiement enregistré' : 'لا توجد إيصالات أداء مسجلة حتى الآن'}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {lang === 'fr'
                ? 'Lorsque vous acquérez un polycopié par carte, virement, ou en agence de proximité, vos quittances et codes s\'affichent ici.'
                : 'عند اقتناء أي مقرر بالبطاقة أو التحويل البنكي أو وكالات القرب (وفاكاش، كاش بلوس)، يظهر إيصالك وكود الدفع هنا.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {studentOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        {ord.orderRef}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {lang === 'fr' ? 'Encaissé & Validé' : 'مقبول ومحصّل'}
                      </span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">{ord.bookTitle}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-stone-950 font-mono">{ord.amountMAD} MAD</div>
                    <div className="text-[11px] text-stone-500">{ord.date}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500">{lang === 'fr' ? 'Mode de Règlement :' : 'وسيلة الأداء:'}</span>{' '}
                    <strong className="text-stone-900">{ord.paymentMethod}</strong>
                  </div>

                  <div>
                    <span className="text-stone-500">{lang === 'fr' ? 'Licence DRM Débloquée :' : 'كود رخصة الـ DRM:'}</span>{' '}
                    <strong className="font-mono text-amber-900">{ord.drmKeyGenerated}</strong>
                  </div>
                </div>

                {/* Cash Code details if used agency without bank card */}
                {ord.paymentDetails?.cashPaymentCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-amber-950">
                        {ord.paymentDetails.cashAgency} · {lang === 'fr' ? 'Code de Versement en Agence' : 'كود الأداء النقدي بالوكالة'}
                      </div>
                      <div className="font-mono text-sm font-black text-amber-900 mt-0.5">
                        {ord.paymentDetails.cashPaymentCode}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(ord.paymentDetails?.cashPaymentCode || '')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                    >
                      {copiedCode === ord.paymentDetails?.cashPaymentCode ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Copié' : 'تم النسخ'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Copier' : 'نسخ الكود'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Download Official Receipt Action */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[11px] text-stone-500">
                    {lang === 'fr' ? 'Document fiscal et justificatif d\'encaissement' : 'وثيقة إثبات الأداء الرسمية مع التوثيق المالي'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(ord)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'fr' ? 'Télécharger la Quittance' : 'تحميل الإيصال'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Book Share Modal for Students */}
      <BookShareModal
        book={sharingBook}
        isOpen={!!sharingBook}
        onClose={() => setSharingBook(null)}
        lang={lang}
        sharedBy="student"
        onPreviewBook={(book) => {
          setSharingBook(null);
          onOpenReader(book);
        }}
      />
    </div>
  );
};
