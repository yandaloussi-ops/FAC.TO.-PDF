/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  X,
  Compass,
  Lock,
  Receipt,
  Download,
  AlertTriangle,
  Building2,
  HelpCircle,
  Eye,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { PLATFORM_GMAIL } from '../utils/storage';

interface UserGuideAndTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'guide_student' | 'guide_professor' | 'terms_contract' | 'cndp_privacy';
  lang: 'fr' | 'ar';
}

export const UserGuideAndTermsModal: React.FC<UserGuideAndTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'guide_student',
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'guide_student' | 'guide_professor' | 'terms_contract' | 'cndp_privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 to-stone-850 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">
                  {lang === 'fr'
                    ? 'Guide d\'Utilisation & Contrat d\'Adhésion'
                    : 'دليل ومرشد استعمال التطبيق · عقد الاستعمال وحماية المعطيات'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  FAC en PDF Officiel
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {lang === 'fr'
                  ? 'Guide complet pour l\'Étudiant et l\'Enseignant · Conditions Générales d\'Utilisation & Charte CNDP'
                  : 'دليل إرشادي شامل للطالب والأستاذ · شروط الاستخدام المعتمدة وحماية البيانات الشخصية'}
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

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('guide_student')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide_student'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'fr' ? '1. Guide de l\'Étudiant' : '1. دليل ومرشد الطالب'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide_professor')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide_professor'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'fr' ? '2. Guide de l\'Enseignant' : '2. دليل ومرشد الأستاذ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms_contract')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'terms_contract'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'fr' ? '3. Contrat d\'Utilisation Général' : '3. عقد الاستعمال والشروط العامة'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cndp_privacy')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cndp_privacy'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'fr' ? '4. Protection des Données (CNDP)' : '4. ميثاق حماية المعطيات الشخصية'}</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-stone-800 text-sm leading-relaxed">
          {/* TAB 1: GUIDE DE L'ETUDIANT */}
          {activeTab === 'guide_student' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">
                    {lang === 'fr' ? 'Guide Pratique pour l\'Étudiant Universitaire' : 'المرشد التوجيهي الشامل للطالب الجامعي'}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Tout ce que vous devez savoir pour rechercher vos cours, acquérir une licence et lire en mode sécurisé.'
                      : 'كل ما تحتاج معرفته للتسجيل، واقتناء المقررات الدراسية، وقراءتها بكل أمان داخل المنصة.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">1</span>
                    <span>{lang === 'fr' ? 'Inscription & Code Secret (PIN)' : 'التسجيل وتحديد القن السري (PIN)'}</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Remplissez le formulaire "Espace Étudiant" avec vos coordonnées réelles (Nom, Massar, Université, Faculté) et choisissez un code secret de 4 chiffres ou plus. Ce code protège votre bibliothèque et vous permet de récupérer votre compte en cas d\'oubli.'
                      : 'قم بتعبئة استمارة "فضاء الطالب" بالمعلومات الحقيقية (الاسم، رقم مسار، الجامعة، الكلية) واختر قناً سرياً من 4 خانات على الأقل. يحفظ هذا القن مكتبتك الخاصة ويتيح لك الدخول إليها واسترجاعها.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">2</span>
                    <span>{lang === 'fr' ? 'Consultation & Recherche de Cours' : 'البحث عن المقررات وتصفح الكتالوج'}</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Accédez au catalogue depuis la page d\'accueil ou la barre de recherche. Vous pouvez filtrer par établissement (FSJES, FST, Faculté de Médecine, etc.) et par semestre (S1 à S6, Master). Chaque cours propose un extrait gratuit des premières pages.'
                      : 'تصفح قائمة الكتب والمطبوعات عبر محرك البحث السريع أو تصنيفات الكليات والسداسيات (من S1 إلى S6 والماستر). يتيح لك كل كتاب معاينة عينة مجانية من الصفحات الأولى للاطلاع على المحتوى.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">3</span>
                    <span>{lang === 'fr' ? 'Acquisition & Paiement via Agence Cash' : 'اقتناء المقرر بالتعريفة التفضيلية والإيداع بالوكالة'}</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Cliquez sur la couverture du livre ou le bouton "Acquérir". L\'acquisition se fait en espèces via le réseau d\'agences partenaires (Wafacash, Cash Plus, Barid Cash). Le montant est versé directement sur le compte officiel de l\'application FAC en PDF, sans frais cachés.'
                      : 'انقر على صورة غلاف المقرر أو زر الاقتناء بالتعريفة التفضيلية. يتم الأداء نقداً عبر شبكات وكالات تحويل الأموال والقرب (وفاكاش، كاش بلوس، بريد كاش). يتم الإيداع مباشرة في حساب التطبيق بالوكالة.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">4</span>
                    <span>{lang === 'fr' ? 'Lecture In-App Sécurisée' : 'المطالعة داخل القارئ المشفر'}</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Après activation, le polycopié est disponible dans votre "Profil Étudiant". La lecture s\'effectue exclusivement in-app avec mode nuit, zoom, prise de notes, sans aucun risque de perte de document.'
                      : 'بمجرد تفعيل الكتاب يظهر فوراً في مكتبتك الخاصة بـ "بروفايل الطالب". تتم المطالعة الحصرية داخل القارئ الرقمي مع ميزات تكبير الخط، والوضع الليلي، وتدوين الملاحظات التفاعلية.'}
                  </p>
                </div>
              </div>

              {/* Anti-fraud note */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-950">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>{lang === 'fr' ? 'Règle stricte anti-piratage :' : 'تنبيه أمني بخصوص حماية المحتوى :'}</strong>{' '}
                  {lang === 'fr'
                    ? 'Le téléchargement de fichiers PDF bruts, l\'impression ou les captures d\'écran sont formellement bloqués. La licence est rattachée strictement à votre compte étudiant nominatif.'
                    : 'يمنع منعاً كلياً تحميل ملفات PDF أو تصوير الشاشات أو محاولة إعادة نشر المقررات. كل رخصة مرتبطة حصرياً بحساب الطالب المستفيد.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDE DE L'ENSEIGNANT */}
          {activeTab === 'guide_professor' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">
                    {lang === 'fr' ? 'Guide Pratique pour l\'Enseignant & Chercheur' : 'المرشد التوجيهي للأستاذ الجامعي والمؤلف'}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Comment publier vos polycopiés, protéger votre propriété intellectuelle et percevoir vos droits d\'auteur.'
                      : 'كيفية نشر مقرراتك، وضمان حمايتها الرقمية الشاملة، وتحصيل مستحقات حقوق التأليف.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? '1. Inscription Gratuite à Vie (0 DH)' : '1. انخراط وتسجيل مجاني مدى الحياة'}</span>
                  </h5>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'L\'adhésion à l\'espace Enseignants est 100% gratuite. Renseignez votre identité, votre établissement de rattachement, votre e-mail professionnel et votre RIB bancaire (toutes les banques marocaines sont prises en charge).'
                      : 'الانخراط في فضاء الأساتذة مجاني تماماً وبدون أي رسوم. أدخل معلوماتك الأكاديمية وبريدك الإلكتروني ورقم حسابك البنكي RIB (كافة الأبناك المغربية معتمدة بما فيها التجاري وفا بنك، البنك الشعبي، مصرف المغرب، البريد بنك، CIH، وغيرها).'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? '2. Déposer et Publier vos Polycopiés' : '2. رفع ونشر المطبوعات والمقررات'}</span>
                  </h5>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Dans votre tableau de bord Enseignant, cliquez sur "Déposer un livre". Vous pouvez charger une image de couverture personnalisée (qui s\'affiche dans la bibliothèque et sert de lien pour diriger les étudiants vers l\'inscription et le tarif préférentiel) ou laisser le système générer automatiquement une couverture universitaire élégante.'
                      : 'من خلال لوحة تحكم الأستاذ، اضغط على "إضافة عنوان جديد". يمكنك رفع صورة غلاف مخصصة للكتاب (تتحول إلى رابط لتوجيه الطلبة لمطبوع التسجيل والاستفادة من التعريفة التفضيلية ثم تفعيل المقرر) أو اعتماد التصميم الأكاديمي التلقائي.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? '3. Protection DRM & Sauvegarde des Droits' : '3. حماية الملكية الفكرية وصلاحيات الحذف'}</span>
                  </h5>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Chaque document déposé est chiffré. Les étudiants ne peuvent ni l\'extraire ni le photocopier sans licence. L\'ajout de livres est ouvert à l\'enseignant, tandis que la suppression définitive est centralisée auprès de l\'administration pour garantir la pérennité des accès délivrés.'
                      : 'يتم تشفير المحتوى وحمايته بنظام DRM مائي يحمل اسم الطالب القارئ. إضافة الكتب مخولة للأستاذ، في حين أن حذف المقررات محصور في الإدارة فقط لضمان استقرار تراخيص الطلبة الذين اقتنوا المحتوى.'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <h5 className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'fr' ? '4. Suivi des Inscriptions & Virement des Droits d\'Auteur' : '4. متابعة الاشتراكات وتحويل مستحقات حقوق التأليف'}</span>
                  </h5>
                  <p className="text-xs text-stone-600">
                    {lang === 'fr'
                      ? 'Consultez en temps réel le nombre d\'étudiants ayant souscrit à votre polycopié et le montant de vos droits d\'auteur. Vous pouvez demander un virement bancaire vers votre compte à tout moment depuis votre profil.'
                      : 'تابع لحظياً في لوحة تحكمك عدد الطلبة المشتركين في مقررك ومجموع مستحقاتك من حقوق التأليف الأكاديمية، مع إمكانية طلب صرف وتحويل المستحقات إلى حسابك البنكي بضغطة زر واحدة.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTRAT D'UTILISATION GENERAL */}
          {activeTab === 'terms_contract' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-stone-150 rounded-2xl border border-stone-300">
                <div className="flex items-center gap-2 font-black text-stone-900 text-base mb-1">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>{lang === 'fr' ? 'Contrat d\'Adhésion & Conditions Générales d\'Utilisation (CGU)' : 'عقد استعمال التطبيق والشروط العامة للانخراط'}</span>
                </div>
                <p className="text-xs text-stone-600">
                  {lang === 'fr'
                    ? 'Ce contrat régit l\'accès et l\'utilisation de la plateforme numérique FAC en PDF par les étudiants, les enseignants et les visiteurs.'
                    : 'ينظم هذا العقد شروط استخدام منصة FAC en PDF وحقوق والتزامات الطلبة والأساتذة وإدارة المنصة.'}
                </p>
              </div>

              <div className="space-y-4 text-xs text-stone-700">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">{lang === 'fr' ? 'Article 1 : Objet de la Plateforme' : 'المادة 1 : موضوع المنصة وغايتها'}</h5>
                  <p>
                    {lang === 'fr'
                      ? 'FAC en PDF est une infrastructure universitaire sécurisée permettant la consultation in-app de polycopiés académiques. La plateforme n\'est pas un service d\'hébergement de fichiers téléchargeables bruts.'
                      : 'منصة FAC en PDF هي بنية رقمية جامعية مخصصة للمطالعة التفاعلية الآمنة للكتب والمطبوعات الأكاديمية داخل التطبيق حصراً، وليست خدمة لمشاركة أو تحميل ملفات PDF الخام.'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">{lang === 'fr' ? 'Article 2 : Nature de la Licence Étudiant' : 'المادة 2 : طبيعة ترخيص القراءة الممنوح للطالب'}</h5>
                  <p>
                    {lang === 'fr'
                      ? 'L\'acquisition d\'un polycopié confère à l\'étudiant une licence d\'accès personnelle, non exclusive et incessible. Tout partage de compte, capture d\'écran ou tentative de contournement du chiffrement DRM entraîne la suspension immédiate du compte.'
                      : 'اقتناء أي مقرر يمنح الطالب ترخيص قراءة شخصياً، فردياً وغير قابل للتفويت. يمنع تقاسم الحساب أو تصوير الشاشة، وأي محاولة للقرصنة تؤدي إلى تعليق الحساب فوراً بقرار من الإدارة.'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">{lang === 'fr' ? 'Article 3 : Encaissement & Compte de l\'Application' : 'المادة 3 : التحصيل المالي وحساب التطبيق بالوكالة'}</h5>
                  <p>
                    {lang === 'fr'
                      ? 'Les paiements sont gérés exclusivement par la régie centrale de l\'application FAC en PDF. Le versement en agences de proximité (Wafacash, Cash Plus, etc.) s\'effectue directement sur le compte professionnel de l\'application dès son ouverture imminente.'
                      : 'تتم كافة عمليات التحصيل لحساب الإدارة المركزي للمنصة. يتم دفع المستحقات نقداً عبر وكالات تحويل الأموال مباشرة في حساب التطبيق المعتمد، ولا يتم تسليم أي مبالغ خارج هذه القنوات المعتمدة.'}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-1">{lang === 'fr' ? 'Article 4 : Droits des Enseignants & Suppression des Titres' : 'المادة 4 : حقوق الأساتذة وضوابط حذف المقررات'}</h5>
                  <p>
                    {lang === 'fr'
                      ? 'Les enseignants conservent l\'entière paternité morale de leurs écrits. Afin de protéger les droits des étudiants ayant préalablement acquis une licence, la suppression définitive d\'un ouvrage relève de la compétence exclusive de l\'administration de la plateforme.'
                      : 'يحتفظ الأستاذ بكامل حقوقه المعنوية على مؤلفاته. وحفاظاً على حقوق الطلبة الذين حصلوا على تراخيص قراءة سارية، فإن حذف أي مقرر نهائياً محصور حصراً في إدارة المنصة بعد التنسيق الأكاديمي.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROTECTION DES DONNEES (CNDP) */}
          {activeTab === 'cndp_privacy' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300">
                <div className="flex items-center gap-2 font-black text-emerald-950 text-base mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>{lang === 'fr' ? 'Engagement CNDP & Protection de la Vie Privée (Loi n° 09-08)' : 'ميثاق حماية المعطيات الشخصية والامتثال لقانون CNDP 09-08'}</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {lang === 'fr'
                    ? 'Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel, vos informations sont strictement protégées.'
                    : 'امتثالاً لمقتضيات القانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي الصادر عن اللجنة الوطنية CNDP.'}
                </p>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{lang === 'fr' ? 'Finalité du Traitement :' : 'الغاية من جمع البيانات :'}</strong>{' '}
                    {lang === 'fr'
                      ? 'Les données recueillies (Nom, identifiant étudiant ou matricule enseignant, e-mail, téléphone, établissement) sont utilisées exclusivement pour la délivrance des licences DRM nominatives et la gestion administrative interne.'
                      : 'تستخدم المعطيات المجمعة (الاسم، رقم مسار أو رقم التأجير، البريد، الهاتف، الكلية) حصرياً لربط رخص القراءة بأصحابها وإدارة الحسابات الأكاديمية.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{lang === 'fr' ? 'Absence de cession à des tiers :' : 'عدم تفويت المعطيات لأي جهة تجارية :'}</strong>{' '}
                    {lang === 'fr'
                      ? 'Vos données ne sont ni vendues, ni partagées avec des régies publicitaires. Elles restent cantonnées à l\'environnement sécurisé de FAC en PDF.'
                      : 'لا يتم بيع أو مقاسمة أو تفويت معطيات الطلبة أو الأساتذة لأي جهات تجارية أو إشهارية خارجية تحت أي ظرف.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{lang === 'fr' ? 'Droit d\'accès et de rectification :' : 'حقوق الولوج والتصحيح والحذف :'}</strong>{' '}
                    {lang === 'fr'
                      ? `Conformément à la loi 09-08, vous pouvez exercer votre droit d'accès, de modification ou de suppression de vos données en contactant : ${PLATFORM_GMAIL}`
                      : `يحق لكل منخرط ممارسة حقه في الولوج والتصحيح والتعديل وحذف بياناته بالتواصل المباشر مع إدارة المنصة عبر البريد: ${PLATFORM_GMAIL}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-500 font-mono">
            {lang === 'fr' ? 'Régie Officielle · fac.en.pdf.maroc@gmail.com' : 'إدارة التطبيق الرسمية · fac.en.pdf.maroc@gmail.com'}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            {lang === 'fr' ? 'Fermer le Guide' : 'إغلاق الدليل'}
          </button>
        </div>
      </div>
    </div>
  );
};
