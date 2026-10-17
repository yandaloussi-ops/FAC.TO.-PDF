import React from 'react';
import { Search, ShieldAlert, Sparkles, BookOpenCheck, GraduationCap, BookOpen } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: 'fr' | 'ar';
  onExploreClick: () => void;
  onSecurityClick: () => void;
  onOpenUserGuide?: (target?: 'guide_student' | 'guide_professor' | 'terms_contract') => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  lang,
  onExploreClick,
  onSecurityClick,
  onOpenUserGuide,
}) => {
  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-12 md:py-20 border-b border-stone-800">
      {/* Background imagery with subtle dark scrim */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="/src/assets/images/fac_library_hero_1791375887505.jpg"
          alt="Amphithéâtre et bibliothèque universitaire"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300 mb-3 tracking-wide uppercase">
            <span>{lang === 'fr' ? 'Plateforme Académique Officielle' : 'المنصة الجامعية الرسمية'}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'fr' ? 'Licence Sécurisée Anti-Piratage' : 'حماية مشددة ضد التسريب'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance mb-4">
            {lang === 'fr'
              ? 'Lisez vos cours universitaires en toute sécurité, directement in-app'
              : 'اقرأ مقرراتك ومحاضراتك الجامعية بأمان فائق، حصرياً داخل التطبيق'}
          </h1>

          {/* فقرة شرح التطبيق وإلى جانبها زر دليل ومرشد استعمال التطبيق للأستاذ والطالب */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-stone-950/70 border border-stone-800 backdrop-blur-sm mb-8">
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-xl">
              {lang === 'fr'
                ? 'Plateforme académique marocaine unifiée dédiée à la consultation in-app protégée des polycopiés et manuels universitaires. Les étudiants s\'inscrivent pour bénéficier de la tarification préférentielle subventionnée avec lecture interactive sécurisée, tandis que les enseignants-chercheurs bénéficient d\'une protection totale de leurs œuvres et de leurs droits académiques.'
                : 'المنصة الأكاديمية المغربية الموحدة للمطالعة التفاعلية المحمية للمحاضرات والمقررات الجامعية داخل التطبيق. يسجل الطلبة للاستفادة من الأثمنة التفضيلية المدعومة المخصصة للطلبة والمذاكرة الآمنة، مع ضمان الحماية الفكرية التامة للأساتذة الباحثين وحفظ حقوق التأليف.'}
            </p>

            {/* زر دليل ومرشد استعمال التطبيق للأستاذ والطالب */}
            {onOpenUserGuide && (
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenUserGuide('guide_student')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300/50"
                  title={lang === 'fr' ? 'Consulter le guide pratique de l\'étudiant' : 'مرشد استعمال الطالب'}
                >
                  <GraduationCap className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'fr' ? 'Guide Étudiant' : 'مرشد الطالب'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenUserGuide('guide_professor')}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title={lang === 'fr' ? 'Consulter le guide pratique de l\'enseignant' : 'مرشد استعمال الأستاذ'}
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'fr' ? 'Guide Enseignant' : 'مرشد الأستاذ'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Rechercher un module, professeur, code cours...'
                    : 'ابحث عن مادة، اسم الأستاذ، أو الكلية...'
                }
                className="w-full pl-11 pr-4 py-3 bg-stone-800/90 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === 'fr' ? 'Explorer les cours' : 'تصفح المقررات'}
            </button>
          </div>

          {/* Trust markers adhering to claim-to-proof adjacency */}
          <div className="mt-8 pt-6 border-t border-stone-800 flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'fr' ? 'Anti-Capture & Anti-Impression' : 'منع تام للقطات الشاشة والطباعة'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lang === 'fr' ? 'Filigrane d\'identité crypté' : 'علامة مائية متحركة بهوية الطالب'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-sky-400" />
              <span>{lang === 'fr' ? 'Lecture interactive avec surlignage' : 'قراءة تفاعلية مع تدوين الملاحظات'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
