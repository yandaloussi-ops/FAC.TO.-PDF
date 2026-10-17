import React, { useState, useMemo } from 'react';
import { Book, FacultyType } from '../types';
import { FACULTY_CATEGORIES, SEMESTER_FILTERS, UNIVERSITIES_DATABASE } from '../data/mockBooks';
import { BookCard } from './BookCard';
import {
  Filter,
  Sparkles,
  Building2,
  Layers,
  BookOpen,
  LayoutGrid,
  List,
  ArrowUpDown,
  ShoppingCart,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface BookCatalogProps {
  books: Book[];
  acquiredBookIds: string[];
  searchQuery: string;
  selectedFaculty?: string;
  onSelectFaculty?: (f: string) => void;
  selectedSemester?: string;
  onSelectSemester?: (s: string) => void;
  onOpenDetails: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onQuickBuy?: (book: Book) => void;
  onReturnHome?: () => void;
  isVisitorMode?: boolean;
  onToggleVisitorMode?: () => void;
  lang: 'fr' | 'ar';
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  acquiredBookIds,
  searchQuery,
  selectedFaculty: externalFaculty = 'all',
  onSelectFaculty,
  selectedSemester: externalSemester = 'Tous',
  onSelectSemester,
  onOpenDetails,
  onOpenReader,
  onQuickBuy,
  onReturnHome,
  isVisitorMode = false,
  onToggleVisitorMode,
  lang,
}) => {
  const [internalFaculty, setInternalFaculty] = useState<string>('all');
  const [internalSemester, setInternalSemester] = useState<string>('Tous');
  const [selectedUnivFilter, setSelectedUnivFilter] = useState<string>('all');
  const [onlyFree, setOnlyFree] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'pages'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedFaculty = onSelectFaculty ? externalFaculty : internalFaculty;
  const setSelectedFaculty = (f: string) => {
    if (onSelectFaculty) onSelectFaculty(f);
    else setInternalFaculty(f);
  };

  const selectedSemester = onSelectSemester ? externalSemester : internalSemester;
  const setSelectedSemester = (s: string) => {
    if (onSelectSemester) onSelectSemester(s);
    else setInternalSemester(s);
  };

  // Filter books
  const filteredBooks = useMemo(() => {
    const list = books.filter((book) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchTitle = book.title.toLowerCase().includes(query);
        const matchTitleAr = book.titleAr?.toLowerCase().includes(query);
        const matchAuthor = book.author.toLowerCase().includes(query);
        const matchDesc = book.description.toLowerCase().includes(query);
        const matchUniversity = book.university.toLowerCase().includes(query);
        const matchFaculty = book.facultyLabel?.toLowerCase().includes(query) || book.faculty.toLowerCase().includes(query);
        const matchSpecialty = (book.specialty && book.specialty.toLowerCase().includes(query)) ||
          (book.specialtyAr && book.specialtyAr.toLowerCase().includes(query));
        const matchModule = (book.module && book.module.toLowerCase().includes(query)) ||
          (book.moduleAr && book.moduleAr.toLowerCase().includes(query));
        const matchTag = book.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchTitleAr && !matchAuthor && !matchDesc && !matchUniversity && !matchFaculty && !matchSpecialty && !matchModule && !matchTag) {
          return false;
        }
      }

      // University filter
      if (selectedUnivFilter !== 'all') {
        const univ = UNIVERSITIES_DATABASE.find((u) => u.code === selectedUnivFilter);
        if (univ) {
          const matchCode = book.university.toLowerCase().includes(univ.code.toLowerCase());
          const matchName = book.university.toLowerCase().includes(univ.nameFr.toLowerCase());
          if (!matchCode && !matchName) return false;
        }
      }

      // Faculty filter
      if (selectedFaculty !== 'all' && book.faculty !== selectedFaculty) {
        return false;
      }

      // Semester filter
      if (selectedSemester !== 'Tous' && book.semester !== selectedSemester) {
        return false;
      }

      // Free filter
      if (onlyFree && !book.isFree) {
        return false;
      }

      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceMAD - b.priceMAD;
      if (sortBy === 'price_desc') return b.priceMAD - a.priceMAD;
      if (sortBy === 'pages') return b.totalPages - a.totalPages;
      return 0;
    });
  }, [books, searchQuery, selectedFaculty, selectedSemester, selectedUnivFilter, onlyFree, sortBy]);

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
            {lang === 'fr' ? 'Bibliothèque Numérique Universitaire Publique' : 'المعرض العام لمكتبة المقررات الجامعية'}
          </span>
        </div>
      )}

      {/* Public Gallery Banner Header */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{lang === 'fr' ? 'Galerie & Exposition Publique' : 'المعرض العام للكتب والمطبوعات'}</span>
              <span className="text-stone-400">·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === 'fr' ? 'Lecture In-App Protégée' : 'قراءة آمنة حصرياً بالتطبيق'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {lang === 'fr'
                ? 'Bibliothèque Publique des Cours & Polycopiés'
                : 'المعرض الأكاديمي العام للمقررات والكتب الجامعية'}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {lang === 'fr'
                ? 'Consultez, révisez et achetez les polycopiés officiels certifiés par les enseignants des facultés marocaines. Accès immédiat dans votre lecteur in-app sécurisé.'
                : 'اكتشف وتصفح واقتنِ مقررات ومطبوعات أساتذة الجامعات المغربية مع حماية رقمية متطورة وقراءة فورية داخل التطبيق.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700 text-center min-w-24">
              <div className="text-xl font-black text-amber-400 font-mono">{filteredBooks.length}</div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'fr' ? 'Cours Expositions' : 'مقرر متوفر'}
              </div>
            </div>

            <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700 text-center min-w-24">
              <div className="text-xl font-black text-sky-400 font-mono">12</div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'fr' ? 'Universités' : 'جامعة مغربية'}
              </div>
            </div>
          </div>
        </div>

        {/* Visitor Mode Banner (Requirement 9) */}
        {isVisitorMode && (
          <div className="mt-4 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>
                {lang === 'fr'
                  ? 'Mode Visiteur Actif : Vous consultez les cours au tarif public standard. Les étudiants inscrits bénéficient de tarifs subventionnés.'
                  : 'وضع الزوار مفعّل: تتصفح المقررات بالتعريفة العامة المخصصة للزوار والعموم. الطلبة المسجلون يستفيدون من الأسعار المدعومة والمخفضة.'}
              </span>
            </div>
            {onToggleVisitorMode && (
              <button
                type="button"
                onClick={onToggleVisitorMode}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {lang === 'fr' ? 'Passer au Tarif Étudiant' : 'التحويل إلى أسعار الطلبة المدعومة'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Control Station */}
      <div className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
        {/* Row 1: University Dropdown, Free Filter, Sort, View mode */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* University Dropdown */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-stone-500" />
              <select
                value={selectedUnivFilter}
                onChange={(e) => setSelectedUnivFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{lang === 'fr' ? `Toutes les ${UNIVERSITIES_DATABASE.length} Universités` : `جميع الجامعات المغربية (${UNIVERSITIES_DATABASE.length})`}</option>
                {UNIVERSITIES_DATABASE.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} · {u.nameFr}
                  </option>
                ))}
              </select>
            </div>

            {/* Free only toggle */}
            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyFree
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-stone-300 text-stone-700 hover:border-stone-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'fr' ? 'Polycopiés Gratuits' : 'المقررات المجانية'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-medium focus:outline-none"
              >
                <option value="default">{lang === 'fr' ? 'Tri : Recommandés' : 'ترتيب: المقترحة'}</option>
                <option value="price_asc">{lang === 'fr' ? 'Prix : Moins chers' : 'السعر: الأقل'}</option>
                <option value="price_desc">{lang === 'fr' ? 'Prix : Plus chers' : 'السعر: الأعلى'}</option>
                <option value="pages">{lang === 'fr' ? 'Nombre de pages' : 'عدد الصفحات'}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl bg-white border border-stone-300 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Affichage en Grille"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Affichage en Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Interactive Faculty Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FACULTY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFaculty(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedFaculty === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-200/80 text-stone-700 border border-stone-200'
              }`}
            >
              {lang === 'fr' ? cat.label : cat.labelAr}
            </button>
          ))}
        </div>

        {/* Row 3: Semester Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            {lang === 'fr' ? 'Semestre :' : 'السداسي:'}
          </span>
          {SEMESTER_FILTERS.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedSemester === sem
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-200 p-8">
          <Filter className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-stone-900 mb-1">
            {lang === 'fr' ? 'Aucun cours trouvé dans ce filtre' : 'لا توجد نتائج مطابقة لمعايير البحث'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            {lang === 'fr'
              ? 'Essayez de réinitialiser vos filtres ou de modifier votre terme de recherche.'
              : 'يرجى تجربة تعديل الكلمات الدلالية أو إلغاء فلتر الجامعة والسداسي.'}
          </p>
          <button
            onClick={() => {
              setSelectedFaculty('all');
              setSelectedSemester('Tous');
              setSelectedUnivFilter('all');
              setOnlyFree(false);
            }}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            {lang === 'fr' ? 'Réinitialiser les filtres' : 'إعادة ضبط الفلاتر'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAcquired={acquiredBookIds.includes(book.id)}
              onOpenDetails={onOpenDetails}
              onOpenReader={onOpenReader}
              onQuickBuy={onQuickBuy}
              isVisitorMode={isVisitorMode}
              lang={lang}
            />
          ))}
        </div>
      ) : (
        /* List Exhibition View */
        <div className="space-y-3">
          {filteredBooks.map((book) => {
            const isAcquired = acquiredBookIds.includes(book.id);
            return (
              <div
                key={book.id}
                className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-14 aspect-[3/4] object-cover rounded-xl border border-stone-200 shrink-0 cursor-pointer"
                    onClick={() => onOpenDetails(book)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {book.facultyLabel}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {book.semester} · {book.totalPages} {lang === 'fr' ? 'pages' : 'ص'}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenDetails(book)}
                      className="font-bold text-stone-900 text-sm hover:text-amber-800 transition-colors cursor-pointer truncate"
                    >
                      {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
                    </h3>

                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {book.author} · {book.university}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    {book.isFree ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {lang === 'fr' ? 'Gratuit' : 'مجاني'}
                      </span>
                    ) : (
                      <div className="text-base font-black text-stone-900 font-mono">
                        {book.priceMAD} <span className="text-xs font-normal text-stone-500">DH</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetails(book)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      {lang === 'fr' ? 'Aperçu' : 'معاينة'}
                    </button>

                    {isAcquired ? (
                      <button
                        onClick={() => onOpenReader(book)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'fr' ? 'Lire' : 'قراءة'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuickBuy ? onQuickBuy(book) : onOpenDetails(book)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{lang === 'fr' ? 'Acheter' : 'اقتناء'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
