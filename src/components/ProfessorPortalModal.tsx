import React, { useState } from 'react';
import { Professor, ProfessorNotice, Book, FacultyType, SemesterType } from '../types';
import { UNIVERSITIES_DATABASE } from '../data/mockBooks';
import {
  X,
  Award,
  CreditCard,
  DollarSign,
  BookOpen,
  Send,
  CheckCircle2,
  Bell,
  Sparkles,
  LogOut,
  Landmark,
  ShieldCheck,
  Edit2,
  Save,
  Upload,
  FileText,
  Layers,
  Building2,
  PlusCircle,
  Eye,
  Image as ImageIcon,
  KeyRound,
  AlertCircle,
  Share2,
  QrCode,
  Loader2,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { generateDefaultCoverSvg } from '../utils/storage';
import { saveBookPdf, compressCoverImage } from '../utils/pdfStorage';
import { useAcademicStructure, registerDynamicAcademicUnit } from '../utils/academicStructureStorage';
import { BookShareModal } from './BookShareModal';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}


interface ProfessorPortalModalProps {
  professor: Professor;
  books: Book[];
  onAddNotice: (notice: ProfessorNotice) => void;
  onUpdateBankRib?: (profId: string, newRib: string, bankName: string) => void;
  onRequestPayout?: (profId: string, amount: number) => void;
  onUploadBook?: (newBook: Book) => void;
  onOpenReader?: (book: Book) => void;
  onUpdatePin?: (profId: string, newPin: string) => void;
  onLogout: () => void;
  onClose: () => void;
  lang: 'fr' | 'ar';
}

const PRESET_COVERS = [
  { id: 'c1', label: 'Droit & Jurisprudence', url: '/src/assets/images/droit_jurisprudence_cover_1791375901253.jpg' },
  { id: 'c2', label: 'Économie & Finance', url: '/src/assets/images/economie_gestion_cover_1791375916053.jpg' },
  { id: 'c3', label: 'Sciences & Informatique', url: '/src/assets/images/sciences_technologies_cover_1791375928812.jpg' },
  { id: 'c4', label: 'Médecine & Santé', url: '/src/assets/images/medecine_sante_cover_1791375945398.jpg' },
];

