import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  EyeOff,
  CopyX,
  Printer,
  FileX,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StudentProfile } from '../types';

interface DRMInfoViewProps {
  student: StudentProfile;
  lang: 'fr' | 'ar';
}

export const DRMInfoView: React.FC<DRMInfoViewProps> = ({ student, lang }) => {
  const [testActive, setTestActive] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const triggerTest = (type: string) => {
    setTestActive(true);
    if (type === 'screenshot') {
      setTestMessage(
        lang === 'fr'
          ? 'Simulation Détection Capture d\'écran : L\'écran du livre s\'est immédiatement occulté et le presse-papier a été neutralisé.'
          : 'محاكاة كشف لقطة الشاشة: تم حجب المحتوى على الفور ومسح الحافظة لحماية الوثيقة.'
      );
    } else if (type === 'print') {
      setTestMessage(
        lang === 'fr'
          ? 'Simulation Tentative d\'Impression (Ctrl+P) : Les flux CSS @media print masquent à 100% l\'intégralité des éléments.'
          : 'محاكاة محاولة الطباعة (Ctrl+P): يتم إفراغ الصفحة كلياً ومنع إصدار أي ملف PDF.'
      );
    } else if (type === 'copy') {
      setTestMessage(
        lang === 'fr'
          ? 'Simulation Copier/Coller : Sélection du texte désactivée au niveau CSS & JavaScript.'
          : 'محاكاة محاولة نسخ النصوص: تم تعطيل خاصية التحديد والنسخ بنجاح.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Introduction */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'fr' ? 'Architecture DRM Propriétaire' : 'نظام الحماية الرقمية الصارم'}</span>
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-4">
          {lang === 'fr'
            ? 'Comment FAC en PDF protège les œuvres universitaires'
            : 'كيف تحمي منصة FAC en PDF الكتب والمقررات الجامعية من القرصنة'}
        </h2>
        <p className="text-base text-stone-600 leading-relaxed">
          {lang === 'fr'
            ? 'Notre plateforme a été spécialement conçue pour répondre aux inquiétudes légitimes des professeurs et éditeurs universitaires : l\'impossibilité absolue d\'extraire un fichier PDF brut, combinée à une détection active des captures d\'écran.'
            : 'تم تصميم المنصة لحل إشكالية القرصنة الجامعية: استحالة تحميل ملف PDF بصيغته الخام، واستحالة استنساخه أو تصويره دون ترك أثر تتبعي قانوني للمستخدم.'}
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Pillar 1 */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center mb-4 border border-amber-200">
            <FileX className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-2">
            {lang === 'fr' ? '1. Aucun Fichier PDF Téléchargeable' : '1. انعدام الروابط وملفات PDF القابلة للتحميل'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {lang === 'fr'
              ? 'L\'application ne sert aucun fichier PDF direct ni lien statique. Les pages sont rendues dynamiquement dans un conteneur d\'exécution sécurisé (Canvas & Vector Shield), empêchant les gestionnaires de téléchargement (IDM, etc.) d\'intercepter le document.'
              : 'لا يتم إرسال ملفات PDF مباشرة، بل تتم معالجة الصفحات برمجياً على Canvas مشفر ومحمي، مما يمنع برامج التحميل التلقائي مثل IDM من الاستيلاء على المحاضرة.'}
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-4 border border-emerald-200">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-2">
            {lang === 'fr' ? '2. Bouclier Anti-Capture d\'Écran' : '2. حجب تلقائي عند تشغيل أدوات تصوير الشاشة'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {lang === 'fr'
              ? 'Dès qu\'un outil de capture (Outil Capture Windows, Snipping Tool, raccourcis PrintScreen ou Cmd+Shift+4) est invoqué, le lecteur détecte la perte de focus et occulte instantanément la vue par un filtre d\'occultation opaque.'
              : 'بمجرد محاولة تصوير الشاشة أو تفعيل أدوات القص (Snipping Tool) يتم حجب الصفحة بضبابية تامة ومسح الذاكرة العشوائية للحافظة فوراً.'}
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center mb-4 border border-sky-200">
            <Fingerprint className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-2">
            {lang === 'fr' ? '3. Filigrane Forensique Invisible & Mobile' : '3. علامة مائية تتبعية متحركة ومستمرة'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {lang === 'fr'
              ? 'Chaque session de lecture projette un filigrane contenant le nom de l\'étudiant, son numéro d\'immatriculation, son adresse e-mail institutionnelle et son adresse IP. Même une photo prise avec un smartphone portable permet de tracer la source de la fuite.'
              : 'تطبع كل صفحة خوارزمياً بعلامة مائية رقمية متحركة تضم الرقم الجامعي للطالب، بريده الإلكتروني وعنوان IP الخاص به، مما يجعل تصوير الهاتف كاشفاً لمصدر التسريب.'}
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center mb-4 border border-rose-200">
            <CopyX className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-2">
            {lang === 'fr' ? '4. Verrouillage du Presse-Papier & Impression' : '4. تعطيل الطباعة والنسخ كلياً'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {lang === 'fr'
              ? 'L\'action d\'impression matérielle ou virtuelle (Imprimer en PDF) est neutralisée par des règles CSS destructives @media print. La sélection et la copie de texte sont bloquées pour protéger la propriété intellectuelle.'
              : 'قواعد الطباعة الافتراضية تعطي صفحات بيضاء فارغة تماماً، كما تم إيقاف قائمة الزر الأيمن واختصارات النسخ السريع.'}
          </p>
        </div>
      </div>

      {/* Interactive Simulation Lab */}
      <div className="p-6 sm:p-8 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Laboratoire de Test & Démonstration' : 'مختبر تجربة واختبار الحماية'}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {lang === 'fr' ? 'Testez la Réactivité du Bouclier' : 'جرّب استجابة درع الأمان التلقائي'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mb-6">
          {lang === 'fr'
            ? 'Cliquez sur l\'une des simulations pour observer comment notre moteur réagit en temps réel face aux tentatives d\'extraction de documents :'
            : 'اختر إحدى المحاكيات لمعاينة رد الفعل الفوري لنظام الحماية الأكاديمي:'}
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => triggerTest('screenshot')}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <EyeOff className="w-4 h-4 text-amber-400" />
            <span>{lang === 'fr' ? 'Tester Tentative Capture' : 'محاكاة تصوير الشاشة'}</span>
          </button>

          <button
            onClick={() => triggerTest('print')}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'fr' ? 'Tester Tentative Impression' : 'محاكاة محاولة الطباعة'}</span>
          </button>

          <button
            onClick={() => triggerTest('copy')}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          >
            <CopyX className="w-4 h-4 text-rose-400" />
            <span>{lang === 'fr' ? 'Tester Tentative Copie' : 'محاكاة نسخ النصوص'}</span>
          </button>
        </div>

        {testActive && testMessage && (
          <div className="p-4 bg-stone-800/90 border border-stone-700 rounded-xl flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-white mb-1">
                {lang === 'fr' ? 'Protection Déclenchée avec Succès' : 'تم تفعيل إجراء الحماية بنجاح'}
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{testMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
