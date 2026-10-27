import UploadBook from './UploadBook';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { Hero } from './components/Hero';
import { BookCatalog } from './components/BookCatalog';
import { StudentLibrary } from './components/StudentLibrary';
import { DRMInfoView } from './components/DRMInfoView';
import { SecureReader } from './components/SecureReader';
import { BookDetailModal } from './components/BookDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { DataProtectionModal } from './components/DataProtectionModal';
import { ProfessorPortalModal } from './components/ProfessorPortalModal';
import { ProfessorLoginModal } from './components/ProfessorLoginModal';
import { ProfessorRegisterModal } from './components/ProfessorRegisterModal';
import { UniversitiesModal } from './components/UniversitiesModal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { MoroccanCheckoutModal } from './components/MoroccanCheckoutModal';
import { UserGuideAndTermsModal } from './components/UserGuideAndTermsModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import UploadBook from './UploadBook';
import { UserGuideAndTermsModal } from './components/UserGuideAndTermsModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import UploadBook from './UploadBook'; // <--- ضع السطر هنا تماماً

import {
  MOCK_BOOKS,
  initialStudentProfile,
  INITIAL_PROFESSORS,
import {
  MOCK_BOOKS,
  initialStudentProfile,
  INITIAL_PROFESSORS,
  INITIAL_DRM_LICENSES,
  INITIAL_PAYOUT_TRANSACTIONS,
  INITIAL_FACULTIES,
  INITIAL_FACULTY_NEWS,
  INITIAL_PROFESSOR_NOTICES,
  INITIAL_ADMIN_COMMERCIAL_ACCOUNT,
  INITIAL_PAYMENT_ORDERS,
} from './data/mockBooks';
import {
  getStoredBooks,
  saveStoredBooks,
  getStoredProfessors,
  saveStoredProfessors,
  getStoredStudent,
  saveStoredStudent,
  getStoredRegisteredStudents,
  saveStoredRegisteredStudents,
  PLATFORM_GMAIL,
} from './utils/storage';
import {
  Book,
  StudentProfile,
  Professor,
  DRMAccessLicense,
  PayoutTransaction,
  FacultyItem,
  FacultyNews,
  ProfessorNotice,
  AdminCommercialAccount,
  PaymentOrder,
  MoroccanPaymentMethod,
  PaymentDetails,
} from './types';
import { CheckCircle2, ShieldCheck, Landmark, ShieldAlert } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  // Default to the attractive Home landing page!
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'library' | 'drm-info' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary data state with persistent storage (Fix for Point 5)
  const [books, setBooks] = useState<Book[]>(() => getStoredBooks());
  const [student, setStudent] = useState<StudentProfile>(() => getStoredStudent());
  const [registeredStudents, setRegisteredStudents] = useState<StudentProfile[]>(() => getStoredRegisteredStudents());
  const [professors, setProfessors] = useState<Professor[]>(() => getStoredProfessors());
  const [drmLicenses, setDrmLicenses] = useState<DRMAccessLicense[]>(INITIAL_DRM_LICENSES);
  const [faculties, setFaculties] = useState<FacultyItem[]>(INITIAL_FACULTIES);
  const [payoutTransactions, setPayoutTransactions] = useState<PayoutTransaction[]>(INITIAL_PAYOUT_TRANSACTIONS);
  const [facultyNews, setFacultyNews] = useState<FacultyNews[]>(INITIAL_FACULTY_NEWS);
  const [professorNotices, setProfessorNotices] = useState<ProfessorNotice[]>(INITIAL_PROFESSOR_NOTICES);

  // Visitor mode pricing state (Requirement 9)
  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(false);

  // Sync state to localStorage whenever modified
  useEffect(() => {
    saveStoredBooks(books);
  }, [books]);

  useEffect(() => {
    saveStoredProfessors(professors);
  }, [professors]);

  useEffect(() => {
    saveStoredStudent(student);
  }, [student]);

  useEffect(() => {
    saveStoredRegisteredStudents(registeredStudents);
  }, [registeredStudents]);

  // Professor Private Authentication State (Gatekeeping by Institutional Email)
  const [authenticatedProfessor, setAuthenticatedProfessor] = useState<Professor | null>(null);

  // Commercial Payment & Admin Collection State
  const [adminCommercialAccount, setAdminCommercialAccount] = useState<AdminCommercialAccount>(INITIAL_ADMIN_COMMERCIAL_ACCOUNT);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>(INITIAL_PAYMENT_ORDERS);

  // Direct Filter state for Digital Library Catalog
  const [catalogFacultyFilter, setCatalogFacultyFilter] = useState<string>('all');
  const [catalogSemesterFilter, setCatalogSemesterFilter] = useState<string>('Tous');

  // Modals & Reader state
  const [selectedBookForReader, setSelectedBookForReader] = useState<Book | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForCheckout, setSelectedBookForCheckout] = useState<Book | null>(null);
  const [isProfessorPortalOpen, setIsProfessorPortalOpen] = useState<boolean>(false);
  const [isProfessorLoginOpen, setIsProfessorLoginOpen] = useState<boolean>(false);
  const [isProfessorRegisterOpen, setIsProfessorRegisterOpen] = useState<boolean>(false);
  const [isUniversitiesModalOpen, setIsUniversitiesModalOpen] = useState<boolean>(false);
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState<boolean>(false);
  const [pendingCourseForStudent, setPendingCourseForStudent] = useState<Book | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isDataProtectionModalOpen, setIsDataProtectionModalOpen] = useState<boolean>(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState<boolean>(false);
  const [userGuideInitialTab, setUserGuideInitialTab] = useState<'guide_student' | 'guide_professor' | 'terms_contract' | 'cndp_privacy'>('guide_student');
  const [globalToast, setGlobalToast] = useState<{ title: string; message: string } | null>(null);

  // Sync RTL / LTR direction on document
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Deep linking for shared course links: Directs student to registration first to unlock preferential rate, then automatic entry to acquisition
  useEffect(() => {
    const handleCheckHash = () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        let targetId: string | null = null;

        if (hash.includes('course=')) {
          const match = hash.match(/course=([^&]+)/);
          if (match) targetId = decodeURIComponent(match[1]);
        } else if (hash.includes('book=')) {
          const match = hash.match(/book=([^&]+)/);
          if (match) targetId = decodeURIComponent(match[1]);
        } else if (hash.startsWith('#book-') || hash.startsWith('#course-')) {
          targetId = hash.replace('#', '');
        }

        if (!targetId && (search.includes('course=') || search.includes('book='))) {
          const params = new URLSearchParams(search);
          targetId = params.get('course') || params.get('book');
        }

        if (targetId) {
          const found = books.find((b) => b.id === targetId);
          if (found) {
            // Check if student has registered their student credentials
            const isRegisteredStudent = Boolean(
              student.studentId &&
              student.studentId.trim() !== '' &&
              student.fullName &&
              !student.fullName.includes('Invité') &&
              !student.fullName.includes('زائر')
            );

            if (!isRegisteredStudent) {
              // Direct student to registration form first to benefit from preferential rates
              setPendingCourseForStudent(found);
              setIsStudentAuthOpen(true);
              showToast(
                lang === 'fr'
                  ? 'Inscription & Tarif Préférentiel Étudiant'
                  : 'مطبوع تسجيل الطالب · الأثمنة التفضيلية',
                lang === 'fr'
                  ? `Complétez votre inscription pour bénéficier du tarif préférentiel subventionné pour le cours "${found.title}".`
                  : `أكمل تسجيلك للاستفادة من الأثمنة التفضيلية المدعومة لمقرر "${found.titleAr || found.title}" والدخول التلقائي للاقتناء.`
              );
            } else {
              // Student already enrolled: proceed directly to book
              setSelectedBookForDetails(found);
            }
          }
        }
      } catch (err) {
        console.warn('Deep link error:', err);
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, [books, student]);

  // Browser History & Hardware/Software Back Button Navigation Manager
  // Protects the user from accidentally exiting the application on pressing back
  useEffect(() => {
    // Ensure base history state is established on load
    try {
      if (!window.history.state) {
        window.history.replaceState({ app: 'fac-en-pdf', tab: currentTab }, '', window.location.href);
      }
    } catch {}

    const handlePopState = () => {
      // 1. If Reader is open, close reader and return to catalog/library
      if (selectedBookForReader) {
        setSelectedBookForReader(null);
        return;
      }
      // 2. If Checkout is open, close checkout
      if (selectedBookForCheckout) {
        setSelectedBookForCheckout(null);
        return;
      }
      // 3. If Details modal is open, close details
      if (selectedBookForDetails) {
        setSelectedBookForDetails(null);
        return;
      }
      // 4. If Professor Portal is open, close portal
      if (isProfessorPortalOpen) {
        setIsProfessorPortalOpen(false);
        return;
      }
      // 5. If other modals are open, close them
      if (isStudentAuthOpen) {
        setIsStudentAuthOpen(false);
        setPendingCourseForStudent(null);
        return;
      }
      if (isUniversitiesModalOpen) {
        setIsUniversitiesModalOpen(false);
        return;
      }
      if (isUserGuideModalOpen) {
        setIsUserGuideModalOpen(false);
        return;
      }
      if (isAdminAuthModalOpen) {
        setIsAdminAuthModalOpen(false);
        return;
      }
      if (isDataProtectionModalOpen) {
        setIsDataProtectionModalOpen(false);
        return;
      }
      if (isProfessorLoginOpen) {
        setIsProfessorLoginOpen(false);
        return;
      }
      if (isProfessorRegisterOpen) {
        setIsProfessorRegisterOpen(false);
        return;
      }
      // 6. If currently on a sub-tab (catalog, library, drm-info, admin), navigate back to Home
      if (currentTab !== 'home') {
        setCurrentTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    selectedBookForReader,
    selectedBookForCheckout,
    selectedBookForDetails,
    isProfessorPortalOpen,
    isStudentAuthOpen,
    isUniversitiesModalOpen,
    isUserGuideModalOpen,
    isAdminAuthModalOpen,
    isDataProtectionModalOpen,
    isProfessorLoginOpen,
    isProfessorRegisterOpen,
    currentTab,
  ]);

  const handleOpenReader = (book: Book) => {
    setSelectedBookForDetails(null);
    setSelectedBookForReader(book);
    try {
      window.history.pushState({ modal: 'reader', bookId: book.id }, '', '#reader');
    } catch {}
  };

  const handleCloseReader = () => {
    setSelectedBookForReader(null);
    try {
      if (window.location.hash === '#reader') {
        window.history.back();
      }
    } catch {}
  };

  const handleOpenDetails = (book: Book) => {
    setSelectedBookForDetails(book);
    try {
      window.history.pushState({ modal: 'details', bookId: book.id }, '', `#book-${book.id}`);
    } catch {}
  };

  const handleCloseDetails = () => {
    setSelectedBookForDetails(null);
    try {
      if (window.location.hash.startsWith('#book-')) {
        window.history.back();
      }
    } catch {}
  };

  const handleOpenCheckout = (book: Book) => {
    setSelectedBookForCheckout(book);
    try {
      window.history.pushState({ modal: 'checkout', bookId: book.id }, '', '#checkout');
    } catch {}
  };

  const handleCloseCheckout = () => {
    setSelectedBookForCheckout(null);
    try {
      if (window.location.hash === '#checkout') {
        window.history.back();
      }
    } catch {}
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'fr' ? 'ar' : 'fr'));
  };

  const showToast = (title: string, message: string) => {
    setGlobalToast({ title, message });
    setTimeout(() => {
      setGlobalToast(null);
    }, 5000);
  };

  // Direct jump from Home Launch Pad into Catalog
  const handleFilterAndGoToCatalog = (faculty?: string, semester?: string, search?: string) => {
    if (faculty !== undefined) setCatalogFacultyFilter(faculty);
    if (semester !== undefined) setCatalogSemesterFilter(semester);
    if (search !== undefined) setSearchQuery(search);
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Admin Console (Strictly Gated by Master Key Security)
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  // Successful Admin Login via Security Gateway Modal
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminAuthModalOpen(false);
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(
      lang === 'fr' ? 'Super-Administrateur Authentifié' : 'تم تأكيد هوية مدير المنصة',
      lang === 'fr'
        ? 'Session active avec accès complet à la régie commerciale, BDD et sécurité.'
        : 'تم فتح لوحة تحكم المدير العام والتحصيل التجاري بنجاح.'
    );
  };

  // Lock Admin Console
  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentTab('home');
    showToast(
      lang === 'fr' ? 'Console Admin Verrouillée' : 'تم قفل لوحة المدير',
      lang === 'fr'
        ? 'La session administrateur est désormais fermée et sécurisée.'
        : 'تم تأمين وقفل فضاء الإدارة بنجاح.'
    );
  };


  // Open Professor Space (Strictly gated by Institutional Email Auth)
  const handleOpenProfessorPortal = () => {
    if (authenticatedProfessor) {
      setIsProfessorPortalOpen(true);
    } else {
      setIsProfessorLoginOpen(true);
    }
  };

  // Successful Professor Authentication via Institutional Email + OTP
  const handleProfessorLoginSuccess = (prof: Professor) => {
    setAuthenticatedProfessor(prof);
    setIsProfessorLoginOpen(false);
    setIsProfessorPortalOpen(true);
    showToast(
      lang === 'fr' ? 'Espace Enseignant Déverrouillé' : 'تم تسجيل الدخول بنجاح',
      lang === 'fr'
        ? `Bienvenue ${prof.fullName}. Accès autorisé à votre espace commercial et pédagogique.`
        : `أهلاً وسهلاً بك ${prof.fullName}. تم فك قفل فضاء الأستاذ الخاص بنجاح.`
    );
  };

  // Professor Logout
  const handleProfessorLogout = () => {
    setAuthenticatedProfessor(null);
    setIsProfessorPortalOpen(false);
    showToast(
      lang === 'fr' ? 'Déconnexion Réussie' : 'تم تسجيل الخروج',
      lang === 'fr'
        ? 'Session enseignant fermée avec succès.'
        : 'تم إغلاق الجلسة المحمية بنجاح.'
    );
  };

  // Update Professor Bank RIB from their private portal
  const handleUpdateProfessorBankRib = (profId: string, newRib: string, bankName: string) => {
    setProfessors((prev) =>
      prev.map((p) =>
        p.id === profId ? { ...p, bankRib: newRib, bankName: bankName } : p
      )
    );
    if (authenticatedProfessor && authenticatedProfessor.id === profId) {
      setAuthenticatedProfessor((prev) =>
        prev ? { ...prev, bankRib: newRib, bankName: bankName } : null
      );
    }
  };

  // Professor Requests Royalties Payout from Admin
  const handleProfessorRequestPayout = (profId: string, amount: number) => {
    showToast(
      lang === 'fr' ? 'Demande de Virement Transmise' : 'تم إرسال طلب صرف المستحقات',
      lang === 'fr'
        ? `Votre demande de virement de ${amount} DH a été transmise à la régie centrale pour exécution.`
        : `تم إرسال طلب صرف المستحقات بقيمة ${amount} درهم إلى إدارة المنصة بنجاح.`
    );
  };

  // Student Book Acquisition with Direct Commercial Collection linked to Admin Account
  const handleAcquireBook = (
    bookId: string,
    chosenMethod?: MoroccanPaymentMethod,
    paymentDetails?: PaymentDetails,
    customDrmCode?: string
  ) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    // 1. Add to student's bookshelf
    if (!student.acquiredBookIds.includes(bookId)) {
      setStudent((prev) => ({
        ...prev,
        acquiredBookIds: [...prev.acquiredBookIds, bookId],
        bookProgress: {
          ...prev.bookProgress,
          [bookId]: {
            currentPage: 1,
            completedPercent: 5,
            lastReadAt: lang === 'fr' ? 'À l\'instant' : 'الآن',
          },
        },
      }));
    }

    // 2. Generate DRM License
    const generatedLicenseCode = customDrmCode || `FAC-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newLicense: DRMAccessLicense = {
      id: `lic-${Date.now()}`,
      licenseCode: generatedLicenseCode,
      bookId: book.id,
      bookTitle: book.title,
      studentEmail: student.email,
      studentId: student.studentId,
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active',
    };
    setDrmLicenses((prev) => [newLicense, ...prev]);

    // 3. Commercial Settlement: Link to Admin Merchant Account if paid book
    if (!book.isFree && book.priceMAD > 0) {
      const price = book.priceMAD;
      const platformFee = Math.round(price * 0.20); // 20% platform commission retained by Admin
      const professorRoyalty = price - platformFee; // 80% to author professor

      // Credit Admin Commercial Account
      setAdminCommercialAccount((prev) => ({
        ...prev,
        totalCollectedGrossMAD: prev.totalCollectedGrossMAD + price,
        platformNetEarningsMAD: prev.platformNetEarningsMAD + platformFee,
        professorsTotalEarnedMAD: prev.professorsTotalEarnedMAD + professorRoyalty,
        professorsPendingMAD: prev.professorsPendingMAD + professorRoyalty,
      }));

      // Log Payment Order credited to Admin RIB
      const newOrder: PaymentOrder = {
        id: `ord-${Date.now()}`,
        orderRef: `CMD-FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        bookId: book.id,
        bookTitle: book.title,
        amountMAD: price,
        studentName: student.fullName,
        studentEmail: student.email,
        studentId: student.studentId,
        paymentMethod: chosenMethod || 'Carte Bancaire CMI (3D-Secure)',
        paymentDetails: paymentDetails,
        recipientAdminRib: adminCommercialAccount.bankRib,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'encaisse_succes',
        drmKeyGenerated: generatedLicenseCode,
      };
      setPaymentOrders((prev) => [newOrder, ...prev]);

      // Credit matching author professor
      setProfessors((prev) =>
        prev.map((prof) => {
          if (
            prof.fullName.includes(book.author.replace('Pr. ', '')) ||
            book.author.includes(prof.fullName)
          ) {
            return {
              ...prof,
              totalSalesCount: prof.totalSalesCount + 1,
              totalEarningsMAD: prof.totalEarningsMAD + professorRoyalty,
              pendingPayoutMAD: prof.pendingPayoutMAD + professorRoyalty,
            };
          }
          return prof;
        })
      );

      showToast(
        lang === 'fr' ? 'Paiement Encaissé sur Compte Admin' : 'تم التحصيل التجاري بحساب الإدارة',
        lang === 'fr'
          ? `${price} DH encaissés via ${chosenMethod || 'Système Bancaire'}. Licence DRM ${generatedLicenseCode} assignée.`
          : `تم تحصيل مبلغ ${price} درهم عبر (${chosenMethod || 'النظام البنكي/التحويل'}). رخصة DRM نشطة بجهازك.`
      );
    } else {
      showToast(
        lang === 'fr' ? 'Polycopié Débloqué (Gratuit)' : 'تم تفعيل المقرر المجاني',
        lang === 'fr'
          ? `Livre débloqué avec succès ! Licence DRM n° ${generatedLicenseCode} assignée.`
          : `تم تفعيل الكتاب المجاني بنجاح وربط الترخيص الأكاديمي بجهازك.`
      );
    }

    setSelectedBookForDetails(null);
    setSelectedBookForReader(book);
  };

  // Student Redeem Code Input with Strict Anti-Sharing & Single Device Locking
  const handleRedeemCode = (code: string): { success: boolean; messageFr: string; messageAr: string } => {
    const cleanCode = code.trim().toUpperCase();
    const matchingLicense = drmLicenses.find(
      (lic) => lic.licenseCode.toUpperCase() === cleanCode
    );

    if (!matchingLicense) {
      return {
        success: false,
        messageFr: 'Code de licence introuvable ou inexistant. Veuillez vérifier le code figurant sur votre reçu de paiement.',
        messageAr: 'كود الترخيص غير موجود أو غير صحيح. يرجى التأكد من الرمز المستلم في إيصال الاقتناء والتفعيل.',
      };
    }

    if (matchingLicense.status === 'revoked') {
      return {
        success: false,
        messageFr: 'Ce code de licence a été révoqué par l\'administration.',
        messageAr: 'تم إلغاء صلاحية هذا الترخيص من قبل إدارة المنصة.',
      };
    }

    // 1. Strict Anti-Sharing Rule: If already redeemed by another student on another terminal
    if (
      matchingLicense.isRedeemed &&
      matchingLicense.redeemedByStudentId &&
      matchingLicense.redeemedByStudentId !== student.studentId
    ) {
      return {
        success: false,
        messageFr:
          'Ce code de licence a déjà été activé et verrouillé sur un premier terminal par un autre étudiant. Conformément au protocole DRM, ce code est strictement individuel et ne peut être partagé.',
        messageAr:
          'كود الترخيص هذا تم تفعيله مسبقاً وتثبيته على جهاز طالب آخر. وفقاً لبروتوكول الحماية DRM، الكود فردي للاستعمال الأول فقط ولا يمكن مشاركته.',
      };
    }

    // 2. Check if already present in student's bookshelf
    if (student.acquiredBookIds.includes(matchingLicense.bookId)) {
      return {
        success: false,
        messageFr: `Le polycopié "${matchingLicense.bookTitle}" est déjà actif et débloqué dans votre bibliothèque.`,
        messageAr: `المقرر "${matchingLicense.bookTitle}" مفعل ومتاح مسبقاً في مكتبتك.`,
      };
    }

    // 3. First-time successful activation: Lock permanently to this student and device terminal
    const updatedLicense: DRMAccessLicense = {
      ...matchingLicense,
      status: 'locked_to_device',
      isRedeemed: true,
      redeemedByStudentId: student.studentId,
      redeemedByStudentEmail: student.email,
      redeemedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      boundDeviceFingerprint: student.registeredDevice || 'TERMINAL-PC-01-SECURE',
    };

    setDrmLicenses((prev) =>
      prev.map((lic) => (lic.id === matchingLicense.id ? updatedLicense : lic))
    );

    setStudent((prev) => ({
      ...prev,
      acquiredBookIds: [...prev.acquiredBookIds, matchingLicense.bookId],
      bookProgress: {
        ...prev.bookProgress,
        [matchingLicense.bookId]: {
          currentPage: 1,
          completedPercent: 5,
          lastReadAt: lang === 'fr' ? 'À l\'instant (Verrouillé in-app)' : 'الآن (مقفل بالجهاز)',
        },
      },
    }));

    showToast(
      lang === 'fr' ? 'Licence DRM Verrouillée sur cet Appareil' : 'تم تثبيت الترخيص وحصره على هذا الجهاز',
      lang === 'fr'
        ? `Le polycopié "${matchingLicense.bookTitle}" a été ajouté à votre bibliothèque. Vous êtes le seul bénéficiaire autorisé.`
        : `تمت إضافة مقرر "${matchingLicense.bookTitle}" لمكتبتك. هذا الجهاز هو المستفيد الحصري ولا يمكن تقاسم الكود.`
    );

    return {
      success: true,
      messageFr: `Licence validée et verrouillée avec succès sur cet appareil pour le cours : "${matchingLicense.bookTitle}". Vous êtes le seul bénéficiaire autorisé.`,
      messageAr: `تم تفعيل وتثبيت الترخيص بنجاح على هذا الجهاز لمقرر: "${matchingLicense.bookTitle}". هذا الجهاز هو المستفيد الحصري ولا يمكن تقاسم الكود.`,
    };
  };

  // Add Notice from Professor
  const handleAddProfessorNotice = (notice: ProfessorNotice) => {
    setProfessorNotices((prev) => [notice, ...prev]);
    showToast(
      lang === 'fr' ? 'Avis Enseignant Diffusé' : 'تم نشر توجيه الأستاذ',
      lang === 'fr'
        ? `Votre avis pour le module ${notice.moduleName} est maintenant affiché sur la page d'accueil.`
        : `تم نشر الإشعار في الصفحة الرئيسية بنجاح.`
    );
  };

  // ADMIN: Add Book
  const handleAddBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setFaculties((prev) =>
      prev.map((f) =>
        f.code.toLowerCase().includes(newBook.faculty) ? { ...f, bookCount: f.bookCount + 1 } : f
      )
    );
    showToast(
      lang === 'fr' ? 'Nouveau Livre Ajouté' : 'تم إضافة الكتاب بنجاح',
      lang === 'fr'
        ? `Le polycopié "${newBook.title}" a été ajouté au catalogue avec chiffrement DRM.`
        : `تم إدراج المقرر الأكاديمي وتفعيل حمايته في التطبيق.`
    );
  };

  // Update Book Attached PDF & Page Count in Central Catalog
  const handleUpdateBookPdf = (
    bookId: string,
    pdfUrl: string,
    totalPages?: number,
    fileName?: string
  ) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            hasPdf: true,
            pdfUrl,
            totalPages: totalPages && totalPages > 0 ? totalPages : b.totalPages,
            pdfFileName: fileName || b.pdfFileName,
          };
        }
        return b;
      })
    );

    if (selectedBookForReader && selectedBookForReader.id === bookId) {
      setSelectedBookForReader((prev) =>
        prev
          ? {
              ...prev,
              hasPdf: true,
              pdfUrl,
              totalPages: totalPages && totalPages > 0 ? totalPages : prev.totalPages,
              pdfFileName: fileName || prev.pdfFileName,
            }
          : null
      );
    }
  };

  // ADMIN: Update Book Price
  const handleUpdateBookPrice = (bookId: string, newPrice: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, priceMAD: newPrice, isFree: newPrice === 0 } : b))
    );
    showToast(
      lang === 'fr' ? 'Tarif Mis à Jour' : 'تم تعديل السعر',
      lang === 'fr'
        ? `Le prix du cours a été actualisé à ${newPrice} MAD.`
        : `تم تحديث سعر المقرر بنجاح.`
    );
  };

  // ADMIN: Delete Book
  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    showToast(
      lang === 'fr' ? 'Livre Retiré' : 'تم حذف المقرر',
      lang === 'fr' ? 'Le cours a été supprimé du catalogue.' : 'تم إزالة الكتاب من المنصة.'
    );
  };

  // ADMIN or SELF-REGISTRATION: Add Professor
  const handleAddProfessor = (newProf: Professor) => {
    setProfessors((prev) => [newProf, ...prev]);
    // Automatically log in the newly registered professor!
    setAuthenticatedProfessor(newProf);
    showToast(
      lang === 'fr' ? 'Compte Enseignant Enregistré & Connecté' : 'تم تفعيل الحساب وتسجيل الدخول',
      lang === 'fr'
        ? `${newProf.fullName} a été enregistré avec abonnement gratuit et connecté automatiquement.`
        : `تم تسجيل حساب ${newProf.fullName} بنجاح وتسجيل الدخول فوراً.`
    );
  };

  // ADMIN: Delete Professor Account (Requirement 7 & 8)
  const handleDeleteProfessor = (profId: string) => {
    setProfessors((prev) => prev.filter((p) => p.id !== profId));
    if (authenticatedProfessor && authenticatedProfessor.id === profId) {
      setAuthenticatedProfessor(null);
      setIsProfessorPortalOpen(false);
    }
    showToast(
      lang === 'fr' ? 'Compte Enseignant Supprimé' : 'تم حذف وإلغاء حساب الأستاذ',
      lang === 'fr' ? 'Le compte enseignant a été révoqué par la direction.' : 'تم إلغاء حساب الأستاذ نهائياً من قبل الإدارة.'
    );
  };

  // ADMIN: Toggle Professor Status (Active / Suspended)
  const handleToggleProfessorStatus = (profId: string) => {
    setProfessors((prev) =>
      prev.map((p) => {
        if (p.id === profId) {
          const nextStatus = p.status === 'suspended' ? 'active' : 'suspended';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // ADMIN: Delete Student Account (Requirement 7)
  const handleDeleteStudent = (studentId: string) => {
    setRegisteredStudents((prev) => prev.filter((s) => s.id !== studentId && s.studentId !== studentId));
    if (student.id === studentId || student.studentId === studentId) {
      setStudent(initialStudentProfile);
    }
    showToast(
      lang === 'fr' ? 'Compte Étudiant Supprimé' : 'تم حذف وإلغاء حساب الطالب',
      lang === 'fr' ? 'Le compte étudiant a été supprimé par l\'administration.' : 'تم إلغاء حساب الطالب نهائياً من المنصة.'
    );
  };

  // ADMIN: Toggle Student Status (Active / Suspended)
  const handleToggleStudentStatus = (studentId: string) => {
    setRegisteredStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId || s.studentId === studentId) {
          const nextStatus = s.status === 'suspended' ? 'active' : 'suspended';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // ADMIN: Execute Bank Payout to Professor from Admin Account
  const handleExecutePayout = (payout: PayoutTransaction) => {
    setPayoutTransactions((prev) => [payout, ...prev]);

    // Update Professor's pending payout & total paid
    setProfessors((prev) =>
      prev.map((p) => {
        if (p.id === payout.professorId) {
          const newPending = Math.max(0, p.pendingPayoutMAD - payout.amountMAD);
          return {
            ...p,
            paidAmountMAD: p.paidAmountMAD + payout.amountMAD,
            pendingPayoutMAD: newPending,
          };
        }
        return p;
      })
    );

    // If currently authenticated professor is this professor, update their active session too
    if (authenticatedProfessor && authenticatedProfessor.id === payout.professorId) {
      setAuthenticatedProfessor((prev) =>
        prev
          ? {
              ...prev,
              paidAmountMAD: prev.paidAmountMAD + payout.amountMAD,
              pendingPayoutMAD: Math.max(0, prev.pendingPayoutMAD - payout.amountMAD),
            }
          : null
      );
    }

    // Update Admin Commercial Account liability
    setAdminCommercialAccount((prev) => ({
      ...prev,
      professorsTotalPaidMAD: prev.professorsTotalPaidMAD + payout.amountMAD,
      professorsPendingMAD: Math.max(0, prev.professorsPendingMAD - payout.amountMAD),
    }));

    showToast(
      lang === 'fr' ? 'Virement Exécuté avec Succès' : 'تم تنفيذ التحويل البنكي',
      lang === 'fr'
        ? `Ordre de virement bancaire ${payout.reference} de ${payout.amountMAD} DH émis vers le RIB ${payout.bankRib}.`
        : `تم إرسال التحويل البنكي بقيمة ${payout.amountMAD} درهم للأستاذ بنجاح.`
    );
  };

  // ADMIN: Generate and Dispatch DRM Key to Student
  const handleGenerateAndDispatchLicense = (license: DRMAccessLicense) => {
    setDrmLicenses((prev) => [license, ...prev]);

    // If the student currently active in app matches the recipient, unlock the book immediately!
    if (student.email.toLowerCase() === license.studentEmail.toLowerCase()) {
      if (!student.acquiredBookIds.includes(license.bookId)) {
        setStudent((prev) => ({
          ...prev,
          acquiredBookIds: [...prev.acquiredBookIds, license.bookId],
        }));
      }
    }

    showToast(
      lang === 'fr' ? 'Licence DRM Émise & Envoyée' : 'تم إرسال رخصة الدخول للطالب',
      lang === 'fr'
        ? `Code ${license.licenseCode} assigné à ${license.studentEmail} avec accès in-app immédiat.`
        : `تم إصدار ترخيص القراءة بنجاح وإرساله للطالب.`
    );
  };

  // ADMIN: Revoke DRM License
  const handleRevokeLicense = (licenseId: string) => {
    setDrmLicenses((prev) =>
      prev.map((l) => (l.id === licenseId ? { ...l, status: 'revoked' as const } : l))
    );
    showToast(
      lang === 'fr' ? 'Licence Révoquée' : 'تم إلغاء الترخيص',
      lang === 'fr' ? 'L\'accès in-app à ce polycopié a été désactivé.' : 'تم سحب ترخيص القراءة.'
    );
  };

  // ADMIN: Add Faculty
  const handleAddFaculty = (newFaculty: FacultyItem) => {
    setFaculties((prev) => [...prev, newFaculty]);
    showToast(
      lang === 'fr' ? 'Établissement Ajouté' : 'تم إضافة المؤسسة',
      lang === 'fr' ? `${newFaculty.nameFr} (${newFaculty.code}) a été créée.` : `تم تسجيل الكلية بنجاح.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* Global Notification Toast */}
      {globalToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-emerald-950 border border-emerald-500 text-white rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-emerald-200">{globalToast.title}</div>
              <div className="text-emerald-100">{globalToast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Top Navigation with Bespoke Logo & Gorgeous Admin Button */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'admin') {
            handleOpenAdmin();
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenProfessorPortal={handleOpenProfessorPortal}
        onOpenProfessorRegister={() => setIsProfessorRegisterOpen(true)}
        onOpenUniversitiesModal={() => setIsUniversitiesModalOpen(true)}
        onOpenStudentAuth={() => setIsStudentAuthOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminAuthenticated={isAdminAuthenticated}
        onLockAdmin={handleLockAdmin}
        onOpenDataProtectionModal={() => setIsDataProtectionModalOpen(true)}
        authenticatedProfessor={authenticatedProfessor}
        onLogoutProfessor={handleProfessorLogout}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE (صفحة الاستقبال) */}
        {currentTab === 'home' && (
          <HomePage
            books={books}
            facultyNews={facultyNews}
            professorNotices={professorNotices}
            student={student}
            professors={professors}
            onNavigateTab={(tab) => {
              if (tab === 'admin') {
                handleOpenAdmin();
              } else {
                setCurrentTab(tab);
              }
            }}
            onFilterAndGoToCatalog={handleFilterAndGoToCatalog}
            onOpenProfessorPortal={handleOpenProfessorPortal}
            onOpenProfessorRegister={() => setIsProfessorRegisterOpen(true)}
            onOpenUniversitiesModal={() => setIsUniversitiesModalOpen(true)}
            onOpenStudentAuth={() => setIsStudentAuthOpen(true)}
            onOpenAdmin={handleOpenAdmin}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenDataProtectionModal={() => setIsDataProtectionModalOpen(true)}
            authenticatedProfessor={authenticatedProfessor}
            onOpenBookDetails={(book) => setSelectedBookForDetails(book)}
            onOpenBookReader={(book) => setSelectedBookForReader(book)}
            onOpenVisitorCatalog={() => {
              setIsVisitorMode(true);
              setCurrentTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenUserGuide={(target) => {
              setUserGuideInitialTab(target || 'guide_student');
              setIsUserGuideModalOpen(true);
            }}
            lang={lang}
          />
        )}


        {/* VIEW 2: CATALOG (دليل المقررات / المعرض العام للمكتبة) */}
        {currentTab === 'catalog' && (
          <>
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              lang={lang}
              onExploreClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }
              }}
              onSecurityClick={() => setCurrentTab('drm-info')}
              onOpenUserGuide={(target) => {
                setUserGuideInitialTab(target || 'guide_student');
                setIsUserGuideModalOpen(true);
              }}
            />
            <div id="catalog-section">
              <BookCatalog
                books={books}
                acquiredBookIds={student.acquiredBookIds}
                searchQuery={searchQuery}
                selectedFaculty={catalogFacultyFilter}
                onSelectFaculty={setCatalogFacultyFilter}
                selectedSemester={catalogSemesterFilter}
                onSelectSemester={setCatalogSemesterFilter}
                onOpenDetails={handleOpenDetails}
                onOpenReader={handleOpenReader}
                onQuickBuy={handleOpenCheckout}
                onReturnHome={() => setCurrentTab('home')}
                isVisitorMode={isVisitorMode}
                onToggleVisitorMode={() => setIsVisitorMode((prev) => !prev)}
                lang={lang}
              />
            </div>
          </>
        )}

        {/* VIEW 3: STUDENT LIBRARY (فضاء الطالب) */}
        {currentTab === 'library' && (
          <ErrorBoundary
            fallbackTitle={lang === 'fr' ? 'Espace Étudiant / فضاء الطالب' : 'فضاء الطالب / Espace Étudiant'}
            onReset={() => setCurrentTab('home')}
          >
            <StudentLibrary
              student={student}
              allBooks={books}
              paymentOrders={paymentOrders}
              onOpenReader={handleOpenReader}
              onExploreCatalog={() => setCurrentTab('catalog')}
              onRedeemCode={handleRedeemCode}
              onBuyBook={handleOpenCheckout}
              onEditProfile={() => setIsStudentAuthOpen(true)}
              onReturnHome={() => setCurrentTab('home')}
              lang={lang}
            />
          </ErrorBoundary>
        )}

        {/* VIEW 4: DRM PROTECTION INFO (نظام الحماية الرقمية) */}
        {currentTab === 'drm-info' && (
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
              <button
                onClick={() => setCurrentTab('home')}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>{lang === 'fr' ? 'Revenir à la page d\'Accueil' : 'العودة إلى الصفحة الرئيسية'}</span>
              </button>
            </div>
            <DRMInfoView student={student} lang={lang} />
          </div>
        )}

        {/* VIEW 5: ADMIN DASHBOARD (لوحة تحكم المدير & التحصيل التجاري) */}
          {currentTab === 'admin' && (
            <div>
              <UploadBook />
          isAdminAuthenticated ? (
            <ErrorBoundary
              fallbackTitle={lang === 'fr' ? 'Console d\'Administration / لوحة المدير' : 'لوحة المدير / Console d\'Administration'}
              onReset={() => setCurrentTab('home')}
            >
              <AdminDashboard
                books={books}
                onAddBook={handleAddBook}
                onUpdateBookPrice={handleUpdateBookPrice}
                onDeleteBook={handleDeleteBook}
                onUpdateBookPdf={handleUpdateBookPdf}
                professors={professors}
                onAddProfessor={handleAddProfessor}
                onExecutePayout={handleExecutePayout}
                onDeleteProfessor={handleDeleteProfessor}
                onToggleProfessorStatus={handleToggleProfessorStatus}
                students={registeredStudents}
                onDeleteStudent={handleDeleteStudent}
                onToggleStudentStatus={handleToggleStudentStatus}
                drmLicenses={drmLicenses}
                onGenerateAndDispatchLicense={handleGenerateAndDispatchLicense}
                onRevokeLicense={handleRevokeLicense}
                faculties={faculties}
                onAddFaculty={handleAddFaculty}
                payoutTransactions={payoutTransactions}
                adminCommercialAccount={adminCommercialAccount}
                paymentOrders={paymentOrders}
                onOpenReader={(book) => setSelectedBookForReader(book)}
                onReturnHome={() => setCurrentTab('home')}
                onLockAdmin={handleLockAdmin}
                lang={lang}
              />
            </ErrorBoundary>
          ) : (
            <div className="max-w-xl mx-auto my-16 px-4">
              <div className="p-8 rounded-3xl bg-stone-900 border border-amber-500/30 text-center shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {lang === 'fr' ? 'Accès Administrateur Restreint' : 'فضاء الإدارة محمي برمز الأمان'}
                </h2>
                <p className="text-sm text-stone-300 mb-6">
                  {lang === 'fr'
                    ? 'Cette console est protégée. Veuillez vous identifier en tant que Super-Administrateur.'
                    : 'هذا الفضاء مخصص حصرياً لمدير التطبيق. يرجى إدخال رمز الأمان أو المصادقة لمتابعة العمل وحماية المعطيات.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsAdminAuthModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm transition-all cursor-pointer shadow-md"
                  >
                    {lang === 'fr' ? 'Saisir le Code d\'Accès' : 'إدخال رمز المرور'}
                  </button>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm transition-all cursor-pointer"
                  >
                    {lang === 'fr' ? 'Retourner à l\'Accueil' : 'العودة للرئيسية'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Book Detail Modal with Commercial Checkout Linked to Admin Account */}
      {selectedBookForDetails && (
        <BookDetailModal
          book={selectedBookForDetails}
          student={student}
          isAcquired={student.acquiredBookIds.includes(selectedBookForDetails.id)}
          adminRib={adminCommercialAccount.bankRib}
          onClose={handleCloseDetails}
          onOpenReader={handleOpenReader}
          onAcquire={handleAcquireBook}
          lang={lang}
        />
      )}

      {/* Secure In-App Protected Reader */}
      {selectedBookForReader && (
        <ErrorBoundary
          fallbackTitle={lang === 'fr' ? 'Lecteur In-App Sécurisé / القارئ الرقمي المشفر' : 'القارئ الرقمي المشفر / Lecteur In-App'}
          onReset={handleCloseReader}
        >
          <SecureReader
            book={selectedBookForReader}
            student={student}
            isAcquired={student.acquiredBookIds.includes(selectedBookForReader.id)}
            isAuthorOrAdmin={
              isAdminAuthenticated ||
              (authenticatedProfessor != null &&
                (selectedBookForReader.author === authenticatedProfessor.fullName ||
                  selectedBookForReader.author.includes(authenticatedProfessor.fullName) ||
                  authenticatedProfessor.fullName.includes(selectedBookForReader.author)))
            }
            onClose={handleCloseReader}
            onAcquireBook={handleAcquireBook}
            onUpdateBookPdf={handleUpdateBookPdf}
            lang={lang}
          />
        </ErrorBoundary>
      )}

      {/* Gated Professor Login Modal (Authentication via Institutional Email + OTP) */}
      {isProfessorLoginOpen && (
        <ProfessorLoginModal
          professors={professors}
          onLoginSuccess={handleProfessorLoginSuccess}
          onOpenRegister={() => {
            setIsProfessorLoginOpen(false);
            setIsProfessorRegisterOpen(true);
          }}
          onClose={() => setIsProfessorLoginOpen(false)}
          lang={lang}
        />
      )}

      {/* Dedicated Professor Portal Modal (Strictly Private for Authenticated Professor) */}
      {isProfessorPortalOpen && authenticatedProfessor && (
        <ErrorBoundary
          fallbackTitle={lang === 'fr' ? 'Espace Enseignant / فضاء الأستاذ' : 'فضاء الأستاذ / Espace Enseignant'}
          onReset={() => setIsProfessorPortalOpen(false)}
        >
          <ProfessorPortalModal
            professor={authenticatedProfessor}
            books={books}
            onAddNotice={handleAddProfessorNotice}
            onUpdateBankRib={handleUpdateProfessorBankRib}
            onRequestPayout={handleProfessorRequestPayout}
            onUploadBook={(newBook) => {
              handleAddBook(newBook);
              showToast(
                lang === 'fr' ? 'Polycopié Publié' : 'تم نشر المطبوع بنجاح',
                lang === 'fr'
                  ? `Votre livre "${newBook.title}" est maintenant disponible dans la bibliothèque.`
                  : `أصبح مقررك "${newBook.title}" متاحاً الآن في المعرض العام للمكتبة.`
              );
            }}
            onUpdateBookPdf={handleUpdateBookPdf}
            onOpenReader={handleOpenReader}
            onLogout={handleProfessorLogout}
            onClose={() => setIsProfessorPortalOpen(false)}
            lang={lang}
          />
        </ErrorBoundary>
      )}

      {/* Professor Free Inscription Modal */}
      {isProfessorRegisterOpen && (
        <ProfessorRegisterModal
          onRegisterProfessor={handleAddProfessor}
          onClose={() => setIsProfessorRegisterOpen(false)}
          onOpenTerms={(target) => {
            setUserGuideInitialTab(target || 'guide_professor');
            setIsUserGuideModalOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* Full Universities & Specialties Database Modal */}
      {isUniversitiesModalOpen && (
        <UniversitiesModal
          onClose={() => setIsUniversitiesModalOpen(false)}
          onFilterAndGoToCatalog={handleFilterAndGoToCatalog}
          onOpenProfessorRegister={() => {
            setIsUniversitiesModalOpen(false);
            setIsProfessorRegisterOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* Student Profile & Registration Modal (Point 1: تسجيل معطيات الطالب) */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        student={student}
        targetCourse={pendingCourseForStudent}
        onSaveProfile={(updated) => {
          setStudent(updated);
          if (pendingCourseForStudent) {
            setSelectedBookForDetails(pendingCourseForStudent);
            const courseTitle = pendingCourseForStudent.titleAr || pendingCourseForStudent.title;
            setPendingCourseForStudent(null);
            showToast(
              lang === 'fr' ? 'Tarif Préférentiel Débloqué !' : 'تم تفعيل التعريفة التفضيلية للطلبة!',
              lang === 'fr'
                ? `Bienvenue, ${updated.fullName} ! Vous accédez directement au cours "${courseTitle}" au tarif préférentiel.`
                : `مرحباً بك، ${updated.fullName}! تم تفعيل التعريفة التفضيلية لمقرر "${courseTitle}" والدخول التلقائي للاقتناء.`
            );
          } else {
            showToast(
              lang === 'fr' ? 'Données Étudiant Enregistrées' : 'تم حفظ معطيات الطالب',
              lang === 'fr'
                ? `Bienvenue, ${updated.fullName} ! Votre profil universitaire a été mis à jour.`
                : `مرحباً بك، ${updated.fullName}! تم تحديث بطاقتك الجامعية بنجاح.`
            );
          }
        }}
        onClose={() => {
          setIsStudentAuthOpen(false);
          setPendingCourseForStudent(null);
        }}
        onGoToLibrary={() => {
          setCurrentTab('library');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTerms={(target) => {
          setUserGuideInitialTab(target || 'guide_student');
          setIsUserGuideModalOpen(true);
        }}
        lang={lang}
      />

      {/* Direct Moroccan Checkout Modal (Point 4: شراء الكتاب بجميع طرق الأداء) */}
      {selectedBookForCheckout && (
        <MoroccanCheckoutModal
          book={selectedBookForCheckout}
          student={student}
          adminRib={adminCommercialAccount.bankRib}
          onClose={handleCloseCheckout}
          onSuccess={(method, details, drmCode) => {
            handleAcquireBook(selectedBookForCheckout.id, method, details, drmCode);
            handleCloseCheckout();
          }}
          lang={lang}
        />
      )}

      {/* Admin Security Authentication Gateway Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onSuccess={handleAdminLoginSuccess}
        onClose={() => setIsAdminAuthModalOpen(false)}
        lang={lang}
      />

      {/* Data Protection, CNDP Compliance & Payment Shield Modal */}
      <DataProtectionModal
        isOpen={isDataProtectionModalOpen}
        onClose={() => setIsDataProtectionModalOpen(false)}
        lang={lang}
      />

      {/* User Guide, Platform Contract & CNDP Terms Modal (User Request 1 & 2) */}
      <UserGuideAndTermsModal
        isOpen={isUserGuideModalOpen}
        initialTab={userGuideInitialTab}
        onClose={() => setIsUserGuideModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