export const ProfessorPortalModal: React.FC<ProfessorPortalModalProps> = ({
  professor,
  books,
  onAddNotice,
  onUpdateBankRib,
  onRequestPayout,
  onUploadBook,
  onOpenReader,
  onUpdatePin,
  onLogout,
  onClose,
  lang,
}) => {
  const { specialties, modules } = useAcademicStructure();

  const [activeTab, setActiveTab] = useState<'overview' | 'upload_book' | 'notice'>('overview');
const [profPdfToast, setProfPdfToast] = useState<string | null>(null);
  // Notice state
  const [noticeMessageFr, setNoticeMessageFr] = useState('');
  const [noticeMessageAr, setNoticeMessageAr] = useState('');
  const [noticeModuleName, setNoticeModuleName] = useState('');
  const [publishedToast, setPublishedToast] = useState(false);
  const [payoutRequestedToast, setPayoutRequestedToast] = useState(false);

  // RIB Editing State
  const [isEditingRib, setIsEditingRib] = useState(false);
  const [editedRib, setEditedRib] = useState(professor.bankRib);
  const [editedBankName, setEditedBankName] = useState(professor.bankName);
  const [ribSavedToast, setRibSavedToast] = useState(false);

  // PIN Changing State (Requirement 10)
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccessToast, setPinChangeSuccessToast] = useState(false);

  // Book Upload Form State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('12.4 Mo');
  const [uploadPageCount, setUploadPageCount] = useState<number>(140);
  const [newBookTitleFr, setNewBookTitleFr] = useState('');
  const [newBookTitleAr, setNewBookTitleAr] = useState('');
  const [newBookModule, setNewBookModule] = useState('');
  
  // Dynamic Specialty for the book
  const [selectedBookSpecialty, setSelectedBookSpecialty] = useState<string>(
    professor.specialty || specialties[0]?.nameFr || 'Droit Privé en Français'
  );
  const [isCustomBookSpecialty, setIsCustomBookSpecialty] = useState(false);
  const [customBookSpecialtyFr, setCustomBookSpecialtyFr] = useState('');
  const [customBookSpecialtyAr, setCustomBookSpecialtyAr] = useState('');
  const [customBookSpecialtyCycle, setCustomBookSpecialtyCycle] = useState<'Licence' | 'Master' | 'Doctorat' | 'Ingénieur' | 'Médecine'>('Licence');

  // Dynamic Module for the book
  const [selectedBookModule, setSelectedBookModule] = useState<string>(
    professor.module || modules[0]?.nameFr || ''
  );
  const [isCustomBookModule, setIsCustomBookModule] = useState(false);
  const [customBookModuleFr, setCustomBookModuleFr] = useState('');
  const [customBookModuleAr, setCustomBookModuleAr] = useState('');

  const [structureToast, setStructureToast] = useState<string | null>(null);

  const [newBookSemester, setNewBookSemester] = useState<SemesterType>('S3');
  const [newBookFaculty, setNewBookFaculty] = useState<FacultyType>('droit');
  const [newBookFacultyLabel, setNewBookFacultyLabel] = useState(professor.faculty);
  const [newBookPriceMAD, setNewBookPriceMAD] = useState('45');
  const [customCoverImage, setCustomCoverImage] = useState<string | null>(null);
  const [newBookCover, setNewBookCover] = useState<string>(
    generateDefaultCoverSvg('Cours Universitaire', professor.fullName, 'droit')
  );
  const [newBookDesc, setNewBookDesc] = useState('');
  const [bookUploadedToast, setBookUploadedToast] = useState(false);
  const [sharingModalBook, setSharingModalBook] = useState<Book | null>(null);
  const [recentlyUploadedBook, setRecentlyUploadedBook] = useState<Book | null>(null);

  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  const profBooks = books.filter(
    (b) =>
      b.author.includes(professor.fullName.replace('Pr. ', '')) ||
      b.author.includes(professor.fullName)
  );

  const handleSimulatedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedPdfFile(file);
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} Mo`);

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setIsProcessingPdf(true);
        try {
          const arrayBuffer = await file.arrayBuffer();
          const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setUploadPageCount(doc.numPages);
        } catch {
          const estimatedPages = Math.max(20, Math.floor(file.size / (1024 * 50)));
          setUploadPageCount(estimatedPages);
        } finally {
          setIsProcessingPdf(false);
        }
      } else {
        const estimatedPages = Math.max(20, Math.floor(file.size / (1024 * 50)));
        setUploadPageCount(estimatedPages);
      }

      if (!newBookTitleFr) {
        setNewBookTitleFr(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  // Custom Book Cover File Upload (compressed to prevent localStorage overflow)
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressed = await compressCoverImage(file);
      if (compressed) {
        setCustomCoverImage(compressed);
        setNewBookCover(compressed);
      }
    }
  };

  // Real PDF Upload handler for existing professor books
  
  const handleUploadPdfForProfBook = async (bookId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        alert(lang === 'fr' ? 'Veuillez sélectionner un fichier PDF valide (.pdf)' : 'يرجى اختيار ملف بصيغة PDF (.pdf)');
        return;
      }
      try {
        await saveBookPdf(bookId, file);
        setProfPdfToast(
          lang === 'fr'
            ? `Fichier PDF "${file.name}" attaché et stocké dans la mémoire locale sécurisée ! (${(file.size / (1024 * 1024)).toFixed(1)} Mo)`
            : `تم رفع ملف "${file.name}" وتخزينه في الذاكرة المشفرة للمتصفح بنجاح لهذا المقرر!`
        );
        setTimeout(() => setProfPdfToast(null), 5000);
      } catch (err) {
        console.error('Failed to attach PDF for professor book:', err);
      }
    }
  };

  // Submit Professor PIN change
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    const expectedCurrent = professor.pinCode || '123456';
    if (currentPinInput.trim() !== expectedCurrent) {
      setPinChangeError(lang === 'fr' ? 'Ancien code secret (PIN) incorrect.' : 'القن السري الحالي غير صحيح.');
      return;
    }
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      setPinChangeError(lang === 'fr' ? 'Le nouveau code secret doit comporter au moins 4 caractères.' : 'يجب أن يتكون القن السري من 4 خانات على الأقل.');
      return;
    }
    if (newPinInput.trim() !== confirmNewPinInput.trim()) {
      setPinChangeError(lang === 'fr' ? 'Les deux codes ne correspondent pas.' : 'القن السري وتأكيده غير متطابقين.');
      return;
    }
    if (onUpdatePin) {
      onUpdatePin(professor.id, newPinInput.trim());
    }
    setPinChangeSuccessToast(true);
    setTimeout(() => {
      setPinChangeSuccessToast(false);
      setIsChangingPin(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
    }, 2000);
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeMessageFr.trim() && !noticeMessageAr.trim()) return;

    const newNotice: ProfessorNotice = {
      id: `not-${Date.now()}`,
      professorId: professor.id,
      professorName: professor.fullName,
      professorTitle: professor.title,
      faculty: professor.faculty,
      moduleName: noticeModuleName.trim() || 'Module Universitaire',
      messageFr: noticeMessageFr.trim() || noticeMessageAr.trim(),
      messageAr: noticeMessageAr.trim() || noticeMessageFr.trim(),
      date: 'À l\'instant',
      pinned: true,
    };

    onAddNotice(newNotice);
    setPublishedToast(true);
    setTimeout(() => setPublishedToast(false), 3500);
    setNoticeMessageFr('');
    setNoticeMessageAr('');
    setNoticeModuleName('');
  };

  const handleSaveRib = () => {
    if (onUpdateBankRib && editedRib.trim()) {
      onUpdateBankRib(professor.id, editedRib.trim(), editedBankName);
      setIsEditingRib(false);
      setRibSavedToast(true);
      setTimeout(() => setRibSavedToast(false), 3000);
    }
  };

  const handleRequestPayoutClick = () => {
    if (onRequestPayout && professor.pendingPayoutMAD > 0) {
      onRequestPayout(professor.id, professor.pendingPayoutMAD);
      setPayoutRequestedToast(true);
      setTimeout(() => setPayoutRequestedToast(false), 4000);
    }
  };

  const handleUploadBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitleFr.trim()) return;

    setIsProcessingPdf(true);
    try {
      const bookId = `book-prof-${Date.now()}`;
      let storedPdfUrl: string | undefined = undefined;

      if (uploadedPdfFile) {
        try {
          storedPdfUrl = await saveBookPdf(bookId, uploadedPdfFile);
        } catch (pdfErr) {
          console.warn('PDF storage warning, continuing with in-app reader:', pdfErr);
        }
      }

      const price = parseFloat(newBookPriceMAD) || 0;
      const parsedPages = uploadPageCount || 15;

      const finalSpecialty = isCustomBookSpecialty && customBookSpecialtyFr.trim()
        ? customBookSpecialtyFr.trim()
        : selectedBookSpecialty;

      const finalSpecialtyAr = isCustomBookSpecialty && customBookSpecialtyAr.trim()
        ? customBookSpecialtyAr.trim()
        : finalSpecialty;

      const finalModule = isCustomBookModule && customBookModuleFr.trim()
        ? customBookModuleFr.trim()
        : (selectedBookModule.trim() || newBookModule.trim() || newBookTitleFr.trim());

      const finalModuleAr = isCustomBookModule && customBookModuleAr.trim()
        ? customBookModuleAr.trim()
        : (newBookTitleAr.trim() || finalModule);

      // Register dynamically into the application structure if custom or present
      if (isCustomBookSpecialty || isCustomBookModule || finalModule) {
        registerDynamicAcademicUnit({
          specialtyName: finalSpecialty,
          specialtyNameAr: finalSpecialtyAr,
          moduleName: finalModule,
          moduleNameAr: finalModuleAr,
          facultyCode: newBookFaculty,
          semester: newBookSemester,
          cycle: customBookSpecialtyCycle,
          createdBy: professor.fullName,
        });

        setStructureToast(
          lang === 'fr'
            ? `La filière "${finalSpecialty}" et le module "${finalModule}" ont été intégrés à la structure permanente de l'application !`
            : `تم دمج تخصص "${finalSpecialty}" ووحدة "${finalModule}" في بنية التطبيق وقاعدة البيانات بنجاح!`
        );
        setTimeout(() => setStructureToast(null), 6000);
      }

      const newBook: Book = {
        id: bookId,
        title: newBookTitleFr.trim(),
        titleAr: newBookTitleAr.trim() || undefined,
        author: professor.fullName,
        authorTitle: professor.title,
        university: professor.university || 'Université Abdelmalek Essaâdi (UAE)',
        faculty: newBookFaculty,
        facultyLabel: newBookFacultyLabel || professor.faculty,
        specialty: finalSpecialty,
        specialtyAr: finalSpecialtyAr,
        module: finalModule,
        moduleAr: finalModuleAr,
        semester: newBookSemester,
        year: '2026',
        edition: 'Édition Académique Validée & In-App',
        totalPages: parsedPages,
        priceMAD: price,
        publicPriceMAD: Math.round(price * 1.5),
        isFree: price <= 0,
        pdfUrl: storedPdfUrl,
        coverImage:
          customCoverImage ||
          newBookCover ||
          generateDefaultCoverSvg(newBookTitleFr.trim(), professor.fullName, newBookFaculty),
        isbn: `978-9954-${Math.floor(10 + Math.random() * 89)}-${Math.floor(100 + Math.random() * 899)}-1`,
        description:
          newBookDesc.trim() ||
          `Support de cours officiel déposé par ${professor.fullName}. Protégé contre tout téléchargement ou extraction.`,
        rating: 5.0,
        reviewsCount: 1,
        sampleMaxPage: 2,
        tags: [finalModule, finalSpecialty, newBookSemester, 'Polycopié Certifié'].filter(Boolean) as string[],
        chapters: [
          {
            id: 'c1',
            title: 'Chapitre 1 : Introduction & Fondements',
            startPage: 1,
            pageCount: Math.max(1, Math.floor(parsedPages / 3)),
          },
          {
            id: 'c2',
            title: 'Chapitre 2 : Développements & Applications Pratiques',
            startPage: Math.max(2, Math.floor(parsedPages / 3) + 1),
            pageCount: Math.max(1, Math.floor(parsedPages / 3)),
          },
          {
            id: 'c3',
            title: 'Chapitre 3 : Travaux Pratiques & Cas d\'Étude',
            startPage: Math.max(3, Math.floor((parsedPages * 2) / 3) + 1),
            pageCount: Math.max(1, parsedPages - Math.floor((parsedPages * 2) / 3)),
          },
        ],
        pages: [
          {
            pageNumber: 1,
            chapterTitle: 'Chapitre 1 : Introduction & Fondements',
            header: `FAC en PDF · ${newBookTitleFr.trim()} · Support Certifié`,
            content: [
              'Section 1.1 — Objectifs et présentation générale du cours',
              `Ce document constitue le support de cours officiel pour le module dispensé par ${professor.fullName}.`,
              'Toute reproduction, diffusion ou capture d\'écran de ce document est formellement prohibée conformément à la législation sur les droits d\'auteur.',
              'L\'étudiant détenteur de la licence est seul autorisé à consulter ce polycopié au sein du lecteur sécurisé FAC en PDF.',
            ],
            keyPoints: ['Manuel officiel vérifié par le professeur.', 'Licence DRM in-app incessible.'],
          },
          {
            pageNumber: 2,
            chapterTitle: 'Chapitre 1 : Introduction & Fondements',
            header: `FAC en PDF · ${newBookTitleFr.trim()} · Support Certifié`,
            content: [
              'Section 1.2 — Cadre méthodologique et terminologie',
              'La maîtrise des concepts fondamentaux de cette discipline requiert un travail d\'assimilation rigoureux. Des études de cas et exercices pratiques sont intégrés pour consolider les acquis.',
            ],
          },
        ],
      };

      if (onUploadBook) {
        onUploadBook(newBook);
      }

      setRecentlyUploadedBook(newBook);
      setBookUploadedToast(true);
      // Automatically open share modal so the professor gets the direct link and QR code instantly
      setSharingModalBook(newBook);
      setActiveTab('overview');

      // Reset fields
      setNewBookTitleFr('');
      setNewBookTitleAr('');
      setNewBookModule('');
      setCustomBookSpecialtyFr('');
      setCustomBookSpecialtyAr('');
      setIsCustomBookSpecialty(false);
      setCustomBookModuleFr('');
      setCustomBookModuleAr('');
      setIsCustomBookModule(false);
      setUploadedPdfFile(null);
      setUploadedFileName(null);
      setCustomCoverImage(null);
    } catch (err) {
      console.error('Error during book submission:', err);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-8">
        {/* Header with Verified Professor Badge & Logout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 shadow-xs">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">
                  {professor.fullName}
                </h2>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Compte Enseignant Certifié' : 'حساب أستاذ معتمد ومحمي'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                📧 {professor.email} · {professor.faculty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Fermer la session et se déconnecter / تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toasts */}
        {ribSavedToast && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'fr' ? 'Coordonnées bancaires (RIB) mises à jour avec succès.' : 'تم تحيين الحساب البنكي (RIB) بنجاح.'}</span>
          </div>
        )}

        {payoutRequestedToast && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'fr' ? 'Demande de virement envoyée à l\'administration avec succès.' : 'تم إرسال طلب صرف المستحقات لإدارة المنصة بنجاح.'}</span>
          </div>
        )}

        {bookUploadedToast && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'fr' ? 'Polycopié déposé et publié avec succès dans la bibliothèque publique !' : 'تم رفع وتأكيد نشر المقرر بنجاح في المعرض العام للمكتبة!'}</span>
          </div>
        )}

        {structureToast && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2 shadow-xs animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{structureToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1.5 bg-stone-100 rounded-2xl mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>{lang === 'fr' ? 'Tableau de Bord & Ouvrages' : 'لوحة القيادة ومقرراتي'}</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_book')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'upload_book'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{lang === 'fr' ? '📤 Déposer / Télécharger un Livre' : '📤 رفع وإيداع مقرر جديد'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'notice'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Bell className="w-4 h-4 text-sky-600" />
            <span>{lang === 'fr' ? 'Diffuser un Avis aux Étudiants' : 'نشر إشعار للطلبة'}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PUBLISHED BOOKS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Session Status & Quick Déconnexion inside Tableau de Bord */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{lang === 'fr' ? 'Tableau de Bord Enseignant Actif' : 'لوحة القيادة مفتوحة (جلسة أستاذ نشطة)'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      {professor.fullName}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {lang === 'fr'
                      ? 'Gérez vos polycopiés, droits d\'auteur et déconnectez-vous en un clic.'
                      : 'تسيير المطبوعات، المستحقات البنكية، وتسجيل الخروج بنقرة واحدة.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                title="Déconnexion du tableau de bord / تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج (Déconnexion)'}</span>
              </button>
            </div>

            {/* Private Commercial & Financial Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>{lang === 'fr' ? 'Exemplaires Acquis' : 'النسخ المقتناة'}</span>
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono tabular-nums">
                  {professor.totalSalesCount}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {profBooks.length} {lang === 'fr' ? 'ouvrages in-app' : 'مقررات مسجلة'}
                </div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>{lang === 'fr' ? 'Droits d\'Auteur Académiques (80%)' : 'مستحقات حقوق التأليف والنشر (80%)'}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                  {professor.totalEarningsMAD} <span className="text-xs font-bold">DH</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
                  {lang === 'fr' ? 'Cumul des redevances académiques' : 'إجمالي مستحقات حقوق التأليف'}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
                    <span>{lang === 'fr' ? 'Solde Prêt à Verser' : 'الرصيد الجاهز للصرف'}</span>
                    <Landmark className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-2xl font-black text-emerald-900 font-mono tabular-nums">
                    {professor.pendingPayoutMAD} <span className="text-xs font-bold">DH</span>
                  </div>
                </div>

                {professor.pendingPayoutMAD > 0 ? (
                  <button
                    onClick={handleRequestPayoutClick}
                    className="mt-3 w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{lang === 'fr' ? 'Demander le Virement' : 'طلب تحويل المستحقات'}</span>
                  </button>
                ) : (
                  <div className="text-[11px] text-emerald-700 mt-2 font-medium">
                    {lang === 'fr' ? 'Tous vos virements ont été honorés' : 'تم تسوية كامل المستحقات السابقة'}
                  </div>
                )}
              </div>
            </div>

            {/* Bank RIB Coordination Section */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-stone-200/80 text-stone-700 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{lang === 'fr' ? 'Compte Bancaire de Réception (RIB)' : 'الحساب البنكي للتحويل (RIB)'}</span>
                    <span className="text-[10px] text-stone-500 font-mono">({editedBankName})</span>
                  </div>
                  {isEditingRib ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editedRib}
                        onChange={(e) => setEditedRib(e.target.value)}
                        placeholder="24 chiffres RIB"
                        className="p-1 px-2 text-xs font-mono border border-stone-300 rounded-lg w-64 bg-white"
                      />
                      <input
                        type="text"
                        value={editedBankName}
                        onChange={(e) => setEditedBankName(e.target.value)}
                        placeholder="Nom de Banque"
                        className="p-1 px-2 text-xs border border-stone-300 rounded-lg w-36 bg-white"
                      />
                      <button
                        onClick={handleSaveRib}
                        className="p-1 px-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>Enregistrer</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-stone-600 tracking-wider mt-0.5">
                      {professor.bankRib}
                    </div>
                  )}
                </div>
              </div>

              {!isEditingRib && (
                <button
                  onClick={() => setIsEditingRib(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{lang === 'fr' ? 'Modifier RIB' : 'تعديل الحساب'}</span>
                </button>
              )}
            </div>

            {/* Security PIN Settings for Professor (Requirement 10) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-100 text-sky-800 rounded-xl">
                  <KeyRound className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                    <span>{lang === 'fr' ? 'Sécurité du Compte · Code Secret (PIN)' : 'أمان الحساب · القن السري للأستاذ'}</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded">
                      ••••••
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {lang === 'fr'
                      ? 'Modifiez votre code d\'accès secret utilisé lors de la connexion.'
                      : 'تغيير القن السري الخاص بحساب الأستاذ والمستخدم للدخول وحماية المستحقات.'}
                  </div>
                </div>
              </div>

              {!isChangingPin ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 bg-sky-50 border border-sky-300 rounded-xl hover:bg-sky-100 flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Changer mon PIN' : 'تغيير القن السري'}</span>
                </button>
              ) : (
                <form onSubmit={handleChangePinSubmit} className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder={lang === 'fr' ? 'Ancien PIN' : 'القن القديم'}
                    className="px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg w-24 bg-white"
                  />
                  <input
                    type="password"
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder={lang === 'fr' ? 'Nouveau PIN' : 'القن الجديد'}
                    className="px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg w-24 bg-white"
                  />
                  <input
                    type="password"
                    required
                    value={confirmNewPinInput}
                    onChange={(e) => setConfirmNewPinInput(e.target.value)}
                    placeholder={lang === 'fr' ? 'Confirmer' : 'تأكيد'}
                    className="px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg w-24 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>{lang === 'fr' ? 'Valider' : 'حفظ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPin(false);
                      setPinChangeError(null);
                    }}
                    className="px-2.5 py-1.5 text-xs text-stone-500 hover:bg-stone-200 rounded-lg"
                  >
                    {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                  </button>
                </form>
              )}
            </div>

            {pinChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pinChangeError}</span>
              </div>
            )}

            {pinChangeSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lang === 'fr' ? 'Code secret (PIN) mis à jour avec succès !' : 'تم تحديث القن السري للأستاذ بنجاح!'}</span>
              </div>
            )}

            {/* List of Published Books */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'fr' ? 'Vos Polycopiés Protégés & Disponibles in-app' : 'مطبوعاتك ومقرراتك المحمية بالتطبيق'}</span>
                </h3>

                <button
                  onClick={() => setActiveTab('upload_book')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Ajouter un nouveau titre' : 'إضافة عنوان جديد'}</span>
                </button>
              </div>

              {/* Professor PDF Upload Toast Banner */}
              {profPdfToast && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profPdfToast}</span>
                  </div>
                  <button
                    onClick={() => setProfPdfToast(null)}
                    className="text-stone-400 hover:text-stone-700 text-xs p-1 cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {recentlyUploadedBook && (
                <div className="p-4 mb-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src={recentlyUploadedBook.coverImage}
                      alt={recentlyUploadedBook.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm border border-emerald-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{lang === 'fr' ? 'Polycopié publié avec succès dans la bibliothèque !' : 'تم إيداع ونشر المرجع بنجاح في المكتبة!'}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        {lang === 'fr'
                          ? 'Diffusez le lien officiel à vos étudiants : il leur permet de s\'inscrire pour bénéficier du tarif préférentiel étudiant, puis d\'accéder directement à l\'acquisition de leur support.'
                          : 'شارك الرابط الرسمي مع طلبتك: يتيح للطلبة التسجيل بالمنصة للاستفادة من الأثمنة التفضيلية المدعومة المخصصة للطلبة ومن ثمة الدخول التلقائي لعملية الاقتناء.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenReader && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenReader(recentlyUploadedBook);
                        }}
                        className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        title={lang === 'fr' ? 'Ouvrir et lire dans le lecteur sécurisé' : 'المطالعة الفورية في القارئ المشفر'}
                      >
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'fr' ? 'Lire maintenant' : 'مطالعة المقرر الآن'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSharingModalBook(recentlyUploadedBook)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-stone-950" />
                      <span>{lang === 'fr' ? 'Partager le Cours' : 'تقاسم الرابط'}</span>
                    </button>
                  </div>
                </div>
              )}

              {profBooks.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    {lang === 'fr'
                      ? 'Aucun livre publié pour le moment. Cliquez sur "Déposer un Livre" pour commencer.'
                      : 'لا توجد مقررات منشورة حالياً. اضغط على زر "رفع وإيداع مقرر جديد" للمتابعة.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profBooks.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded-md border border-stone-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {lang === 'ar' && b.titleAr ? b.titleAr : b.title}
                          </h4>
                          <div className="text-[11px] text-stone-500">
                            {b.facultyLabel} · {b.semester} · {b.priceMAD > 0 ? `${b.priceMAD} DH` : 'Gratuit'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {onOpenReader && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReader(b);
                            }}
                            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title={lang === 'fr' ? 'Ouvrir et lire dans le lecteur sécurisé' : 'فتح ومطالعة المقرر في القارئ المشفر'}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'fr' ? 'Lire' : 'قراءة'}</span>
                          </button>
                        )}
                        <label
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border border-emerald-300"
                          title={lang === 'fr' ? 'Uploader ou remplacer le fichier PDF de ce cours' : 'رفع أو تغيير ملف الـ PDF لهذا المقرر'}
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-700" />
                          <span>PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => handleUploadPdfForProfBook(b.id, e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSharingModalBook(b)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title={lang === 'fr' ? 'Partager le lien du cours pour inscription et accès au tarif préférentiel' : 'تقاسم رابط المقرر لتسجيل الطلبة والاستفادة من التعريفة التفضيلية'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Partager' : 'تقاسم'}</span>
                        </button>
                        <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          DRM
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD & DEPOSIT NEW BOOK */}
        {activeTab === 'upload_book' && (
          <form onSubmit={handleUploadBookSubmit} className="space-y-4 text-xs">
            {/* File Dropzone */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center relative hover:bg-emerald-50 transition-colors">
              <input
                type="file"
                accept=".pdf,.epub,.docx"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-stone-900 mb-1">
                {uploadedFileName ? (
                  <span className="text-emerald-800 font-mono">
                    ✓ {uploadedFileName} ({uploadedFileSize} · ~{uploadPageCount} pages)
                  </span>
                ) : (
                  <span>
                    {lang === 'fr'
                      ? 'Glissez-déposez le fichier du cours (PDF, EPUB) ou cliquez ici'
                      : 'اسحب وأفلت ملف المطبوع الجامعي (PDF, EPUB) أو انقر هنا للاختيار'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'fr'
                  ? 'Le fichier sera converti en flux in-app sécurisé. Aucun lien brut de téléchargement ne sera exposé.'
                  : 'تتم معالجة الملف آلياً للقراءة التفاعلية المشفرة مع منع التحميل الخارجي التام.'}
              </p>
            </div>

            {/* Book Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Titre du polycopié (Français) *' : 'عنوان المطبوع (بالفرنسية) *'}
                </label>
                <input
                  type="text"
                  required
                  value={newBookTitleFr}
                  onChange={(e) => setNewBookTitleFr(e.target.value)}
                  placeholder="Ex: Précis de Droit Civil : Les Obligations"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Titre du polycopié (Arabe)' : 'عنوان المطبوع (بالعربية)'}
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newBookTitleAr}
                  onChange={(e) => setNewBookTitleAr(e.target.value)}
                  placeholder="مثال: الوجيز في القانون المدني: النظرية العامة للالتزامات"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right"
                />
              </div>
            </div>

            {/* Dynamic Specialty & Module Selection (Auto-adds to app structure) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
              {/* Specialty */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'fr' ? 'Filière / Spécialité *' : 'الشعبة والتخصص *'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomBookSpecialty(!isCustomBookSpecialty)}
                    className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>{isCustomBookSpecialty ? (lang === 'fr' ? 'Liste' : 'القائمة') : (lang === 'fr' ? '+ Nouvelle filière' : '+ تخصص جديد')}</span>
                  </button>
                </div>

                {!isCustomBookSpecialty ? (
                  <select
                    value={selectedBookSpecialty}
                    onChange={(e) => setSelectedBookSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {specialties.map((sp) => (
                      <option key={sp.id} value={sp.nameFr}>
                        {sp.facultyCode} · {sp.nameFr} ({sp.cycle}){sp.isCustom ? ' ★ [مخصص]' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 animate-in fade-in">
                    <input
                      type="text"
                      required={isCustomBookSpecialty}
                      value={customBookSpecialtyFr}
                      onChange={(e) => setCustomBookSpecialtyFr(e.target.value)}
                      placeholder={lang === 'fr' ? 'Nom de la filière (Français) *' : 'اسم الشعبة/التخصص (بالفرنسية) *'}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={customBookSpecialtyAr}
                      onChange={(e) => setCustomBookSpecialtyAr(e.target.value)}
                      placeholder={lang === 'fr' ? 'Nom de la filière (Arabe)' : 'اسم الشعبة/التخصص (بالعربية)'}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                    />
                    <p className="text-[10px] text-amber-800">
                      {lang === 'fr' ? '⚡ Sera intégrée directement à la structure permanente de l\'application.' : '⚡ ستضاف هذه الشعبة تلقائياً لقاعدة بيانات التطبيق وتصبح متاحة للجميع.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Module */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-900 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'fr' ? 'Module / Unité du Cours *' : 'الوحدة أو المادة الأكاديمية *'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomBookModule(!isCustomBookModule)}
                    className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>{isCustomBookModule ? (lang === 'fr' ? 'Liste' : 'القائمة') : (lang === 'fr' ? '+ Nouveau module' : '+ وحدة جديدة')}</span>
                  </button>
                </div>

                {!isCustomBookModule ? (
                  <select
                    value={selectedBookModule}
                    onChange={(e) => setSelectedBookModule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{lang === 'fr' ? '-- Choisir le module du cours --' : '-- اختر الوحدة الدراسية --'}</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.nameFr}>
                        {m.nameFr} ({m.semester || 'Tous'}){m.isCustom ? ' ★ [مخصص]' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 animate-in fade-in">
                    <input
                      type="text"
                      required={isCustomBookModule}
                      value={customBookModuleFr}
                      onChange={(e) => setCustomBookModuleFr(e.target.value)}
                      placeholder={lang === 'fr' ? 'Nom du module (Français) *' : 'اسم المادة أو الوحدة (بالفرنسية) *'}
                      className="w-full p-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      dir="rtl"
                      value={customBookModuleAr}
                      onChange={(e) => setCustomBookModuleAr(e.target.value)}
                      placeholder={lang === 'fr' ? 'Nom du module (Arabe)' : 'اسم المادة أو الوحدة (بالعربية)'}
                      className="w-full p-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    />
                    <p className="text-[10px] text-emerald-800">
                      {lang === 'fr' ? '⚡ Module enregistré et intégré au catalogue général.' : '⚡ تسجل هذه المادة فوراً في بنية المقررات للمنصة.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Discipline / Domaine' : 'المجال الأكاديمي'}
                </label>
                <select
                  value={newBookFaculty}
                  onChange={(e) => setNewBookFaculty(e.target.value as FacultyType)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900"
                >
                  <option value="droit">Droit & Sciences Juridiques</option>
                  <option value="economie">Économie & Gestion (SEG)</option>
                  <option value="sciences">Sciences & Technologies</option>
                  <option value="medecine">Médecine & Pharmacie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Semestre / Niveau' : 'السداسي / المستوى'}
                </label>
                <select
                  value={newBookSemester}
                  onChange={(e) => setNewBookSemester(e.target.value as SemesterType)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900"
                >
                  <option value="S1">Semestre 1 (S1)</option>
                  <option value="S2">Semestre 2 (S2)</option>
                  <option value="S3">Semestre 3 (S3)</option>
                  <option value="S4">Semestre 4 (S4)</option>
                  <option value="S5">Semestre 5 (S5)</option>
                  <option value="S6">Semestre 6 (S6)</option>
                  <option value="Master">Master & Doctorat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Prix d\'acquisition (DH)' : 'ثمن الاقتناء (درهم)'}
                </label>
                <input
                  type="number"
                  value={newBookPriceMAD}
                  onChange={(e) => setNewBookPriceMAD(e.target.value)}
                  placeholder="0 pour gratuit, ou 45 DH"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Book Cover Upload Section (Requirement 6) */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'fr' ? 'Image de Couverture du Livre *' : 'تحميل صورة غلاف الكتاب للمكتبة *'}</span>
                </label>
                <span className="text-[10px] text-stone-500 font-semibold">
                  {lang === 'fr' ? 'Sera affichée dans la bibliothèque et sert de lien pour acquisition au tarif préférentiel' : 'تظهر في المكتبة كرابط أنيق للتسجيل والاقتناء بالتعريفة التفضيلية'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Live Preview */}
                <div className="w-24 aspect-[3/4] bg-stone-200 rounded-xl overflow-hidden border border-stone-300 shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src={customCoverImage || newBookCover}
                    alt="Aperçu Couverture"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Télécharger une image de couverture (JPG/PNG)' : 'تحميل صورة غلاف من جهازك (JPG/PNG)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFileUpload}
                    />
                  </label>

                  {customCoverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCoverImage(null);
                        setNewBookCover(generateDefaultCoverSvg(newBookTitleFr, professor.fullName, newBookFaculty));
                      }}
                      className="block text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      {lang === 'fr' ? 'Supprimer l\'image personnalisée' : 'إزالة الصورة المخصصة والعودة للتصميم التلقائي'}
                    </button>
                  )}

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {lang === 'fr'
                      ? 'Téléversez la maquette de couverture de votre polycopié. Elle s\'affiche aux étudiants dans la bibliothèque et les liens partagés pour accéder à l\'inscription et au tarif préférentiel.'
                      : 'اختر صورة غلاف واضحة لمقررك. ستظهر هذه الصورة للطلبة في المكتبة وعند تقاسم الرابط، وتوجه الطالب مباشرة لمطبوع التسجيل للاستفادة من الأثمنة التفضيلية ثم تفعيل المقرر.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Syllabus Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'fr' ? 'Description & Programme du Cours' : 'وصف المحتوى ومحاور المادة'}
              </label>
              <textarea
                rows={2}
                value={newBookDesc}
                onChange={(e) => setNewBookDesc(e.target.value)}
                placeholder={lang === 'fr' ? 'Objectifs pédagogiques, plan du cours et références...' : 'أهداف المقرر ومحاور الدروس...'}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* DRM Protection Checklist */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'fr' ? 'Bouclier de Protection Actif par Défaut :' : 'حزمة الحماية النشطة تلقائياً:'}</span>
              </div>
              <p>✓ {lang === 'fr' ? 'Interdiction absolue d\'impression et de téléchargement' : 'حظر تام للتحميل والطباعة'}</p>
              <p>✓ {lang === 'fr' ? 'Filigrane dynamique avec nom et CNE de l\'étudiant' : 'علامة مائية متحركة بهوية الطالب'}</p>
              <p>✓ {lang === 'fr' ? 'Droits d\'auteur de 80% reversés directement sur votre compte bancaire' : 'صرف 80% من مستحقات حقوق التأليف لحسابك البنكي'}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
              >
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>

              <button
                type="submit"
                disabled={isProcessingPdf}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isProcessingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{lang === 'fr' ? 'Chiffrement DRM & Sauvegarde en cours...' : 'جاري تشفير وحفظ المقرر بأمان...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Publier le Polycopié sur la Plateforme' : 'تأكيد رفع ونشر المقرر'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PUBLISH NOTICE */}
        {activeTab === 'notice' && (
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-stone-900">
                  {lang === 'fr' ? 'Diffuser une Consigne ou un Avis à Vos Étudiants' : 'نشر توجيه أو إشعار لطلبتك في الصفحة الرئيسية'}
                </h3>
              </div>
              {publishedToast && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{lang === 'fr' ? 'Avis publié !' : 'تم النشر!'}</span>
                </span>
              )}
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  {lang === 'fr' ? 'Intitulé du Module / Matière' : 'المادة أو المقرر المعني'}
                </label>
                <input
                  type="text"
                  required
                  value={noticeModuleName}
                  onChange={(e) => setNoticeModuleName(e.target.value)}
                  placeholder="Ex: Droit Civil S3 - Obligations & Contrats"
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Message (Français)' : 'نص الإشعار (بالفرنسية)'}
                  </label>
                  <textarea
                    rows={2}
                    value={noticeMessageFr}
                    onChange={(e) => setNoticeMessageFr(e.target.value)}
                    placeholder="Consignes de préparation, révision ou examens..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {lang === 'fr' ? 'Message (Arabe)' : 'نص الإشعار (بالعربية)'}
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={noticeMessageAr}
                    onChange={(e) => setNoticeMessageAr(e.target.value)}
                    placeholder="توجيهات الاختبارات أو المذاكرة..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-right"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Diffuser l\'Avis aux Étudiants' : 'نشر الإشعار رسمياً'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Book Share & Publish Modal (QR & Link) */}
      <BookShareModal
        book={sharingModalBook}
        isOpen={!!sharingModalBook}
        onClose={() => setSharingModalBook(null)}
        lang={lang}
        sharedBy="professor"
      />
    </div>
  );
};
