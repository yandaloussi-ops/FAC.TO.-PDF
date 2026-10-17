import React, { useState } from 'react';
import { Book, StudentProfile, MoroccanPaymentMethod, PaymentDetails } from '../types';
import { triggerBrowserDownload, generateOfficialReceiptText } from '../utils/downloadHelper';
import {
  X,
  CreditCard,
  Building2,
  Wallet,
  Receipt,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Download,
  BookOpen,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  Lock,
} from 'lucide-react';

interface MoroccanCheckoutModalProps {
  book: Book;
  student: StudentProfile;
  adminRib: string;
  onClose: () => void;
  onSuccess: (
    method: MoroccanPaymentMethod,
    details: PaymentDetails,
    generatedLicenseCode: string
  ) => void;
  lang: 'fr' | 'ar';
}

type CheckoutTab = 'cmi' | 'virement' | 'cash_agency' | 'm_wallet';

export const MoroccanCheckoutModal: React.FC<MoroccanCheckoutModalProps> = ({
  book,
  student,
  adminRib,
  onClose,
  onSuccess,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<CheckoutTab>('cash_agency');
  const [copiedRib, setCopiedRib] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'otp_cmi' | 'success'>('form');

  // Form states
  // 1. CMI Card (Frozen)
  const [cardNumber, setCardNumber] = useState('4234 5678 9101 2026');
  const [cardHolder, setCardHolder] = useState(student.fullName || 'ETUDIANT UNIVERSITAIRE');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('849201');

  // 2. Virement (Frozen)
  const [transferBank, setTransferBank] = useState('Attijariwafa Bank');
  const [transferRef, setTransferRef] = useState('VIR-' + Math.floor(100000 + Math.random() * 900000));
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  // 3. Cash Agency (Active & Exclusive Method - Students & General Public)
  const [cashAgency, setCashAgency] = useState<'Wafacash' | 'Cash Plus' | 'Barid Cash' | 'Tashilat' | 'Daman Cash'>('Wafacash');
  const [cashPaymentCode] = useState(`FAC-CASH-${Math.floor(100000 + Math.random() * 900000)}`);
  const [cashDepositorName, setCashDepositorName] = useState(student.fullName);

  // 4. M-Wallet (Frozen)
  const [walletProvider, setWalletProvider] = useState<'MT Cash' | 'Orange Money' | 'inwi money'>('MT Cash');
  const [walletPhone, setWalletPhone] = useState('06 61 00 00 00');

  // Success results
  const [completedOrder, setCompletedOrder] = useState<{
    orderRef: string;
    method: MoroccanPaymentMethod;
    drmCode: string;
    details: PaymentDetails;
    date: string;
  } | null>(null);

  const handleCopyRib = () => {
    navigator.clipboard.writeText(adminRib);
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 3000);
  };

  // Submit flow
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (activeTab === 'cmi') {
      // Simulate CMI 3D-Secure OTP challenge
      setTimeout(() => {
        setIsProcessing(false);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setStep('otp_cmi');
      }, 700);
      return;
    }

    // Direct completion for other methods
    finalizeOrder();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      finalizeOrder();
    }, 800);
  };

  const finalizeOrder = () => {
    const drmCode = `FAC-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const orderRef = `CMD-FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let method: MoroccanPaymentMethod = 'Carte Bancaire CMI (3D-Secure)';
    let details: PaymentDetails = {};

    if (activeTab === 'cmi') {
      method = 'Carte Bancaire CMI (3D-Secure)';
      details = {
        bankName: 'Centre Monétique Interbancaire (CMI)',
        transferRef: `AUT-CMI-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    } else if (activeTab === 'virement') {
      method = 'Virement Bancaire Direct (RIB)';
      details = {
        bankName: transferBank,
        transferRef: transferRef.trim() || `VIR-REF-${Date.now()}`,
        receiptFileName: receiptUploaded ? 'recu_virement_attijari.pdf' : 'declaration_virement.pdf',
      };
    } else if (activeTab === 'cash_agency') {
      method = 'Agences Cash (Wafacash / Cash Plus / Barid Cash / Tashilat)';
      details = {
        cashAgency: cashAgency,
        cashPaymentCode: `COMPTE-AGENCE-FAC-${cashAgency.toUpperCase().replace(/\s+/g, '')}`,
        agencyAccountTitle: 'FAC EN PDF (MAROC) · REGIE CENTRALE',
        cashExpiryDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString().substring(0, 10),
      };
    } else if (activeTab === 'm_wallet') {
      method = 'Portefeuille Mobile (MT Cash / Orange Money / inwi)';
      details = {
        mobileWallet: walletProvider,
        phoneNumber: walletPhone,
      };
    }

    setCompletedOrder({
      orderRef,
      method,
      drmCode,
      details,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    setIsProcessing(false);
    setStep('success');
    onSuccess(method, details, drmCode);
  };

  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  const handlePrintReceipt = () => {
    if (completedOrder) {
      const receiptContent = generateOfficialReceiptText({
        orderRef: completedOrder.orderRef,
        bookTitle: book.title,
        bookTitleAr: book.titleAr,
        author: book.author,
        university: book.university,
        faculty: book.facultyLabel,
        studentName: student.fullName,
        studentId: student.studentId,
        studentEmail: student.email,
        amountMAD: book.priceMAD,
        paymentMethod: completedOrder.method,
        drmKey: completedOrder.drmCode,
        date: completedOrder.date,
        deviceId: student.registeredDevice || 'TERMINAL-PC-01-SECURE',
      });

      const success = triggerBrowserDownload(
        `Quittance_Paiement_FAC_en_PDF_${completedOrder.orderRef}.txt`,
        receiptContent,
        'text/plain;charset=utf-8'
      );

      if (success) {
        setReceiptDownloaded(true);
        setTimeout(() => setReceiptDownloaded(false), 4000);
      }
    }

    try {
      window.print();
    } catch {
      // Ignored if window.print is restricted in iframe
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-850 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  {lang === 'fr'
                    ? 'Portail Sécurisé de Paiement & Encaissement'
                    : 'بوابة الأداء والتحصيل المالي والتحويلات البنكية'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  CMI & Bank Gateway
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {lang === 'fr'
                  ? 'Compte Administrateur Centralisé · Agrément Bancaire CNDP & DRM'
                  : 'التحصيل التجاري المعتمد لحساب الإدارة المركزي · دعم التحويلات ووكالات الكاش للطلبة'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">{book.title}</span>
            <span className="text-stone-500">({book.author})</span>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold">
            <span className="text-stone-600">{lang === 'fr' ? 'Montant à régler :' : 'المبلغ المستحق:'}</span>
            <span className="text-base text-stone-950 font-black bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-2xs">
              {book.priceMAD} MAD <span className="text-xs font-normal text-stone-600">({lang === 'fr' ? 'Dirhams' : 'درهم'})</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {step === 'form' && (
            <div>
              {/* Staging / External Integration Notice (Point 3) */}
              <div className="mb-4 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-2 text-xs text-sky-950">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  <strong>{lang === 'fr' ? 'Intégration Externe :' : 'الارتباط الخارجي:'}</strong>{' '}
                  {lang === 'fr'
                    ? 'La passerelle de paiement est opérationnelle en simulation locale et sera connectée aux entités bancaires externes compétentes (CMI, Wafacash, Cash Plus, Barid Cash).'
                    : 'آلية الأداء مهيأة وتعمل تجريبياً، وسيتم ربطها بالجهات المختصة خارجياً (مركز النقديات CMI، وكالات كاش بلوس ووفاكاش وبريد بنك).'}
                </p>
              </div>

              {/* Tabs Navigation: Payment Systems */}
              <div className="mb-6">
                <div className="text-xs font-bold text-stone-700 mb-2.5 flex items-center justify-between">
                  <span>{lang === 'fr' ? 'Choisissez votre système d\'encaissement :' : 'اختر نظام وسيلة الأداء المناسبة:'}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    {lang === 'fr' ? '5 modes disponibles pour tous les étudiants' : '5 خيارات متاحة حتى بدون بطاقة بنكية'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Tab 1: CMI (Frozen) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('cmi')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                      activeTab === 'cmi'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/30 text-stone-950 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-500 hover:bg-stone-100 opacity-80'
                    }`}
                  >
                    <span className="absolute top-1 right-1 text-[8px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-extrabold uppercase">
                      {lang === 'fr' ? 'Suspendu' : 'مجمدة'}
                    </span>
                    <CreditCard className="w-5 h-5 text-stone-400" />
                    <span className="text-[11px] font-bold leading-tight">
                      {lang === 'fr' ? 'Carte Bancaire' : 'بطاقة بنكية'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">CMI · 3D Secure</span>
                  </button>

                  {/* Tab 2: Virement Bancaire (Frozen) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('virement')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                      activeTab === 'virement'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/30 text-stone-950 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-500 hover:bg-stone-100 opacity-80'
                    }`}
                  >
                    <span className="absolute top-1 right-1 text-[8px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-extrabold uppercase">
                      {lang === 'fr' ? 'Suspendu' : 'مجمدة'}
                    </span>
                    <Building2 className="w-5 h-5 text-stone-400" />
                    <span className="text-[11px] font-bold leading-tight">
                      {lang === 'fr' ? 'Virement Bancaire' : 'تحويل بنكي'}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">RIB · Toutes banques</span>
                  </button>

                  {/* Tab 3: Wafacash / Cash Agencies (EXCLUSIVE ACTIVE & FUNCTIONING METHOD) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('cash_agency')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative overflow-hidden ${
                      activeTab === 'cash_agency'
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500 text-stone-950 shadow-md'
                        : 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-100 text-emerald-950'
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-emerald-600 text-[8px] text-white px-1.5 py-0.5 font-black uppercase rounded-bl tracking-wider animate-pulse">
                      {lang === 'fr' ? 'ACTIF · RECOMMANDÉ' : 'الخيار المعتمد الوحيد'}
                    </span>
                    <Receipt className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-black text-emerald-950 leading-tight">
                      {lang === 'fr' ? 'Agences Cash' : 'وكالات تحويل الأموال'}
                    </span>
                    <span className="text-[9px] text-emerald-800 font-bold">Wafacash · Cash Plus</span>
                  </button>

                  {/* Tab 4: M-Wallet Mobile (Frozen) */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('m_wallet')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 relative ${
                      activeTab === 'm_wallet'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/30 text-stone-950 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-500 hover:bg-stone-100 opacity-80'
                    }`}
                  >
                    <span className="absolute top-1 right-1 text-[8px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-extrabold uppercase">
                      {lang === 'fr' ? 'Suspendu' : 'مجمدة'}
                    </span>
                    <Wallet className="w-5 h-5 text-stone-400" />
                    <span className="text-[11px] font-bold leading-tight">
                      {lang === 'fr' ? 'M-Wallet Mobile' : 'محفظة هاتف'}
                    </span>
                    <span className="text-[9px] text-stone-400">MT Cash · Orange</span>
                  </button>
                </div>
              </div>

              {/* Form by Tab */}
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                {/* 1. CARTE BANCAIRE CMI (FROZEN) */}
                {activeTab === 'cmi' && (
                  <div className="p-6 bg-stone-50 border-2 border-dashed border-rose-300 rounded-2xl text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900 mb-1">
                        {lang === 'fr'
                          ? 'Paiement par Carte Bancaire temporairement suspendu'
                          : 'تم تجميد الدفع بالبطاقة البنكية مؤقتاً بقرار من الإدارة'}
                      </h4>
                      <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                        {lang === 'fr'
                          ? 'Pour des raisons de régulation et de sécurité des transactions, les paiements par carte CMI sont suspendus. Seul le règlement en espèces via agences de proximité (Wafacash, Cash Plus, Barid Cash) est actif.'
                          : 'لحماية المعاملات وتفادي الأخطاء البنكية، تم تجميد الدفع بالبطاقات البنكية مؤقتاً. يرجى التوجه إلى خيار وكالات تحويل الأموال والقرب (Wafacash / Cash Plus) لتأكيد طلبك نقداً.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('cash_agency')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>
                        {lang === 'fr'
                          ? 'Basculer vers Agences Cash (Wafacash / Cash Plus) →'
                          : 'الانتقال إلى خيار وكالات تحويل الأموال المعتمدة (Wafacash / Cash Plus) ←'}
                      </span>
                    </button>
                  </div>
                )}

                {/* 2. VIREMENT BANCAIRE (FROZEN) */}
                {activeTab === 'virement' && (
                  <div className="p-6 bg-stone-50 border-2 border-dashed border-rose-300 rounded-2xl text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900 mb-1">
                        {lang === 'fr'
                          ? 'Virement Bancaire temporairement suspendu'
                          : 'تم تجميد التحويل البنكي المباشر مؤقتاً بقرار من الإدارة'}
                      </h4>
                      <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                        {lang === 'fr'
                          ? 'Les virements interbancaires classiques nécessitent 48h à 72h de délai. Pour permettre un accès instantané aux cours sans délai, les paiements s\'effectuent exclusivement via les agences de proximité en espèces.'
                          : 'نظراً لأن التحويلات البنكية تستغرق وقتاً طويلاً للمعالجة (48 إلى 72 ساعة)، تم تجميدها مؤقتاً، وتم اعتماد الدفع الفوري نقداً عبر وكالات تحويل الأموال والقرب (Wafacash / Cash Plus) لتفعيل رخصتك في الحين.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('cash_agency')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>
                        {lang === 'fr'
                          ? 'Basculer vers Agences Cash (Wafacash / Cash Plus) →'
                          : 'الانتقال إلى خيار وكالات تحويل الأموال المعتمدة (Wafacash / Cash Plus) ←'}
                      </span>
                    </button>
                  </div>
                )}

                {/* 3. AGENCES DE PROXIMITÉ (FOR STUDENTS WITHOUT BANK CARDS) */}
                {activeTab === 'cash_agency' && (
                  <div className="p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-stone-900">
                          {lang === 'fr' ? 'Paiement en Espèces via Agences de Proximité (Sans Carte)' : 'الأداء نقداً عبر وكالات القرب (للطلبة بدون حساب أو بطاقة بنكية)'}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        100% Espèces · Aucun compte requis
                      </span>
                    </div>

                    {/* Direct cash explanation */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'fr' ? 'Comment ça fonctionne ?' : 'كيف تدفع نقداً بكل بساطة وبدون بطاقة؟'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-800">
                        {lang === 'fr'
                          ? '1. Choisissez l\'agence proche de vous. 2. Présentez le Code de Paiement ci-dessous au guichet. 3. Payez les ' +
                            book.priceMAD +
                            ' DH en liquide. Votre accès est immédiatement activé !'
                          : `1. اختر أقرب وكالة إليك. 2. قدم رمز الأداء الظاهر أدناه للموظف في الوكالة. 3. ادفع مبلغ (${book.priceMAD} درهم) نقداً باليد. يتم تفعيل رخصتك فورياً!`}
                      </p>
                    </div>

                    {/* Agency Selection */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        {lang === 'fr' ? 'Réseau d\'agences partenaire au Maroc :' : 'اختر شبكة وكالات القرب في مدينتك أو قرب كليتك:'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'Wafacash', label: 'Wafacash', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                          { id: 'Cash Plus', label: 'Cash Plus', color: 'bg-blue-100 text-blue-900 border-blue-300' },
                          { id: 'Barid Cash', label: 'Barid Cash', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
                          { id: 'Tashilat', label: 'Tashilat (تسهيلات)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                          { id: 'Daman Cash', label: 'Daman Cash', color: 'bg-purple-100 text-purple-900 border-purple-300' },
                        ].map((ag) => (
                          <button
                            key={ag.id}
                            type="button"
                            onClick={() => setCashAgency(ag.id as any)}
                            className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all text-center ${
                              cashAgency === ag.id
                                ? `${ag.color} ring-2 ring-emerald-500 shadow-2xs`
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {ag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Official App Agency Account Information (Requirement 2) */}
                    <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-850 rounded-2xl text-white border border-stone-800 space-y-3">
                      <div className="flex items-center justify-between text-xs text-stone-300">
                        <span className="font-bold flex items-center gap-1.5 text-amber-300">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>{lang === 'fr' ? 'Compte Officiel de l\'Application dans l\'Agence :' : 'حساب التطبيق المعتمد لدى الوكالة:'}</span>
                        </span>
                        <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Ouverture Immédiate / قريباً جداً' : 'سيفتح في القريب العاجل'}</span>
                        </span>
                      </div>

                      <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                            {lang === 'fr' ? 'Intitulé du Compte d\'Encaissement Régie' : 'اسم حساب التحصيل المعتمد للتطبيق'}
                          </div>
                          <div className="font-mono text-base sm:text-lg font-black text-amber-400 tracking-wide mt-0.5">
                            FAC EN PDF (MAROC) · REGIE CENTRALE
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono mt-1">
                            {lang === 'fr' 
                              ? `Réseau sélectionné : ${cashAgency} · Compte en cours d'attribution finale`
                              : `الشبكة المختارة: ${cashAgency} · رقم حساب التطبيق في طور الفتح والتعيين`}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[10px] text-stone-400">{lang === 'fr' ? 'Montant à régler' : 'المبلغ المطلوب'}</div>
                            <div className="text-base font-black text-emerald-400">{book.priceMAD} MAD</div>
                          </div>
                        </div>
                      </div>

                      {/* Notice about account opening */}
                      <div className="p-3 bg-stone-900/90 rounded-xl border border-amber-500/30 text-xs text-stone-300 space-y-1">
                        <p className="text-[11px] text-amber-200 leading-relaxed font-medium">
                          {lang === 'fr'
                            ? 'ℹ️ Note importante : Le versement se fera directement sur le compte professionnel de l\'application FAC en PDF auprès de l\'agence choisie (Wafacash / Cash Plus / Barid Cash) dès sa finalisation imminente. En attendant, conservez votre référence de commande.'
                            : 'ℹ️ تنبيه إداري هام: تم إلغاء كود الزبون الفردي وتعويضه بحساب التطبيق الرسمي في الوكالة (الذي سيفتح في القريب العاجل). سيقوم الطالب بإيداع المبلغ مباشرة في حساب التطبيق مع إدراج اسمه ورقم بطاقته.'}
                        </p>
                      </div>

                      <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-800">
                        <span>{lang === 'fr' ? 'Étudiant :' : 'الطالب المستفيد:'} <strong className="text-stone-200">{cashDepositorName}</strong></span>
                        <span>{lang === 'fr' ? 'Contact :' : 'المتابعة:'} <strong className="text-stone-200">fac.en.pdf.maroc@gmail.com</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. M-WALLET MOBILE (FROZEN) */}
                {activeTab === 'm_wallet' && (
                  <div className="p-6 bg-stone-50 border-2 border-dashed border-rose-300 rounded-2xl text-center space-y-4 animate-in fade-in">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-stone-900 mb-1">
                        {lang === 'fr'
                          ? 'Paiement M-Wallet temporairement suspendu'
                          : 'تم تجميد الدفع عبر محفظة الهاتف (M-Wallet) مؤقتاً بقرار من الإدارة'}
                      </h4>
                      <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                        {lang === 'fr'
                          ? 'Les passerelles M-Wallet sont en cours d\'intégration technique. Seul le règlement en espèces via agences de proximité (Wafacash, Cash Plus, Barid Cash) est actif pour valider votre licence immédiatement.'
                          : 'يجري العمل على ترقية بوابات الدفع الإلكتروني. في هذه المرحلة، يتم الأداء حصرياً نقداً عبر وكالات تحويل الأموال والقرب (Wafacash / Cash Plus / Barid Cash) بدون الحاجة لحساب بنكي.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('cash_agency')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>
                        {lang === 'fr'
                          ? 'Basculer vers Agences Cash (Wafacash / Cash Plus) →'
                          : 'الانتقال إلى خيار وكالات تحويل الأموال المعتمدة (Wafacash / Cash Plus) ←'}
                      </span>
                    </button>
                  </div>
                )}



                {/* Submit Action Bar */}
                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {lang === 'fr'
                        ? 'Chiffrement SSL 256 bits · Reçu officiel instantané'
                        : 'معاملة مالية مشفرة ومؤمنة بالكامل · صدور إيصال رسمي فوري'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-4 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                    >
                      {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing || activeTab !== 'cash_agency'}
                      className={`flex-1 sm:flex-none py-2.5 px-6 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                        activeTab === 'cash_agency'
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
                          : 'bg-stone-300 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{lang === 'fr' ? 'Validation en cours...' : 'جارِ التأكيد...'}</span>
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4" />
                          <span>
                            {activeTab === 'cash_agency'
                              ? (lang === 'fr' ? `Confirmer le Versement sur le Compte Agence (${book.priceMAD} DH)` : `تأكيد الإيداع في حساب التطبيق بالوكالة (${book.priceMAD} درهم)`)
                              : (lang === 'fr' ? 'Méthode Suspendue (Choisissez Agences Cash)' : 'طريقة معلقة (اختر وكالات كاش)')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: CMI 3D-SECURE OTP CHALLENGE SIMULATION */}
          {step === 'otp_cmi' && (
            <div className="max-w-md mx-auto py-4 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto border border-sky-300">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-black text-stone-900">
                  {lang === 'fr' ? 'Authentification 3D-Secure CMI' : 'التحقق الأمني من البنك (CMI 3D-Secure)'}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === 'fr'
                    ? `Un code de sécurité à 6 chiffres a été envoyé par SMS à votre numéro pour autoriser le débit de ${book.priceMAD} MAD.`
                    : `تم إرسال رمز أمان عبر SMS إلى هاتفك للمصادقة على أداء ${book.priceMAD} درهم لحساب الإدارة.`}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-mono">
                {lang === 'fr' ? 'Code SMS de test généré :' : 'رمز الأمان SMS للاختبار:'} <strong className="text-stone-900 text-sm">{generatedOtp}</strong>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Tapez le code reçu (ou le code test ci-dessus)"
                  className="w-full p-3 bg-white border-2 border-amber-500 rounded-xl text-center text-lg font-mono font-black tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setIsProcessing(false);
                    }}
                    className="flex-1 py-2.5 px-4 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                  >
                    {lang === 'fr' ? 'Retour' : 'رجوع'}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {isProcessing ? (lang === 'fr' ? 'Vérification...' : 'جار التحقق...') : (lang === 'fr' ? 'Valider et Confirmer' : 'تأكيد وصرف المعاملة')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: OFFICIAL TRANSACTION RECEIPT / QUITTANCE */}
          {step === 'success' && completedOrder && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-sm">
                      {lang === 'fr' ? 'Paiement Encaissé & Transaction Validée !' : 'تم التحصيل وتأكيد الأداء بنجاح تام!'}
                    </h4>
                    <p className="text-xs text-emerald-800">
                      {lang === 'fr'
                        ? 'Le polycopié est maintenant débloqué dans votre bibliothèque personnelle in-app.'
                        : 'تم تفعيل الكتاب وتوليد رخصة الوصول المحمية في مكتبتك الأكاديمية.'}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                  {completedOrder.orderRef}
                </span>
              </div>

              {/* Printable Official Quittance Ticket */}
              <div id="print-receipt-section" className="p-6 bg-stone-50 border border-stone-200 rounded-3xl space-y-4">
                <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-950 text-base">FAC EN PDF · ROYAUME DU MAROC</span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded uppercase font-bold">Régie Centrale</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {lang === 'fr' ? 'Quittance d\'Acquisition & Justificatif Fiscal d\'Encaissement' : 'وصل رسمي وإيصال تحصيل تجاري لمقرر جامعي'}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-stone-400">{lang === 'fr' ? 'Date & Heure :' : 'التاريخ:'}</div>
                    <div className="font-mono font-bold text-stone-800">{completedOrder.date}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-stone-500">{lang === 'fr' ? 'Étudiant Bénéficiaire :' : 'اسم الطالب المستفيد:'}</div>
                    <div className="font-bold text-stone-900 text-sm">{student.fullName}</div>
                    <div className="text-stone-600 font-mono text-[11px]">{student.studentId} · {student.email}</div>
                    <div className="text-stone-500 text-[11px]">{student.university} · {student.faculty}</div>
                  </div>

                  <div>
                    <div className="text-stone-500">{lang === 'fr' ? 'Manuel Académique Acquis :' : 'المقرر الأكاديمي:'}</div>
                    <div className="font-bold text-stone-900 text-sm">{book.title}</div>
                    <div className="text-stone-600 text-[11px]">{book.author} ({book.semester})</div>
                    <div className="text-stone-500 text-[11px]">{lang === 'fr' ? 'Mode de paiement :' : 'وسيلة الأداء:'} <strong className="text-stone-900">{completedOrder.method}</strong></div>
                  </div>
                </div>

                {/* DRM Access Key Highlight */}
                <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-850 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? 'Licence DRM In-App Associée à Votre Appareil' : 'رخصة الحماية الرقمية DRM المربوطة بجهازك'}</span>
                    </div>
                    <div className="font-mono text-base sm:text-lg font-black text-white tracking-widest mt-1">
                      {completedOrder.drmCode}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-stone-400">{lang === 'fr' ? 'Montant Encaissé' : 'المبلغ المدفوع'}</div>
                    <div className="text-xl font-black text-amber-400">{book.priceMAD} MAD</div>
                  </div>
                </div>

                {/* Additional details depending on method */}
                {completedOrder.details.cashPaymentCode && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                    <div>
                      <strong>{completedOrder.details.cashAgency}:</strong> {lang === 'fr' ? 'Code de versement en agence :' : 'كود الأداء في الوكالة:'} <span className="font-mono font-bold text-amber-900">{completedOrder.details.cashPaymentCode}</span>
                    </div>
                    <span className="text-[11px] text-stone-500">Valable 72h</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className={`w-full sm:w-auto py-2.5 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    receiptDownloaded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-150 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  {receiptDownloaded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Reçu Téléchargé !' : 'تم تحميل الإيصال بنجاح!'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Imprimer / Télécharger le Reçu' : 'طباعة وحفظ الإيصال'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'fr' ? 'Accéder au Livre dans la Bibliothèque' : 'بدء القراءة في المكتبة الآن'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
