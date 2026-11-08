import React, { useState, useEffect, useRef } from 'react';
import { Book, StudentProfile, UserNote, UserBookmark, DRMSecurityAlert } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadBookPdf, saveBookPdf, deleteBookPdf, getPdfPageCount } from '../utils/pdfStorage';
import { uploadFileToStorage } from '../services/firestoreService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  List,
  ZoomIn,
  ZoomOut,
  Bookmark,
  Sun,
  Moon,
  Clock,
  X,
  Lock,
  AlertTriangle,
  Maximize,
  Minimize,
  Loader2,
  BookOpen,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Columns,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { setupDrmProtection } from '../utils/drmShield';

// Initialize PDF.js worker with resilient fallback
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      pdfWorker || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs';
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs';
  }
}

interface SecureReaderProps {
  book: Book;
  student: StudentProfile;
  isAcquired: boolean;
  isAuthorOrAdmin?: boolean;
  onClose: () => void;
  onAcquireBook: (bookId: string) => void;
  onUpdateBookPdf?: (bookId: string, pdfUrl: string, totalPages?: number, fileName?: string) => void;
  lang: 'fr' | 'ar';
}

export const SecureReader: React.FC<SecureReaderProps> = ({
  book,
  student,
  isAcquired,
  isAuthorOrAdmin = false,
  onClose,
  onAcquireBook,
  onUpdateBookPdf,
  lang,
}) => {
  // Global anti-tamper keyboard shortcuts
  useEffect(() => {
    const preventActions = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.ctrlKey && ['p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (
        e instanceof KeyboardEvent &&
        (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventActions);
    return () => window.removeEventListener('keydown', preventActions);
  }, []);

  // Reading state
  const initialPage = student.bookProgress?.[book.id]?.currentPage || 1;
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [readerWidth, setReaderWidth] = useState<'standard' | 'wide' | 'full'>('wide');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'notes' | 'bookmarks'>('toc');
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Study timer state
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);

  // Notes and Bookmarks
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');

  // DRM & Security Alerts
  const [activeAlert, setActiveAlert] = useState<DRMSecurityAlert | null>(null);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [watermarkPos, setWatermarkPos] = useState<{ x: number; y: number }>({ x: 30, y: 40 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Real PDF document states
  const [pdfUrl, setPdfUrl] = useState<string | null>(book.pdfUrl || null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<'canvas' | 'native'>('canvas');
  const [showStructuredText, setShowStructuredText] = useState<boolean>(false);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Effective rights: Author, Admin, and Free books have full access
  const effectiveIsAcquired = isAcquired || isAuthorOrAdmin || book.isFree || book.priceMAD === 0;

  // Custom user PDF upload states
  const [uploadPdfToast, setUploadPdfToast] = useState<string | null>(null);
  const [isUploadingCustomPdf, setIsUploadingCustomPdf] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Total pages
  const totalPagesCount =
    !showStructuredText && pdfDoc
      ? pdfDoc.numPages
      : Math.max(book.pages?.length || 0, book.totalPages || 8, 1);
  const maxAllowedPage = effectiveIsAcquired ? totalPagesCount : Math.min(book.sampleMaxPage || 2, totalPagesCount);

  // Check IndexedDB / memory storage for real PDF on mount
  useEffect(() => {
    let isMounted = true;
    loadBookPdf(book.id, book).then((storedUrl) => {
      if (isMounted && storedUrl) {
        setPdfUrl(storedUrl);
      } else if (isMounted && book.pdfUrl && !book.pdfUrl.startsWith('blob:')) {
        setPdfUrl(book.pdfUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [book.id, book.pdfUrl]);

  // Load PDF Document when pdfUrl changes
  useEffect(() => {
    let isCancelled = false;
    if (!pdfUrl) {
      setPdfDoc(null);
      setPdfLoading(false);
      return;
    }

    setPdfLoading(true);
    setPdfError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/standard_fonts/',
    });

    loadingTask.promise
      .then((loadedDoc) => {
        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          setPdfLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Could not load PDF via Canvas worker:', err);
          setPdfError(err.message || 'Erreur de chargement');
          setPdfLoading(false);
          setReaderMode('native');
        }
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy();
      } catch {}
    };
  }, [pdfUrl]);

  // Handle PDF Custom Upload
  const handleCustomPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert(lang === 'fr' ? 'Veuillez sélectionner un fichier PDF valide.' : 'يرجى اختيار ملف PDF صالح.');
      return;
    }

    try {
      setIsUploadingCustomPdf(true);
      setUploadPdfToast(lang === 'fr' ? 'Téléversement du fichier PDF vers le Cloud...' : 'جاري رفع ملف PDF وتخزينه سحابياً...');

      // 1. حساب عدد الصفحات الفعلي
      const newPageCount = await getPdfPageCount(file);

      // 2. الرفع السحابي الدائم إلى Firebase Storage
      const cloudPdfUrl = await uploadFileToStorage(file, 'books/pdfs');

      // 3. التحديث الفوري لوثيقة الكتاب في Firestore
      try {
        const bookRef = doc(db, 'books', book.id);
        await updateDoc(bookRef, {
          pdfUrl: cloudPdfUrl,
          totalPages: newPageCount || 100,
          hasPdf: true,
          pdfFileName: file.name,
          updatedAt: new Date().toISOString(),
        });
      } catch (fsErr) {
        console.warn('Notice updating book in Firestore:', fsErr);
      }

      // 4. حفظ محلي سريع في IndexedDB
      await saveBookPdf(book.id, file);

      setPdfUrl(cloudPdfUrl);
      setShowStructuredText(false);

      if (onUpdateBookPdf) {
        onUpdateBookPdf(book.id, cloudPdfUrl, newPageCount, file.name);
      }

      setUploadPdfToast(
        lang === 'fr'
          ? `Document PDF (${newPageCount} pages) téléversé sur le Cloud avec succès et accessible aux étudiants !`
          : `تم رفع ملف PDF بنجاح (${newPageCount} صفحة) وحفظه سحابياً ليصبح متاحاً بالكامل للطلبة!`
      );

      setTimeout(() => setUploadPdfToast(null), 5000);
    } catch (err) {
      console.error('Error attaching PDF:', err);
      alert(lang === 'fr' ? 'Échec du chargement du fichier PDF.' : 'فشل تحميل ملف الـ PDF.');
    } finally {
      setIsUploadingCustomPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove attached PDF
  const handleRemoveCustomPdf = async () => {
    if (!window.confirm(lang === 'fr' ? 'Détacher le fichier PDF de ce livre ?' : 'هل تريد فصل ملف PDF عن هذا الكتاب؟')) return;
    try {
      await deleteBookPdf(book.id);
      setPdfUrl(null);
      setPdfDoc(null);
      setShowStructuredText(true);
      setUploadPdfToast(
        lang === 'fr' ? 'Fichier PDF détaché de la mémoire locale.' : 'تم فصل ملف الـ PDF من الذاكرة المحلية.'
      );
      setTimeout(() => setUploadPdfToast(null), 3000);
    } catch (err) {
      console.error('Error deleting PDF:', err);
    }
  };

  // Render PDF Page to Canvas HD
  useEffect(() => {
    if (!pdfDoc || showStructuredText || readerMode !== 'canvas') return;

    let isCancelled = false;
    let renderTask: any = null;

    if (!effectiveIsAcquired && currentPage > (book.sampleMaxPage || 2)) {
      return;
    }

    setIsRenderingPage(true);

    pdfDoc
      .getPage(currentPage)
      .then((page) => {
        if (isCancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Dynamic scale factoring in zoom and screen width
        const baseScale = (zoomLevel / 100) * (readerWidth === 'full' ? 1.5 : readerWidth === 'wide' ? 1.25 : 1.0);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: baseScale * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .then(() => {
        if (!isCancelled) setIsRenderingPage(false);
      })
      .catch((err) => {
        if (!isCancelled && err.name !== 'RenderingCancelledException') {
          console.warn('Canvas render issue:', err);
          setIsRenderingPage(false);
        }
      });

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoomLevel, readerWidth, isAcquired, book.sampleMaxPage, showStructuredText, readerMode]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (e) {
      console.warn('Fullscreen toggle:', e);
    }
  };

  const isArabicDoc = lang === 'ar' || Boolean(book.titleAr) || /[\u0600-\u06FF]/.test(book.title);

  // Safe fallback dynamic academic text page if no PDF is uploaded
  const currentChapter =
    book.chapters?.find(
      (c) => currentPage >= c.startPage && currentPage < c.startPage + c.pageCount
    ) ||
    book.chapters?.[0] || {
      id: 'c1',
      title: isArabicDoc ? 'الفصل 1 : المفاهيم والأسس الجوهرية' : 'Chapitre 1 : Fondements & Concepts Clés',
      startPage: 1,
      pageCount: 4,
    };

  const pageOffsetInChap = Math.max(1, currentPage - (currentChapter.startPage || 1) + 1);
  const foundPage = book.pages?.find((p) => p.pageNumber === currentPage);

  const pageData = foundPage || {
    pageNumber: currentPage,
    chapterTitle: isArabicDoc
      ? `${currentChapter.title} — المبحث ${pageOffsetInChap}`
      : `${currentChapter.title} — Section ${pageOffsetInChap}`,
    header: isArabicDoc
      ? `FAC en PDF · ${book.titleAr || book.title} · ${book.facultyLabel || book.faculty}`
      : `FAC en PDF · ${book.title} · ${book.facultyLabel || book.faculty}`,
    content: isArabicDoc
      ? [
          `المبحث ${pageOffsetInChap}.1 — التحليل المفاهيمي والإطار النظري المقارن`,
          `يُعد هذا المرجع الوثيقة الجامعية الرسمية المعتمدة لتدريس مادة "${book.titleAr || book.title}"، والمقررة ضمن المسار الأكاديمي لدى ${book.university || 'الجامعة'}.`,
          `في هذه الصفحة (${currentPage})، يتناول الأستاذ المحاضر تطبيقات المبادئ القانونية والتنظيمية الأساسية، مع أمثلة عملية وشروحات منهجية تساعد الطالب على التحضير الشامل للامتحانات واستيعاب المادة (${book.semester}).`,
          `تنبيه بيداغوجي وأخلاقي: هذا المصنف محمي بموجب القوانين المغربية المنظمة لحقوق المؤلف والحقوق المجاورة. أي تصوير أو استخراج أو نشر غير مرخص يعرض صاحبه للمتابعة الإدارية والقانونية.`,
        ]
      : [
          `Section ${pageOffsetInChap}.1 — Analyse conceptuelle et cadre théorique approfondi`,
          `Ce document constitue le polycopié officiel pour le module "${book.title}", dispensé dans le cadre du cursus universitaire accrédité à ${book.university || 'l\'Université'}.`,
          `En page ${currentPage}, l'étude porte sur la mise en application des règles doctrinales et jurisprudentielles fondamentales, complétée par des analyses méthodologiques indispensables pour la préparation des examens de fin de semestre (${book.semester}).`,
          `Rappel déontologique : Ce polycopié est protégé par la législation marocaine sur les droits d'auteur et droits voisins. Toute reproduction, capture d'écran, extraction ou diffusion publique est formellement interdite.`,
        ],
    keyPoints: isArabicDoc
      ? [
          `الفكرة المحورية رقم ${currentPage}: تأصيل المفاهيم والتطبيقات العملية للدكتور ${book.author}.`,
          `توجيه بيداغوجي: مراجعة محاور الأعمال الموجهة (TD) والمصادر الببليوغرافية للمزيد من التعمق.`,
          `حماية DRM نشطة: قراءة مشفرة وآمنة ومسجلة باسم الطالب داخل التطبيق.`,
        ]
      : [
          `Notion clé n°${currentPage} : Définitions et applications pratiques du cours de ${book.author}.`,
          `Recommandation pédagogique : Se référer aux fiches de travaux dirigés (TD) et références bibliographiques.`,
          `Protection DRM active : Consultation strictement nominative in-app.`,
        ],
  };

  // Dynamic moving watermark loop (Forensic tracking)
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.floor(15 + Math.random() * 65),
        y: Math.floor(20 + Math.random() * 60),
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro study timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  // Setup DRM keyboard, clipboard, and window focus listeners
  useEffect(() => {
    const cleanup = setupDrmProtection({
      onSecurityAlert: (alert) => {
        setActiveAlert(alert);
      },
      onBlurChange: (blurred) => {
        setIsShieldActive(blurred);
      },
    });
    return cleanup;
  }, []);

  const handleNextPage = () => {
    if (currentPage < maxAllowedPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const note: UserNote = {
      id: Math.random().toString(),
      bookId: book.id,
      pageNumber: currentPage,
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  const handleToggleBookmark = () => {
    const existing = bookmarks.find((b) => b.pageNumber === currentPage);
    if (existing) {
      setBookmarks(bookmarks.filter((b) => b.pageNumber !== currentPage));
    } else {
      setBookmarks([
        ...bookmarks,
        {
          id: Math.random().toString(),
          bookId: book.id,
          pageNumber: currentPage,
          chapterTitle: pageData.chapterTitle || `Page ${currentPage}`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const isCurrentPageBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  // =========================================================================
  // THEME HARMONIZATION ENGINE (SURGICAL CONTRAST & ACCURACY)
  // =========================================================================
  const THEME_CONFIG = {
    light: {
      container: 'bg-stone-100 text-stone-900',
      topBar: 'bg-white/95 border-stone-200 text-stone-900',
      bottomDock: 'bg-white/95 border-stone-200 text-stone-900 shadow-xl',
      page: 'bg-white text-stone-900 border-stone-200/90 shadow-2xl',
      title: 'text-stone-900',
      header: 'text-stone-500 border-stone-200',
      body: 'text-stone-800',
      keyPointsBg: 'bg-stone-50/90 border-amber-600 text-stone-800',
      keyPointsTitle: 'text-amber-800',
      keyPointsBullet: 'text-amber-600',
      footer: 'text-stone-500 border-stone-200',
      canvasFilter: 'none',
      canvasWrapper: 'bg-white border-stone-300',
    },
    sepia: {
      container: 'bg-[#EDE4D3] text-[#3c2a1a]',
      topBar: 'bg-[#F5EBD9]/95 border-[#D9CDB8] text-[#3c2a1a]',
      bottomDock: 'bg-[#F5EBD9]/95 border-[#D9CDB8] text-[#3c2a1a] shadow-xl',
      page: 'bg-[#FBF5E8] text-[#3c2a1a] border-[#D9CDB8] shadow-2xl',
      title: 'text-[#2b1d12]',
      header: 'text-[#7d6046] border-[#D9CDB8]',
      body: 'text-[#3c2a1a]',
      keyPointsBg: 'bg-[#F2E5CE] border-amber-700 text-[#4a3525]',
      keyPointsTitle: 'text-amber-900',
      keyPointsBullet: 'text-amber-700',
      footer: 'text-[#7d6046] border-[#D9CDB8]',
      canvasFilter: 'sepia(0.38) contrast(0.96) brightness(0.98)',
      canvasWrapper: 'bg-[#FBF5E8] border-[#D9CDB8]',
    },
    dark: {
      container: 'bg-[#09090b] text-stone-100',
      topBar: 'bg-[#18181b]/95 border-stone-800 text-stone-100',
      bottomDock: 'bg-[#18181b]/95 border-stone-800 text-stone-100 shadow-2xl',
      page: 'bg-[#18181b] text-stone-100 border-stone-800 shadow-2xl',
      title: 'text-white',
      header: 'text-stone-400 border-stone-800',
      body: 'text-stone-200',
      keyPointsBg: 'bg-[#27272a] border-amber-500 text-stone-200',
      keyPointsTitle: 'text-amber-400',
      keyPointsBullet: 'text-amber-400',
      footer: 'text-stone-400 border-stone-800',
      canvasFilter: 'invert(0.92) hue-rotate(180deg) contrast(1.1) brightness(0.95)',
      canvasWrapper: 'bg-[#18181b] border-stone-800',
    },
  };

  const currTheme = THEME_CONFIG[themeMode];

  // Dynamic page width class based on reader width toggle
  const getPageWidthClass = () => {
    if (readerWidth === 'standard') return 'max-w-3xl w-full';
    if (readerWidth === 'wide') return 'max-w-5xl w-full';
    return 'max-w-7xl w-full';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${currTheme.container} select-none transition-colors duration-200 overflow-hidden`}
    >
      {/* Top Application Bar */}
      <div className={`h-14 border-b ${currTheme.topBar} backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs z-30 transition-colors`}>
        {/* Left: Close & Book Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-xs cursor-pointer shrink-0 border border-amber-600/30"
            title={lang === 'fr' ? 'Retourner à la bibliothèque' : 'الرجوع إلى المكتبة'}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Retour' : 'رجوع'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer sm:hidden"
            title={lang === 'fr' ? 'Fermer le lecteur' : 'إغلاق القارئ'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] opacity-75 truncate">
              <span>{book.author}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>DRM Actif</span>
              </span>
              {pdfDoc && (
                <>
                  <span>·</span>
                  <span className="text-amber-700 font-bold bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.2 rounded text-[10px]">
                    PDF HD
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Pagination & Navigation Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10">
            <span className="font-bold tabular-nums">{currentPage}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-75 tabular-nums">{totalPagesCount}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= maxAllowedPage}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Controls & Prominent Reading Modes & Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Width Mode Toggle (Standard / Wide / Full) */}
          <div className="hidden md:flex items-center gap-0.5 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg border border-black/10 dark:border-white/10">
            <button
              onClick={() => setReaderWidth('standard')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                readerWidth === 'standard' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              title="Largeur Standard (780px)"
            >
              780
            </button>
            <button
              onClick={() => setReaderWidth('wide')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                readerWidth === 'wide' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              title="Largeur Confort (1100px)"
            >
              Confort
            </button>
            <button
              onClick={() => setReaderWidth('full')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                readerWidth === 'full' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'opacity-60 hover:opacity-100'
              }`}
              title="Plein Écran / Large (100%)"
            >
              Large
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-lg p-0.5 border border-black/10 dark:border-white/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 tabular-nums font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PROMINENT READING THEME MODES (JOUR / JAUNE / NUIT) */}
          <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 shadow-2xs">
            {/* Jour (نهاري) */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-300 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-white/50'
              }`}
              title={lang === 'fr' ? 'Mode Jour (Fond Blanc)' : 'وضع نهاري (أبيض)'}
            >
              <Sun className={`w-3.5 h-3.5 ${themeMode === 'light' ? 'text-amber-500 fill-amber-500/20' : ''}`} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Jour' : 'نهاري'}</span>
            </button>

            {/* Jaune / Sepia (دافئ ومريح) */}
            <button
              type="button"
              onClick={() => setThemeMode('sepia')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'sepia'
                  ? 'bg-[#EDE4D3] text-amber-950 shadow-xs border border-amber-300 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-amber-950 hover:bg-[#EDE4D3]/60'
              }`}
              title={lang === 'fr' ? 'Fond Jaune Sépia (Repos des yeux)' : 'وضع أصفر دافئ مريح للعين'}
            >
              <span className="w-3 h-3 rounded-full bg-[#E5D7B7] border border-amber-600/60 inline-block shrink-0 shadow-2xs" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Jaune' : 'أصفر'}</span>
            </button>

            {/* Nuit (ليلي عالي التباين) */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-stone-900 text-amber-300 shadow-xs border border-stone-700 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-700/50'
              }`}
              title={lang === 'fr' ? 'Mode Nuit (Fond Sombre)' : 'وضع ليلي عالي الوضوح'}
            >
              <Moon className={`w-3.5 h-3.5 ${themeMode === 'dark' ? 'text-amber-300 fill-amber-300/30' : ''}`} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Nuit' : 'ليلي'}</span>
            </button>

            <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-white" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline">{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
            </button>
          </div>

          {/* Toggle between Structured Chapters and PDF if both available */}
          {pdfUrl && book.pages && book.pages.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStructuredText(!showStructuredText)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showStructuredText
                  ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showStructuredText ? 'Mode PDF' : 'Texte'}
              </span>
            </button>
          )}

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isCurrentPageBookmarked ? 'text-amber-600' : 'opacity-60'
            }`}
            title="Marque-page"
          >
            <Bookmark className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Sidebar Drawer Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Sommaire et annotations"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Reading Canvas & Scrollable Content Area */}
      <div className="flex-1 relative overflow-auto flex flex-col items-center p-3 sm:p-6 md:p-8 pb-20">
        {/* Anti-Screen Capture Shield Overlay */}
        {isShieldActive && (
          <div className="absolute inset-0 z-40 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-100">
            <div className="max-w-md p-6 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">
                {lang === 'fr'
                  ? 'Contenu Masqué — Protection Anti-Capture'
                  : 'محتوى محمي — درع الحماية ضد لقطات الشاشة'}
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                {lang === 'fr'
                  ? 'Pour empêcher l\'extraction illégale et les captures d\'écran par outils tiers, la page se masque instantanément lors de la perte de focus de l\'application.'
                  : 'لحماية المحتوى الأكاديمي من الاستخراج غير المرخص، يتم حجب الصفحة تلقائياً عند مغادرة نافذة التطبيق.'}
              </p>
              <button
                onClick={() => setIsShieldActive(false)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'Reprendre la lecture sécurisée' : 'استئناف القراءة الآمنة'}
              </button>
            </div>
          </div>
        )}

        {/* Security Alert Toast */}
        {activeAlert && (
          <div className="fixed top-16 right-4 z-50 max-w-sm p-4 bg-amber-950 border border-amber-600 text-amber-100 rounded-xl shadow-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-amber-200 mb-0.5">{activeAlert.title}</div>
              <div className="text-stone-300">{activeAlert.message}</div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="text-stone-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Locked Sample Notice for Unacquired Books */}
        {!effectiveIsAcquired && currentPage > (book.sampleMaxPage || 2) ? (
          <div className="max-w-lg mx-auto my-12 p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl text-center">
            <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
              {lang === 'fr' ? 'Fin de l\'Extrait Gratuit' : 'نهاية العينة المجانية للقراءة'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
              {lang === 'fr'
                ? `Vous avez atteint la limite de prévisualisation (page ${book.sampleMaxPage || 2}/${totalPagesCount}). Inscrivez-vous et débloquez votre licence étudiante au tarif préférentiel.`
                : `لقد وصلت إلى حد القراءة التجريبية المجانية (${book.sampleMaxPage || 2}/${totalPagesCount}). يرجى اقتناء الكتاب لفتح الترخيص كاملاً بالتعريفة الطلابية المدعومة.`}
            </p>
            <button
              onClick={() => onAcquireBook(book.id)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {book.isFree
                  ? lang === 'fr'
                    ? 'Activer le polycopié gratuit'
                    : 'تفعيل الكتاب المجاني'
                  : lang === 'fr'
                  ? `Activer la Licence Étudiant (${book.priceMAD} DH)`
                  : `تفعيل الترخيص الطلابي (${book.priceMAD} درهم)`}
              </span>
            </button>
          </div>
        ) : (
          /* The Academic Reading Container */
          <div className="relative flex flex-col items-center w-full">
            {/* Dynamic Moving Forensic Watermark */}
            <div
              style={{
                top: `${watermarkPos.y}%`,
                left: `${watermarkPos.x}%`,
                transform: 'translate(-50%, -50%) rotate(-25deg)',
              }}
              className="absolute pointer-events-none z-30 transition-all duration-1000 ease-out text-center opacity-25"
            >
              <div className="font-mono text-[11px] font-black tracking-widest text-stone-950 dark:text-white uppercase drop-shadow-xs">
                FAC EN PDF · ÉTUDIANT: {student.studentId || 'AUTHENTIFIÉ'}
              </div>
              <div className="font-mono text-[9px] text-stone-800 dark:text-stone-300 drop-shadow-xs">
                {student.email || 'etudiant@uae.ac.ma'} · DRM #{student.drmLicenseKey?.slice(0, 14) || 'FAC-2026-ACTIVE'}
              </div>
            </div>

            {/* Static diagonal watermark pattern across page */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.035] flex items-center justify-center select-none z-20">
              <div className="rotate-[-35deg] text-stone-900 dark:text-white font-mono text-base font-black text-center space-y-12">
                <div>FAC EN PDF · {student.studentId} · REPRODUCTION INTERDITE</div>
                <div>FAC EN PDF · {student.studentId} · REPRODUCTION INTERDITE</div>
                <div>FAC EN PDF · {student.studentId} · REPRODUCTION INTERDITE</div>
              </div>
            </div>

            {/* REAL PDF CANVAS MODE */}
            {!showStructuredText && pdfDoc ? (
              <div className="flex flex-col items-center w-full">
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl border ${currTheme.canvasWrapper}`}
                  style={{
                    filter: currTheme.canvasFilter,
                    transition: 'filter 0.2s ease',
                  }}
                >
                  {isRenderingPage && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="block max-w-full h-auto mx-auto" />
                </div>
              </div>
            ) : !showStructuredText && pdfLoading ? (
              /* Loading Real PDF indicator */
              <div className="min-h-[600px] w-[500px] max-w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                <h3 className="text-sm font-bold">
                  {lang === 'fr' ? 'Chargement du document PDF...' : 'جاري معالجة صفحات الكتاب...'}
                </h3>
                <p className="text-xs opacity-70">
                  {lang === 'fr'
                    ? 'Préparation de la lecture in-app avec injection du filigrane DRM.'
                    : 'يتم تهيئة القارئ المحمي وتطبيق العلامة المائية المشفرة.'}
                </p>
              </div>
            ) : (
              /* STRUCTURED ARABIC TEXT VIEW (CLEAN, WIDE & EYE-RESTING) */
              <div className={`flex flex-col items-center ${getPageWidthClass()} transition-all duration-200 space-y-4`}>
                {/* Optional Collapsible PDF Attachment Banner (Dismissible by Student) */}
                {!pdfUrl && !isBannerDismissed && (
                  <div className="w-full p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Upload className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate opacity-90">
                        {lang === 'fr'
                          ? 'Vous lisez le cours au format structuré optimisé pour la lecture.'
                          : 'أنت تتصفح المحتوى الأكاديمي بالنمط النصي المنظم والمريح للقراءة.'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {lang === 'fr' ? 'Charger un PDF' : 'إرفاق PDF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBannerDismissed(true)}
                        className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-md cursor-pointer"
                        title="Masquer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* THE MAIN BOOK READING CARD */}
                <div
                  className={`relative min-h-[920px] p-8 sm:p-12 md:p-16 rounded-3xl border ${currTheme.page} transition-all duration-150 leading-relaxed w-full`}
                >
                  {/* Page Header */}
                  <div className={`border-b ${currTheme.header} pb-3 mb-6 flex items-center justify-between text-xs`}>
                    <span className="font-medium tracking-wide uppercase truncate max-w-sm">
                      {pageData.header || book.title}
                    </span>
                    <span className="font-mono tabular-nums font-bold">Page {pageData.pageNumber || currentPage}</span>
                  </div>

                  {/* Chapter Title - HIGH CONTRAST IN ALL THEMES */}
                  <div className="mb-6">
                    <h2 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${currTheme.title}`}>
                      {pageData.chapterTitle || `Section ${currentPage}`}
                    </h2>
                    <div className="h-1 w-14 bg-amber-500 rounded-full" />
                  </div>

                  {/* Main Content Paragraphs */}
                  <div className={`space-y-4 text-base sm:text-lg leading-relaxed text-justify ${currTheme.body}`}>
                    {(pageData.content || []).map((paragraph, idx) => (
                      <p key={idx} className="first-letter:font-bold">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Key Points */}
                  {pageData.keyPoints && pageData.keyPoints.length > 0 && (
                    <div className={`my-8 p-5 border-l-4 rounded-r-2xl ${currTheme.keyPointsBg}`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${currTheme.keyPointsTitle}`}>
                        {lang === 'fr' ? 'Points Clés & Synthèse du Module' : 'النقاط الجوهرية والملخص الأكاديمي'}
                      </h4>
                      <ul className="space-y-2 text-sm sm:text-base">
                        {pageData.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className={`font-bold shrink-0 ${currTheme.keyPointsBullet}`}>◆</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Page Footer */}
                  <div className={`mt-12 pt-4 border-t ${currTheme.footer} flex items-center justify-between text-[11px]`}>
                    <span>{book.author} — {book.facultyLabel || book.faculty}</span>
                    <span className="font-mono">FAC-PDF-SECURE-PAGE-{currentPage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Navigation Dock (Page Slider) */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-md border shadow-2xl transition-all ${currTheme.bottomDock}`}>
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>

        <input
          type="range"
          min={1}
          max={totalPagesCount}
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          className="w-32 sm:w-56 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <button
          onClick={handleNextPage}
          disabled={currentPage >= maxAllowedPage}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>

        <span className="font-mono font-bold text-xs tabular-nums min-w-[50px] text-center">
          {currentPage} / {totalPagesCount}
        </span>
      </div>

      {/* Floating Table of Contents / Sidebar Drawer */}
      {sidebarOpen && (
        <div className={`absolute top-14 right-0 bottom-0 w-80 ${currTheme.topBar} border-l shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200`}>
          <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('toc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'toc'
                    ? 'bg-amber-500 text-stone-950'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {lang === 'fr' ? 'Sommaire' : 'الفهرس'}
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-500 text-stone-950'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {lang === 'fr' ? 'Signets' : 'العلامات'} ({bookmarks.length})
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
            {activeTab === 'toc' && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold opacity-60 mb-2 uppercase tracking-wide">
                  {lang === 'fr' ? 'Chapitres & Pages' : 'الفصول والصفحات'}
                </div>
                {book.chapters?.map((chap, idx) => (
                  <button
                    key={chap.id || idx}
                    type="button"
                    onClick={() => {
                      if (chap.startPage <= maxAllowedPage) {
                        setCurrentPage(chap.startPage);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl text-start flex items-center justify-between transition-colors cursor-pointer ${
                      currentPage >= chap.startPage && currentPage < chap.startPage + chap.pageCount
                        ? 'bg-amber-500/20 border border-amber-500 text-amber-500 font-bold'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{chap.title}</span>
                    <span className="font-mono text-[10px] opacity-60 ml-2">P. {chap.startPage}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-1.5">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <Bookmark className="w-8 h-8 mx-auto mb-2" />
                    <p>{lang === 'fr' ? 'Aucun signet enregistré' : 'لا توجد علامات محفوظة'}</p>
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <button
                      key={bm.id}
                      type="button"
                      onClick={() => {
                        setCurrentPage(bm.pageNumber);
                        setSidebarOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-start flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold">Page {bm.pageNumber}</div>
                        <div className="text-[10px] opacity-60">{bm.chapterTitle}</div>
                      </div>
                      <span className="text-[10px] text-amber-500 font-mono">{bm.createdAt}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
