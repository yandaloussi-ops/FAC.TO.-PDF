import React, { useState, useEffect, useRef } from 'react';
import { Book, StudentProfile, UserNote, UserBookmark, DRMSecurityAlert } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { loadBookPdf, saveBookPdf } from '../utils/pdfStorage';
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
} from 'lucide-react';
import { setupDrmProtection } from '../utils/drmShield';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface SecureReaderProps {
  book: Book;
  student: StudentProfile;
  isAcquired: boolean;
  isAuthorOrAdmin?: boolean;
  onClose: () => void;
  onAcquireBook: (bookId: string) => void;
  lang: 'fr' | 'ar';
}

export const SecureReader: React.FC<SecureReaderProps> = ({
  book,
  student,
  isAcquired,
  isAuthorOrAdmin = false,
  onClose,
  onAcquireBook,
  lang,
}) => {
  const initialPage = student.bookProgress?.[book.id]?.currentPage || 1;
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'toc' | 'notes' | 'bookmarks'>('toc');

  // Study timer state
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);

  // DRM & Anti-Screen Capture states
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [activeAlert, setActiveAlert] = useState<DRMSecurityAlert | null>(null);
  const [watermarkPos, setWatermarkPos] = useState({ x: 25, y: 35 });
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Real PDF document states
  const [pdfUrl, setPdfUrl] = useState<string | null>(book.pdfUrl || null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Author, Admin, and Free book readers have full unblocked reading rights
  const effectiveIsAcquired = isAcquired || isAuthorOrAdmin || book.isFree || book.priceMAD === 0;

  // Custom user PDF upload states
  const [uploadPdfToast, setUploadPdfToast] = useState<string | null>(null);
  const [isUploadingCustomPdf, setIsUploadingCustomPdf] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Total pages: dynamically use real PDF pages if available, or book totalPages
  const totalPagesCount = pdfDoc ? pdfDoc.numPages : Math.max(book.totalPages || 8, 8);
  const maxAllowedPage = effectiveIsAcquired ? totalPagesCount : Math.min(book.sampleMaxPage || 2, totalPagesCount);

  // Check IndexedDB / memory storage for real PDF on mount, or auto-generate certified academic PDF
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

  // Handle local user/professor/admin upload of a real PDF for this book
  const handleCustomPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        alert(lang === 'fr' ? 'Veuillez sélectionner un fichier PDF valide (.pdf)' : 'يرجى اختيار ملف بصيغة PDF (.pdf)');
        return;
      }
      setIsUploadingCustomPdf(true);
      try {
        const objectUrl = await saveBookPdf(book.id, file);
        setPdfUrl(objectUrl);
        setCurrentPage(1);
        setUploadPdfToast(
          lang === 'fr'
            ? `Fichier "${file.name}" chargé et sauvegardé dans la mémoire locale sécurisée ! (${(file.size / (1024 * 1024)).toFixed(1)} Mo)`
            : `تم رفع ملف "${file.name}" وتخزينه في الذاكرة المحلية المشفرة للمتصفح بنجاح!`
        );
        setTimeout(() => setUploadPdfToast(null), 5000);
      } catch (err) {
        console.error('Failed to save custom PDF in reader:', err);
      } finally {
        setIsUploadingCustomPdf(false);
      }
    }
  };

  // Load PDF document when pdfUrl is available
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    setPdfLoading(true);
    setPdfError(null);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    loadingTask.promise
      .then((doc) => {
        if (isMounted) {
          setPdfDoc(doc);
          setPdfLoading(false);
          if (currentPage > doc.numPages) {
            setCurrentPage(1);
          }
        }
      })
      .catch((err) => {
        console.warn('PDF load warning:', err);
        if (isMounted) {
          setPdfError(err?.message || 'Erreur de chargement du document PDF');
          setPdfLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Render current PDF page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask: any = null;
    let isCancelled = false;

    // Do not render beyond allowed sample pages for unacquired books
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

        const baseScale = zoomLevel / 100;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: baseScale * dpr });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        renderTask = page.render({
          canvasContext: context,
          viewport,
          canvas,
        } as any);

        renderTask.promise
          .then(() => {
            if (!isCancelled) setIsRenderingPage(false);
          })
          .catch((err: any) => {
            if (err?.name !== 'RenderingCancelledException') {
              console.warn('PDF page render notice:', err);
            }
            if (!isCancelled) setIsRenderingPage(false);
          });
      })
      .catch((err) => {
        console.warn('Could not get page:', err);
        if (!isCancelled) setIsRenderingPage(false);
      });

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoomLevel, isAcquired, book.sampleMaxPage]);

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

  // Safe fallback dynamic academic text page if no PDF is uploaded
  const currentChapter =
    book.chapters?.find(
      (c) => currentPage >= c.startPage && currentPage < c.startPage + c.pageCount
    ) ||
    book.chapters?.[0] || {
      id: 'c1',
      title: 'Chapitre 1 : Fondements & Concepts Clés',
      startPage: 1,
      pageCount: 4,
    };

  const pageOffsetInChap = Math.max(1, currentPage - (currentChapter.startPage || 1) + 1);

  const foundPage = book.pages?.find((p) => p.pageNumber === currentPage);

  const pageData = foundPage || {
    pageNumber: currentPage,
    chapterTitle: `${currentChapter.title} — Section ${pageOffsetInChap}`,
    header: `FAC en PDF · ${book.title} · ${book.facultyLabel || book.faculty}`,
    content: [
      `Section ${pageOffsetInChap}.1 — Analyse conceptuelle et cadre théorique approfondi`,
      `Ce document constitue le polycopié officiel pour le module "${book.title}", dispensé dans le cadre du cursus universitaire accrédité à ${book.university || 'l\'Université'}.`,
      `En page ${currentPage}, l'étude porte sur la mise en application des règles doctrinales et jurisprudentielles fondamentales, complétée par des analyses méthodologiques indispensables pour la préparation des examens de fin de semestre (${book.semester}).`,
      `Rappel déontologique : Ce polycopié est protégé par la législation marocaine sur les droits d'auteur et droits voisins. Toute reproduction, capture d'écran, extraction ou diffusion publique est formellement interdite.`,
    ],
    keyPoints: [
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

  // Background and styling based on themeMode
  const themeContainerStyles = {
    light: 'bg-stone-100 text-stone-900',
    sepia: 'bg-[#EDE4D3] text-stone-900',
    dark: 'bg-[#121110] text-stone-100',
  };

  const canvasFilters = {
    light: 'none',
    sepia: 'sepia(0.35) contrast(0.95) brightness(0.98)',
    dark: 'invert(0.92) hue-rotate(180deg) contrast(1.1) brightness(0.95)',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${themeContainerStyles[themeMode]} select-none transition-colors duration-200 overflow-hidden`}
    >
      {/* Top Application Bar */}
      <div className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs z-30">
        {/* Left: Book Meta & DRM Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title={lang === 'fr' ? 'Fermer le lecteur' : 'إغلاق القارئ'}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 truncate">
              <span>{book.author}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>DRM Actif</span>
              </span>
              {pdfDoc && (
                <>
                  <span>·</span>
                  <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                    PDF Réel
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Pagination & Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            title="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
            <span className="font-bold tabular-nums text-stone-900 dark:text-white">{currentPage}</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-500 tabular-nums">{totalPagesCount}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= maxAllowedPage}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
            title="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Controls & Prominent Reading Modes & Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded transition-colors text-stone-700 dark:text-stone-300"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 tabular-nums text-stone-800 dark:text-stone-200">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
              className="p-1 hover:bg-white dark:hover:bg-stone-700 rounded transition-colors text-stone-700 dark:text-stone-300"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PROMINENT READING MODES & FULLSCREEN */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            {/* Jour (نهار) */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-300 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-white/50'
              }`}
              title={lang === 'fr' ? 'Mode Jour (Fond Blanc)' : 'قراءة نهارية (خلفية بيضاء)'}
            >
              <Sun className={`w-3.5 h-3.5 ${themeMode === 'light' ? 'text-amber-500 fill-amber-500/20' : ''}`} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Jour' : 'نهارية'}</span>
            </button>

            {/* Jaune / Sepia (خلفية صفراء) */}
            <button
              type="button"
              onClick={() => setThemeMode('sepia')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'sepia'
                  ? 'bg-[#EDE4D3] text-amber-950 shadow-xs border border-amber-300 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-amber-950 hover:bg-[#EDE4D3]/60'
              }`}
              title={lang === 'fr' ? 'Fond Jaune Sépia (Repos des yeux)' : 'خلفية صفراء مريحة للعين'}
            >
              <span className="w-3 h-3 rounded-full bg-[#E5D7B7] border border-amber-600/60 inline-block shrink-0 shadow-2xs" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Jaune' : 'صفراء'}</span>
            </button>

            {/* Nuit (ليلية) */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-stone-900 text-amber-300 shadow-xs border border-stone-700 ring-2 ring-amber-500/40'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-700/50'
              }`}
              title={lang === 'fr' ? 'Mode Nuit (Fond Sombre)' : 'قراءة ليلية (خلفية داكنة)'}
            >
              <Moon className={`w-3.5 h-3.5 ${themeMode === 'dark' ? 'text-amber-300 fill-amber-300/30' : ''}`} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Nuit' : 'ليلية'}</span>
            </button>

            <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

            {/* Fullscreen (ملء الشاشة) */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                  : 'bg-stone-200/90 dark:bg-stone-700/90 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100'
              }`}
              title={
                isFullscreen
                  ? lang === 'fr'
                    ? 'Quitter le mode plein écran'
                    : 'الخروج من ملء الشاشة'
                  : lang === 'fr'
                  ? 'Activer la lecture plein écran'
                  : 'قراءة ملء الشاشة'
              }
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-white" />
              ) : (
                <Maximize className="w-3.5 h-3.5 text-stone-700 dark:text-stone-200" />
              )}
              <span className="hidden md:inline">
                {isFullscreen ? (lang === 'fr' ? 'Réduire' : 'إنهاء') : (lang === 'fr' ? 'Plein écran' : 'ملء الشاشة')}
              </span>
            </button>
          </div>

          {/* Real PDF Custom File Upload Button */}
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleCustomPdfUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCustomPdf}
              className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={
                lang === 'fr'
                  ? 'Charger un fichier PDF réel depuis votre appareil pour ce livre (Stocké dans la mémoire locale)'
                  : 'رفع ملف PDF حقيقي من جهازك لهذا المقرر (حفظ في الذاكرة المحلية المشفرة للمتصفح)'
              }
            >
              {isUploadingCustomPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {lang === 'fr' ? 'Charger mon PDF' : 'رفع PDF خاص'}
              </span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
              isCurrentPageBookmarked ? 'text-amber-600' : 'text-stone-500'
            }`}
            title="Marque-page"
          >
            <Bookmark className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Sommaire et annotations"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload PDF Notification Toast Banner */}
      {uploadPdfToast && (
        <div className="bg-emerald-950 border-b border-emerald-500/50 text-emerald-200 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-40 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadPdfToast}</span>
          </div>
          <button
            onClick={() => setUploadPdfToast(null)}
            className="text-emerald-400 hover:text-white p-1 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Reading Canvas & Container */}
      <div className="flex-1 relative overflow-auto flex items-start justify-center p-3 sm:p-6 md:p-8">
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
                  : 'تم حجب المحتوى — حماية حقوق التأليف والنشر'}
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed mb-6">
                {lang === 'fr'
                  ? 'Pour empêcher l\'extraction illégale et les captures d\'écran par outils tiers, la page se masque instantanément lors de la perte de focus de l\'application.'
                  : 'لحماية المحاضرات والكتب الجامعية من التسريب والقرصنة، يتم إخفاء المحتوى فور فقدان تركيز نافذة التطبيق أو تشغيل أدوات القص.'}
              </p>
              <button
                onClick={() => setIsShieldActive(false)}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'Reprendre la lecture sécurisée' : 'العودة للمتابعة الآمنة'}
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
              {lang === 'fr' ? 'Fin de l\'Extrait Gratuit' : 'نهاية العينة المجانية للدرس'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
              {lang === 'fr'
                ? `Vous avez atteint la limite de prévisualisation (page ${book.sampleMaxPage || 2}/${totalPagesCount}). Inscrivez-vous et débloquez votre licence étudiante au tarif préférentiel.`
                : `لقد اطلعت على الصفحات التجريبية المسموحة (${book.sampleMaxPage || 2}/${totalPagesCount}). يرجى تفعيل ترخيصك بالتعريفة التفضيلية للطلبة لمطالعة كافة صفحات المقرر.`}
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
                    : 'تفعيل المطبوع مجاناً'
                  : lang === 'fr'
                  ? `Activer la Licence Étudiant (${book.priceMAD} DH)`
                  : `تفعيل الترخيص الأكاديمي (${book.priceMAD} درهم)`}
              </span>
            </button>
          </div>
        ) : (
          /* The Academic Reading Container */
          <div className="relative flex flex-col items-center">
            {/* Dynamic Moving Forensic Watermark */}
            <div
              style={{
                top: `${watermarkPos.y}%`,
                left: `${watermarkPos.x}%`,
                transform: 'translate(-50%, -50%) rotate(-25deg)',
              }}
              className="absolute pointer-events-none z-30 transition-all duration-1000 ease-out text-center opacity-20"
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
            {pdfDoc ? (
              <div className="flex flex-col items-center">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300 dark:border-stone-800 bg-white"
                  style={{
                    filter: canvasFilters[themeMode],
                    transition: 'filter 0.2s ease',
                  }}
                >
                  {isRenderingPage && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="block max-w-full h-auto" />
                </div>

                {/* Sub-canvas Document Info & Instant PDF Re-upload action */}
                <div className="mt-3.5 flex flex-wrap items-center justify-between w-full max-w-2xl px-2 gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {lang === 'fr' ? 'Moteur PDF Natif Canvas HD' : 'محرك عرض PDF الحقيقي عالي الدقة'}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{currentPage} / {totalPagesCount}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-stone-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'fr' ? 'Remplacer / Charger un autre fichier PDF' : 'رفع / استبدال بملف PDF آخر'}</span>
                  </button>
                </div>
              </div>
            ) : pdfError ? (
              /* PDF Error Fallback with Instant Device Upload */
              <div className="min-h-[400px] w-[500px] max-w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {lang === 'fr' ? 'Chargement du document PDF' : 'تحضير ملف الـ PDF'}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  {pdfError}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Choisir un fichier PDF depuis mon appareil' : 'اختيار ملف PDF من جهازي'}</span>
                </button>
              </div>
            ) : pdfLoading ? (
              /* Loading Real PDF indicator */
              <div className="min-h-[600px] w-[500px] max-w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {lang === 'fr' ? 'Chargement du document PDF...' : 'جاري فتح وتحميل صفحات المرجع بأمان...'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'fr'
                    ? 'Préparation de la lecture in-app avec injection du filigrane DRM.'
                    : 'يتم تشفير الصفحات وتوليد العلامة المائية الرقمية للاطلاع الآمن.'}
                </p>
              </div>
            ) : (
              /* FALLBACK STRUCTURED TEXT RENDERING MODE (Safe null-checked) */
              <div
                style={{ width: `${Math.min(960, 780 * (zoomLevel / 100))}px` }}
                className={`relative min-h-[920px] p-8 sm:p-12 md:p-16 rounded-2xl border shadow-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 transition-all duration-150 leading-relaxed`}
              >
                {/* Page Header */}
                <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3 mb-6 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-medium tracking-wide uppercase truncate max-w-sm">
                    {pageData.header || book.title}
                  </span>
                  <span className="font-mono tabular-nums">Page {pageData.pageNumber || currentPage}</span>
                </div>

                {/* Chapter Title */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-balance">
                    {pageData.chapterTitle || `Section ${currentPage}`}
                  </h2>
                  <div className="h-0.5 w-12 bg-amber-600 rounded-full" />
                </div>

                {/* Main Content Paragraphs */}
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-justify text-stone-800 dark:text-stone-200">
                  {(pageData.content || []).map((paragraph, idx) => (
                    <p key={idx} className="first-letter:font-semibold">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Key Points */}
                {pageData.keyPoints && pageData.keyPoints.length > 0 && (
                  <div className="my-8 p-4 bg-stone-50/80 dark:bg-stone-800/60 border-l-4 border-amber-600 rounded-r-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2">
                      {lang === 'fr' ? 'Points Clés & Synthèse du Module' : 'النقاط الجوهرية والملخص الأكاديمي'}
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                      {pageData.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Page Footer */}
                <div className="mt-12 pt-4 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span>{book.author} — {book.facultyLabel || book.faculty}</span>
                  <span className="font-mono">FAC-PDF-SECURE-PAGE-{currentPage}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Table of Contents / Sidebar Drawer */}
      {sidebarOpen && (
        <div className="absolute top-14 right-0 bottom-0 w-80 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('toc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'toc'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {lang === 'fr' ? 'Sommaire' : 'الفهرس'}
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'bookmarks'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {lang === 'fr' ? 'Signets' : 'العلامات'} ({bookmarks.length})
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
            {activeTab === 'toc' && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-stone-500 mb-2 uppercase tracking-wide">
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
                        ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-300 text-amber-950 dark:text-amber-300 font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="truncate">{chap.title}</span>
                    <span className="font-mono text-[10px] text-stone-400 ml-2">P. {chap.startPage}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-1.5">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{lang === 'fr' ? 'Aucun signet enregistré' : 'لا توجد علامات مرجعية محفوظة'}</p>
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
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-start flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-stone-900 dark:text-white">Page {bm.pageNumber}</div>
                        <div className="text-[10px] text-stone-500">{bm.chapterTitle}</div>
                      </div>
                      <span className="text-[10px] text-amber-600 font-mono">{bm.createdAt}</span>
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
