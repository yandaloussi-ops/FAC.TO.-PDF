import React, { useState } from 'react';
import { UNIVERSITIES_DATABASE } from '../data/mockBooks';
import { useAcademicStructure } from '../utils/academicStructureStorage';
import {
  X,
  Building2,
  GraduationCap,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface UniversitiesModalProps {
  onClose: () => void;
  onFilterAndGoToCatalog: (faculty?: string, semester?: string, search?: string) => void;
  onOpenProfessorRegister?: () => void;
  lang: 'fr' | 'ar';
}

export const UniversitiesModal: React.FC<UniversitiesModalProps> = ({
  onClose,
  onFilterAndGoToCatalog,
  onOpenProfessorRegister,
  lang,
}) => {
  const { specialties } = useAcademicStructure();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'universities' | 'specialties'>('universities');

  // Quick Test Interactive Console States (No typing required)
  const [selectedUnivCode, setSelectedUnivCode] = useState<string>(UNIVERSITIES_DATABASE[0].code);
  const currentUniv = UNIVERSITIES_DATABASE.find((u) => u.code === selectedUnivCode) || UNIVERSITIES_DATABASE[0];
  const [selectedFaculty, setSelectedFaculty] = useState<string>(currentUniv.faculties[0]);
  const [copiedText, setCopiedText] = useState(false);

  // When university changes, auto-select first faculty of that university
  const handleSelectUniversity = (code: string) => {
    setSelectedUnivCode(code);
    const univ = UNIVERSITIES_DATABASE.find((u) => u.code === code) || UNIVERSITIES_DATABASE[0];
    if (univ && univ.faculties.length > 0) {
      setSelectedFaculty(univ.faculties[0]);
    }
  };

  // Direct test jump from the console
  const handleLaunchQuickTest = () => {
    onClose();
    // Pass faculty keyword and university name
    onFilterAndGoToCatalog(selectedFaculty, undefined, currentUniv.nameFr);
  };

  // Copy name for testing forms
  const handleCopySelectedInfo = () => {
    const textToCopy = `${currentUniv.nameFr} (${currentUniv.code}) - ${selectedFaculty}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const filteredUniversities = UNIVERSITIES_DATABASE.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.nameFr.toLowerCase().includes(q) ||
      u.nameAr.toLowerCase().includes(q) ||
      u.code.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.faculties.some((f) => f.toLowerCase().includes(q))
    );
  });

  const filteredSpecialties = specialties.filter((sp) => {
    const matchesCycle = selectedCycle === 'all' || sp.cycle === selectedCycle;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      sp.nameFr.toLowerCase().includes(q) ||
      sp.nameAr.toLowerCase().includes(q) ||
      sp.facultyCode.toLowerCase().includes(q);
    return matchesCycle && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl border border-sky-200 shadow-xs">
              <Building2 className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900">
                  {lang === 'fr'
                    ? 'Base de Données des 12 Universités & Facultés Affiliées'
                    : 'قاعدة بيانات الـ 12 جامعة مغربية وجميع الكليات التابعة لها'}
                </h2>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-300">
                  {lang === 'fr' ? 'Test Direct & Sans Saisie' : 'اختبار فوري بدون كتابة'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'fr'
                  ? 'Sélectionnez directement votre université et sa faculté pour tester sans rien taper au clavier.'
                  : 'اختر الجامعة والكلية التابعة لها بنقرة واحدة لتصفح المقررات الأكاديمية فوراً ربحاً للوقت.'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. DEDICATED QUICK-TEST CONSOLE (NO TYPING REQUIRED) */}
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950 via-stone-900 to-sky-950 text-white border border-sky-700/50 shadow-md shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-sky-400 fill-sky-400" />
              </div>
              <span className="text-xs font-black tracking-wide text-sky-300 uppercase">
                {lang === 'fr' ? 'Sélecteur de Test Rapide (Sans Saisie Manuelle)' : 'وحدة الاختبار السريع والتصفح المباشر (دون كتابة الاسم)'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700">
              {lang === 'fr' ? '12 Universités · Toutes les facultés rattachées' : '12 جامعة وطنية · جميع المؤسسات التابعة'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            {/* Step 1: University Dropdown */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-sky-400" />
                <span>{lang === 'fr' ? '1. Choisir l\'Université :' : '1. اختر الجامعة المغربية:'}</span>
              </label>
              <select
                value={selectedUnivCode}
                onChange={(e) => handleSelectUniversity(e.target.value)}
                className="w-full p-2.5 bg-stone-900/90 border border-sky-600/60 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-semibold"
              >
                {UNIVERSITIES_DATABASE.map((u) => (
                  <option key={u.code} value={u.code} className="bg-stone-900 text-white">
                    {u.code} - {lang === 'ar' ? u.nameAr : u.nameFr} ({u.city.split('-')[0].trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Affiliated Faculty Dropdown */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-sky-200 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>{lang === 'fr' ? '2. Faculté Affiliée :' : '2. الكلية أو المعهد التابع:'}</span>
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full p-2.5 bg-stone-900/90 border border-sky-600/60 rounded-xl text-xs text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-medium"
              >
                {currentUniv.faculties.map((fac, idx) => (
                  <option key={idx} value={fac} className="bg-stone-900 text-white">
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Fast Test Launch Button */}
            <div className="sm:col-span-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleLaunchQuickTest}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title={lang === 'fr' ? 'Tester et voir les cours de cette faculté' : 'تطبيق واختبار مقررات هذه الكلية فوراً'}
              >
                <Zap className="w-3.5 h-3.5 fill-stone-950" />
                <span>{lang === 'fr' ? 'Tester Direct' : 'اختبار فوري'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySelectedInfo}
                className="p-2.5 bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                title={lang === 'fr' ? 'Copier le nom complet' : 'نسخ اسم الكلية والجامعة'}
              >
                {copiedText ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-stone-400" />
                )}
              </button>
            </div>
          </div>

          {copiedText && (
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Nom copié dans le presse-papier ! Vous pouvez le coller dans n\'importe quel champ.' : 'تم نسخ اسم المؤسسة والكلية بنجاح!'}</span>
            </div>
          )}
        </div>

        {/* Search and Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'fr'
                  ? 'Rechercher une université, une ville, une faculté ou une filière...'
                  : 'ابحث عن جامعة، كلية، مدينة، أو تخصص...'
              }
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl shrink-0">
            <button
              onClick={() => setSelectedTab('universities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'universities'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {lang === 'fr' ? `${UNIVERSITIES_DATABASE.length} Universités & Facultés` : `الجامعات والكليات (${UNIVERSITIES_DATABASE.length})`}
            </button>
            <button
              onClick={() => setSelectedTab('specialties')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'specialties'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {lang === 'fr' ? 'Toutes les Spécialités' : 'جميع التخصصات والشعب'}
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {selectedTab === 'universities' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredUniversities.map((u) => (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-sky-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                            {u.code}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">📍 {u.city}</span>
                        </div>
                        <h3 className="font-extrabold text-stone-900 text-sm mt-1">
                          {lang === 'ar' ? u.nameAr : u.nameFr}
                        </h3>
                      </div>
                    </div>

                    {/* Affiliated Faculties - Every faculty is an interactive 1-click test button */}
                    <div className="mt-3 pt-3 border-t border-stone-200/80">
                      <div className="text-[11px] font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-stone-500" />
                          <span>{lang === 'fr' ? 'Facultés & Établissements Rattachés :' : 'الكليات والمعاهد التابعة لها (انقر للاختبار):'}</span>
                        </span>
                        <span className="text-[10px] text-sky-700 font-semibold">
                          {u.faculties.length} {lang === 'fr' ? 'établissements' : 'مؤسسة'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {u.faculties.map((fac, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              onClose();
                              onFilterAndGoToCatalog(fac, undefined, u.nameFr);
                            }}
                            className="text-[10px] bg-white hover:bg-sky-50 border border-stone-200 hover:border-sky-400 text-stone-700 hover:text-sky-900 px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-1 shadow-2xs group/btn"
                            title={lang === 'fr' ? `Tester les cours de ${fac}` : `اضغط لاختبار مقررات ${fac} مباشرة`}
                          >
                            <span>{fac}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-stone-400 group-hover/btn:text-sky-600 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onClose();
                        onFilterAndGoToCatalog(undefined, undefined, u.nameFr);
                      }}
                      className="text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lang === 'fr' ? `Voir tous les cours de l'${u.code}` : `تصفح كل مقررات ${u.code}`}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenProfessorRegister) onOpenProfessorRegister();
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {lang === 'fr' ? '+ S\'inscrire en tant que prof' : '+ تسجيل كأستاذ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Cycle Filter */}
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
                {['all', 'Licence', 'Master', 'Ingénieur', 'Médecine'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCycle(c)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCycle === c
                        ? 'bg-sky-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {c === 'all' ? (lang === 'fr' ? 'Tous les Cycles' : 'جميع الأسلاك') : c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSpecialties.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-sky-400 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                          {sp.facultyCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                          {sp.cycle}
                        </span>
                        {sp.isCustom && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{lang === 'fr' ? 'Ajoutée par Enseignant' : 'مضافة من طرف الأستاذ'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-stone-900">
                        {lang === 'ar' ? sp.nameAr : sp.nameFr}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onFilterAndGoToCatalog(undefined, undefined, sp.nameFr);
                      }}
                      className="p-2 text-stone-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors"
                      title="Chercher des cours pour cette filière"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Callout */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>
              {lang === 'fr'
                ? 'Base officielle intégrée · 12 Universités publiques du Royaume du Maroc'
                : 'قاعدة البيانات الرسمية المدمجة · 12 جامعة وطنية رسمية بالمملكة المغربية'}
            </span>
          </div>

          {onOpenProfessorRegister && (
            <button
              onClick={() => {
                onClose();
                onOpenProfessorRegister();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black rounded-xl text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {lang === 'fr' ? 'Inscription Gratuite Enseignant (0 DH)' : 'تسجيل مجاني فوري للأستاذ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
