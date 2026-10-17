import React, { useState, useMemo } from 'react';
import {
  Book,
  FacultyNews,
  ProfessorNotice,
  StudentProfile,
  Professor,
} from '../types';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Bell,
  Newspaper,
  EyeOff,
  FileX,
  Search,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Scale,
  TrendingUp,
  Cpu,
  Activity,
  Scroll,
  X,
  Lock,
  Compass,
  ChevronRight,
  BookMarked,
  Filter,
  Building2,
} from 'lucide-react';
import { BookCard } from './BookCard';

interface HomePageProps {
  books: Book[];
  facultyNews: FacultyNews[];
  professorNotices: ProfessorNotice[];
  student: StudentProfile;
  professors: Professor[];
  onNavigateTab: (tab: 'home' | 'catalog' | 'library' | 'drm-info' | 'admin') => void;
  onFilterAndGoToCatalog: (faculty?: string, semester?: string, search?: string) => void;
  onOpenProfessorPortal: () => void;
  onOpenProfessorRegister?: () => void;
  onOpenUniversitiesModal?: () => void;
  onOpenStudentAuth?: () => void;
  onOpenAdmin?: () => void;
  isAdminAuthenticated?: boolean;
  onOpenDataProtectionModal?: () => void;
  authenticatedProfessor?: Professor | null;
  onOpenBookDetails: (book: Book) => void;
  onOpenBookReader: (book: Book) => void;
  onOpenVisitorCatalog?: () => void;
  onOpenUserGuide?: (target?: 'guide_student' | 'guide_professor' | 'terms_contract') => void;
  lang: 'fr' | 'ar';
}

// 3-Step Cascade Data for Moroccan Higher Education: Faculty -> Specialty -> Modules
const CASCADE_FACULTIES_DATA = [
  {
    id: 'droit',
    code: 'FSJP',
    labelFr: 'Sciences Juridiques & Politiques (FSJP)',
    labelAr: 'العلوم القانونية والسياسية (FSJP - كليات الحقوق)',
    icon: Scale,
    colorClass: 'amber',
    specialties: [
      {
        id: 'droit-ar',
        labelFr: 'Droit Privé en Arabe (القانون الخاص باللغة العربية)',
        labelAr: 'القانون الخاص باللغة العربية',
        modules: [
          // S1
          { nameFr: 'Introduction aux Sciences Juridiques', nameAr: 'المدخل للعلوم القانونية ونظرية الحق', semester: 'S1' },
          { nameFr: 'Introduction à la Charia Islamique', nameAr: 'المدخل لدراسة الشريعة الإسلامية', semester: 'S1' },
          { nameFr: 'Droit Constitutionnel & Régimes Politiques', nameAr: 'القانون الدستوري والأنظمة السياسية', semester: 'S1' },
          { nameFr: 'Introduction aux Relations Internationales', nameAr: 'المدخل للعلاقات الدولية والمنظمات', semester: 'S1' },
          { nameFr: 'Introduction à l\'Économie & Gestion', nameAr: 'مدخل للعلوم الاقتصادية والتدبير', semester: 'S1' },
          { nameFr: 'Méthodes des Sciences Juridiques & Sociales', nameAr: 'مناهج العلوم القانونية والاجتماعية', semester: 'S1' },
          { nameFr: 'Langues & Terminologie Juridique I', nameAr: 'اللغات والمصطلحات القانونية 1', semester: 'S1' },
          // S2
          { nameFr: 'Théorie Générale des Obligations', nameAr: 'النظرية العامة للالتزامات والعقود', semester: 'S2' },
          { nameFr: 'Droit Commercial Fondamental & Commerçant', nameAr: 'القانون التجاري الأساسي ونظرية التاجر', semester: 'S2' },
          { nameFr: 'Droit Pénal Général', nameAr: 'القانون الجنائي العام والجريمة والعقاب', semester: 'S2' },
          { nameFr: 'Organisation Administrative Marocaine', nameAr: 'التنظيم الإداري والنشاط الإداري', semester: 'S2' },
          { nameFr: 'Théorie Générale du Droit Constitutionnel', nameAr: 'النظرية العامة للقانون الدستوري', semester: 'S2' },
          { nameFr: 'Droit International Public', nameAr: 'القانون الدولي العام', semester: 'S2' },
          { nameFr: 'Langues & Terminologie Juridique II', nameAr: 'اللغات والمصطلحات القانونية 2', semester: 'S2' },
          // S3
          { nameFr: 'Responsabilité Civile Délictuelle & Contractuelle', nameAr: 'المسؤولية المدنية (العقدية والتقصيرية)', semester: 'S3' },
          { nameFr: 'Droit de la Famille & Statut Personnel', nameAr: 'قانون الأسرة والمواريث (الزواج والطلاق)', semester: 'S3' },
          { nameFr: 'Action Administrative & Police Administrative', nameAr: 'النشاط الإداري والقرارات والصفقات الإدارية', semester: 'S3' },
          { nameFr: 'Droit du Travail & Protection Sociale', nameAr: 'قانون الشغل والضمان الاجتماعي', semester: 'S3' },
          { nameFr: 'Régimes Constitutionnels Comparés', nameAr: 'الأنظمة الدستورية المقارنة الكبرى', semester: 'S3' },
          { nameFr: 'Finances Publiques & Droit Budgétaire', nameAr: 'المالية العامة وقانون الميزانية والجبايات', semester: 'S3' },
          // S4
          { nameFr: 'Contrats Spéciaux : Vente, Bail & Mandat', nameAr: 'العقود الخاصة المسمّاة (البيع والكراء)', semester: 'S4' },
          { nameFr: 'Droit des Sociétés Commerciales', nameAr: 'قانون الشركات التجارية والشركات المساهمة', semester: 'S4' },
          { nameFr: 'Droit Pénal Spécial & Crimes Économiques', nameAr: 'القانون الجنائي الخاص وجرائم الأموال والأشخاص', semester: 'S4' },
          { nameFr: 'Organisation Judiciaire du Royaume', nameAr: 'التنظيم القضائي للمملكة المغربية', semester: 'S4' },
          { nameFr: 'Droits de l\'Homme & Libertés Publiques', nameAr: 'حقوق الإنسان والحريات العامة', semester: 'S4' },
          { nameFr: 'Instruments de Paiement & de Crédit', nameAr: 'وسائل الأداء والائتمان والأوراق التجارية', semester: 'S4' },
          // S5
          { nameFr: 'Procédure Civile & Règles de Compétence', nameAr: 'قانون المسطرة المدنية وقواعد الاختصاص والدعوى', semester: 'S5' },
          { nameFr: 'Difficultés de l\'Entreprise & Prévention', nameAr: 'صعوبات المقاولة ومساطر التسوية والإنقاذ', semester: 'S5' },
          { nameFr: 'Droit Bancaire & Contrats de Crédit', nameAr: 'القانون البنكي والعمليات المصرفية', semester: 'S5' },
          { nameFr: 'Droits Réels & Immatriculation Foncière', nameAr: 'الحقوق العينية والتحفيظ العقاري بالمغرب', semester: 'S5' },
          { nameFr: 'Droit International Privé (Nationalité)', nameAr: 'القانون الدولي الخاص (الجنسية والوضعية وتنازع القوانين)', semester: 'S5' },
          { nameFr: 'Criminologie & Politique Criminelle', nameAr: 'علم الإجرام وعلم العقاب والسياسة الجنائية', semester: 'S5' },
          // S6
          { nameFr: 'Procédure Pénale & Enquêtes Judiciaires', nameAr: 'قانون المسطرة الجنائية والتحقيق الجنائي والمحاكمة', semester: 'S6' },
          { nameFr: 'Droit Immobilier, Copropriété & Notariat', nameAr: 'القانون العقاري والملكية المشتركة والتوثيق', semester: 'S6' },
          { nameFr: 'Voies d\'Exécution Forcée & Saisies', nameAr: 'طرق التنفيذ الجبري والحجوز القضائية', semester: 'S6' },
          { nameFr: 'Droit des Assurances & Responsabilité', nameAr: 'قانون التأمين وعقود الضمان والتعويض', semester: 'S6' },
          { nameFr: 'Successions, Testaments & Droits Civils', nameAr: 'المواريث والوصايا والأنصبة الشرعية', semester: 'S6' },
          { nameFr: 'Projet de Fin d\'Études / PFE de Licence', nameAr: 'مشروع نهاية الدراسة وبحث الإجازة في القانون', semester: 'S6' },
        ],
      },
      {
        id: 'droit-fr',
        labelFr: 'Droit Privé (Section Française)',
        labelAr: 'القانون الخاص بالفرنسية',
        modules: [
          // S1
          { nameFr: 'Introduction au Droit & Droit Civil', nameAr: 'المدخل للقانون المدني ونظرية الحق', semester: 'S1' },
          { nameFr: 'Droit Constitutionnel & Institutions', nameAr: 'القانون الدستوري والمؤسسات السياسية', semester: 'S1' },
          { nameFr: 'Histoire des Idées Politiques', nameAr: 'تاريخ الفكر والمؤسسات السياسية', semester: 'S1' },
          { nameFr: 'Relations Internationales', nameAr: 'العلاقات الدولية والتنظيم الدولي', semester: 'S1' },
          { nameFr: 'Introduction à l\'Économie Générale', nameAr: 'المدخل للاقتصاد العام والتدبير', semester: 'S1' },
          { nameFr: 'Méthodologie Juridique & Terminologie', nameAr: 'المنهجية والمصطلحات القانونية بالفرنسية', semester: 'S1' },
          // S2
          { nameFr: 'Théorie Générale des Obligations & Contrats', nameAr: 'النظرية العامة للالتزامات والعقود', semester: 'S2' },
          { nameFr: 'Droit Commercial : Le Commerçant & Fonds', nameAr: 'القانون التجاري الأساسي والأصل التجاري', semester: 'S2' },
          { nameFr: 'Droit Pénal Général', nameAr: 'القانون الجنائي العام والجريمة والعقاب', semester: 'S2' },
          { nameFr: 'Droit Administratif & Organisation', nameAr: 'القانون الإداري والتنظيم الإداري المغربي', semester: 'S2' },
          { nameFr: 'Droit International Public', nameAr: 'القانون الدولي العام وحقوق الدول', semester: 'S2' },
          { nameFr: 'Langues Appliquées & Anglais Juridique', nameAr: 'اللغات الحية والإنجليزية القانونية', semester: 'S2' },
          // S3
          { nameFr: 'Responsabilité Civile Contractuelle & Délictuelle', nameAr: 'المسؤولية المدنية العقدية والتقصيرية', semester: 'S3' },
          { nameFr: 'Droit de la Famille & Statut Personnel', nameAr: 'قانون الأسرة والأحوال الشخصية', semester: 'S3' },
          { nameFr: 'Action Administrative & Contrats Publics', nameAr: 'النشاط الإداري والعقود والصفقات العمومية', semester: 'S3' },
          { nameFr: 'Droit du Travail & Sécurité Sociale', nameAr: 'قانون الشغل والعلاقات المهنية والضمان', semester: 'S3' },
          { nameFr: 'Finances Publiques & Fiscalité', nameAr: 'المالية العامة والقانون الضريبي المغربي', semester: 'S3' },
          { nameFr: 'Régimes Politiques Comparés', nameAr: 'الأنظمة السياسية المقارنة الكبرى', semester: 'S3' },
          // S4
          { nameFr: 'Contrats Spéciaux : Vente, Bail & Entreprise', nameAr: 'العقود الخاصة : البيع والكراء والمقاولة', semester: 'S4' },
          { nameFr: 'Droit des Sociétés Commerciales', nameAr: 'قانون الشركات التجارية المغربي', semester: 'S4' },
          { nameFr: 'Droit Pénal Spécial des Affaires', nameAr: 'القانون الجنائي الخاص وقانون الأعمال', semester: 'S4' },
          { nameFr: 'Organisation Judiciaire du Maroc', nameAr: 'التنظيم القضائي للمملكة المغربية', semester: 'S4' },
          { nameFr: 'Droits Fondamentaux & Libertés', nameAr: 'الحقوق الأساسية والحريات العامة', semester: 'S4' },
          { nameFr: 'Instruments de Paiement & de Crédit', nameAr: 'الأوراق التجارية ووسائل الأداء والائتمان', semester: 'S4' },
          // S5
          { nameFr: 'Procédure Civile & Voies de Recours', nameAr: 'قانون المسطرة المدنية وطرق الطعن', semester: 'S5' },
          { nameFr: 'Droit des Difficultés de l\'Entreprise', nameAr: 'صعوبات المقاولة ومساطر الوقاية والتسوية', semester: 'S5' },
          { nameFr: 'Droit Bancaire & Marchés Financiers', nameAr: 'القانون البنكي والأسواق المالية المغربية', semester: 'S5' },
          { nameFr: 'Droits Réels & Droit Foncier Marocain', nameAr: 'الحقوق العينية والتشريع العقاري والتحفيظ', semester: 'S5' },
          { nameFr: 'Droit International Privé', nameAr: 'القانون الدولي الخاص والجنسية', semester: 'S5' },
          { nameFr: 'Criminologie & Sociologie Pénale', nameAr: 'علم الإجرام والسوسيولوجيا الجنائية', semester: 'S5' },
          // S6
          { nameFr: 'Procédure Pénale & Instruction', nameAr: 'المسطرة الجنائية وإجراءات التحقيق والمحاكمة', semester: 'S6' },
          { nameFr: 'Droit des Assurances', nameAr: 'قانون التأمين والتعويض عن حوادث السير', semester: 'S6' },
          { nameFr: 'Voies d\'Exécution & Saisies Judiciaires', nameAr: 'طرق التنفيذ القضائي والحجوز العقارية والمنقولة', semester: 'S6' },
          { nameFr: 'Droit Foncier & Notariat', nameAr: 'التشريع العقاري والتوثيق والملكية المشتركة', semester: 'S6' },
          { nameFr: 'Droit de la Propriété Intellectuelle', nameAr: 'الملكية الصناعية والفكرية وحقوق المؤلف', semester: 'S6' },
          { nameFr: 'Projet de Fin d\'Études (PFE)', nameAr: 'مشروع نهاية التخرج وبحث الإجازة', semester: 'S6' },
        ],
      },
      {
        id: 'droit-pub',
        labelFr: 'Droit Public & Sciences Politiques',
        labelAr: 'القانون العام والعلوم السياسية',
        modules: [
          // S1
          { nameFr: 'Théorie Générale de l\'État & Pouvoir', nameAr: 'النظرية العامة للدولة والسلطة السياسية', semester: 'S1' },
          { nameFr: 'Introduction aux Sciences Juridiques', nameAr: 'المدخل للعلوم القانونية والدستورية', semester: 'S1' },
          { nameFr: 'Histoire des Idées Politiques', nameAr: 'تاريخ الفكر السياسي الكلاسيكي والحديث', semester: 'S1' },
          { nameFr: 'Relations Internationales & Géopolitique', nameAr: 'العلاقات الدولية والموازين الإقليمية', semester: 'S1' },
          { nameFr: 'Introduction à l\'Économie Politique', nameAr: 'المدخل للاقتصاد السياسي والتنمية', semester: 'S1' },
          { nameFr: 'Méthodes des Sciences Politiques', nameAr: 'مناهج العلوم السياسية والاجتماعية', semester: 'S1' },
          // S2
          { nameFr: 'Droit Constitutionnel Marocain', nameAr: 'القانون الدستوري والمؤسسات الدستورية بالمغرب', semester: 'S2' },
          { nameFr: 'Organisation Administrative & Territoriale', nameAr: 'التنظيم الإداري والترابي واللامركزية', semester: 'S2' },
          { nameFr: 'Droit International Public & Traités', nameAr: 'القانون الدولي العام والمعاهدات الدولية', semester: 'S2' },
          { nameFr: 'Sociologie Politique & Acteurs', nameAr: 'علم الاجتماع السياسي والأحزاب والنقابات', semester: 'S2' },
          { nameFr: 'Théories des Relations Internationales', nameAr: 'نظريات العلاقات الدولية وتحليل النزاعات', semester: 'S2' },
          // S3
          { nameFr: 'Action Administrative & Marchés Publics', nameAr: 'النشاط الإداري والصفقات والمرافق العمومية', semester: 'S3' },
          { nameFr: 'Finances Publiques & Budget de l\'État', nameAr: 'المالية العامة والتدبير الميزانياتي للدولة', semester: 'S3' },
          { nameFr: 'Organisations Internationales & ONU', nameAr: 'المنظمات الدولية ومؤسسات الأمم المتحدة', semester: 'S3' },
          { nameFr: 'Régimes Constitutionnels Comparés', nameAr: 'الأنظمة الدستورية المقارنة والبرلمانية', semester: 'S3' },
          { nameFr: 'Géopolitique du Monde Arabe & Méditerranée', nameAr: 'الجيوسياسة الإقليمية وحوض المتوسط', semester: 'S3' },
          { nameFr: 'Droit de la Fonction Publique', nameAr: 'قانون الوظيفة العمومية والتدبير الإداري', semester: 'S3' },
          // S4
          { nameFr: 'Contentieux Administratif Marocain', nameAr: 'القضاء الإداري ودعوى الإلغاء والتعويض', semester: 'S4' },
          { nameFr: 'Politiques Publiques Sectorielles', nameAr: 'السياسات العمومية القطاعية بالمغرب', semester: 'S4' },
          { nameFr: 'Droit International Économique', nameAr: 'القانون الدولي الاقتصادي ومنظمة التجارة', semester: 'S4' },
          { nameFr: 'Droit de l\'Environnement & Climat', nameAr: 'قانون البيئة والتنمية المستدامة والانتقال الطاقي', semester: 'S4' },
          { nameFr: 'Communication Politique & Médias', nameAr: 'التواصل السياسي والرأي العام وصناعة القرار', semester: 'S4' },
          // S5
          { nameFr: 'Droit Administratif des Biens & Expropriation', nameAr: 'الأموال العامة ونزع الملكية للمنفعة العامة', semester: 'S5' },
          { nameFr: 'Analyse & Évaluation des Politiques Publiques', nameAr: 'تحليل وتقييم السياسات العمومية والحكامة', semester: 'S5' },
          { nameFr: 'Droit International Humanitaire', nameAr: 'القانون الدولي الإنساني وقانون النزاعات المسلحة', semester: 'S5' },
          { nameFr: 'Gouvernance Publique & Lutte Anti-Corruption', nameAr: 'الحكامة والشفافية وتخليق الحياة العامة', semester: 'S5' },
          { nameFr: 'Systèmes Électoraux & Démocratie', nameAr: 'الأنظمة الانتخابية والسلوك الانتخابي والمشاركة', semester: 'S5' },
          // S6
          { nameFr: 'Régionalisation Avancée & Gestion Locale', nameAr: 'الجهوية المتقدمة والتدبير الترابي والحكامة المحلية', semester: 'S6' },
          { nameFr: 'Droit Diplomatique & Consulaire', nameAr: 'القانون الدبلوماسي والقنصلي والحصانات', semester: 'S6' },
          { nameFr: 'Finances & Fiscalité Locales', nameAr: 'الجبايات المحلية والمالية الترابية للجماعات', semester: 'S6' },
          { nameFr: 'Sécurité Internationale & Stratégies', nameAr: 'استراتيجيات الأمن والدفاع والتعاون الدولي', semester: 'S6' },
          { nameFr: 'Mémoire de Fin d\'Études / PFE Droit Public', nameAr: 'مشروع التخرج وبحث الإجازة في القانون العام', semester: 'S6' },
        ],
      },
    ],
  },
  {
    id: 'economie',
    code: 'FSEG / ENCG',
    labelFr: 'Économie & Gestion (FSEG / ENCG)',
    labelAr: 'العلوم الاقتصادية والتدبير (FSEG / ENCG)',
    icon: TrendingUp,
    colorClass: 'emerald',
    specialties: [
      {
        id: 'seg',
        labelFr: 'Sciences Éco & Gestion (Tronc Commun SEG)',
        labelAr: 'العلوم الاقتصادية والتدبير (الجذع المشترك)',
        modules: [
          // S1
          { nameFr: 'Introduction à l\'Économie & Pensée Éco', nameAr: 'مدخل للاقتصاد العام وتاريخ الوقائع الاقتصادية', semester: 'S1' },
          { nameFr: 'Microéconomie I : Consommateur & Producteur', nameAr: 'الاقتصاد الجزئي 1 (سلوك المستهلك والمنتج)', semester: 'S1' },
          { nameFr: 'Comptabilité Générale I : Principes & Bilan', nameAr: 'المحاسبة العامة 1 (الميزانية، حساب النتائج، القيود)', semester: 'S1' },
          { nameFr: 'Analyse Mathématique Appliquée', nameAr: 'التحليل الرياضي والجبر المطبق على الاقتصاد', semester: 'S1' },
          { nameFr: 'Introduction au Management des Organisations', nameAr: 'مدخل للتدبير وإدارة المقاولات والمنظمات', semester: 'S1' },
          { nameFr: 'Langues & Terminologie Économique I', nameAr: 'اللغات والمصطلحات الاقتصادية 1', semester: 'S1' },
          // S2
          { nameFr: 'Macroéconomie I : Agrégats & Équilibre Global', nameAr: 'الاقتصاد الكلي 1 (الحسابات القومية والتوازن الشامل)', semester: 'S2' },
          { nameFr: 'Comptabilité Générale II : Inventaire & Régul.', nameAr: 'المحاسبة العامة 2 (أعمال نهاية السنة، الاهتلاكات، المؤونات)', semester: 'S2' },
          { nameFr: 'Statistique Descriptive & Probabilités', nameAr: 'الإحصاء الوصفي ونظرية الاحتمالات', semester: 'S2' },
          { nameFr: 'Théorie des Organisations & Structures', nameAr: 'نظرية المنظمات وهياكل المقاولة الحديثة', semester: 'S2' },
          { nameFr: 'Droit Commercial & des Affaires', nameAr: 'القانون التجاري وقانون الأعمال للمقاولين', semester: 'S2' },
          { nameFr: 'Techniques d\'Expression & Communication', nameAr: 'تقنيات التعبير والتواصل المهني', semester: 'S2' },
          // S3
          { nameFr: 'Économie Monétaire & Financière I', nameAr: 'الاقتصاد النقدي والمالي 1 (الكتلة النقدية والبنك المركزي)', semester: 'S3' },
          { nameFr: 'Microéconomie II : Marchés & Concurrence', nameAr: 'الاقتصاد الجزئي 2 (هياكل الأسواق والاحتكار والمنافسة)', semester: 'S3' },
          { nameFr: 'Comptabilité Analytique d\'Exploitation', nameAr: 'المحاسبة التحليلية للتسيير وتكلفة المنتجات', semester: 'S3' },
          { nameFr: 'Statistique Inférentielle & Échantillonnage', nameAr: 'الإحصاء الاستدلالي والمعاينة واختبار الفرضيات', semester: 'S3' },
          { nameFr: 'Marketing Fondamental & Comportement', nameAr: 'التسويق الأساسي ودراسة سلوك المستهلك', semester: 'S3' },
          { nameFr: 'Informatique Appliquée à la Gestion', nameAr: 'المعلوميات وتطبيقات المجدول الإحصائي في التدبير', semester: 'S3' },
          // S4
          { nameFr: 'Macroéconomie II : Modèles IS-LM & Politiques', nameAr: 'الاقتصاد الكلي 2 (نموذج IS-LM والسياسات الاقتصادية)', semester: 'S4' },
          { nameFr: 'Finances Publiques & Fiscalité d\'Entreprise', nameAr: 'المالية العامة والنظام الجبائي المغربي', semester: 'S4' },
          { nameFr: 'Analyse et Diagnostic Financier', nameAr: 'التحليل المالي وتوازن المقاولة ومؤشرات السيولة', semester: 'S4' },
          { nameFr: 'Économétrie Fondamentale & Régression', nameAr: 'الاقتصاد القياسي وتحليل الانحدار الخطي', semester: 'S4' },
          { nameFr: 'Gestion des Ressources Humaines (GRH)', nameAr: 'تدبير الموارد البشرية وإدارة الكفاءات', semester: 'S4' },
          { nameFr: 'Droit Social & Relations du Travail', nameAr: 'القانون الاجتماعي والعلاقات المهنية', semester: 'S4' },
          // S5
          { nameFr: 'Croissance & Développement Économique', nameAr: 'النمو الاقتصادي ونظريات التنمية والتنمية المستدامة', semester: 'S5' },
          { nameFr: 'Commerce International & Mondialisation', nameAr: 'التجارة الدولية والسياسات التجارية وسلاسل القيمة', semester: 'S5' },
          { nameFr: 'Économie Industrielle & Stratégie Sectorielle', nameAr: 'الاقتصاد الصناعي والمنافسة والابتكار', semester: 'S5' },
          { nameFr: 'Évaluation des Projets d\'Investissement', nameAr: 'تقييم واختيار المشاريع الاستثمارية وتمويلها', semester: 'S5' },
          { nameFr: 'Séries Temporelles & Prévision Économique', nameAr: 'السلاسل الزمنية والتنبؤ الاقتصادي القياسي', semester: 'S5' },
          // S6
          { nameFr: 'Politiques Économiques Conjoncturelles', nameAr: 'السياسات الاقتصادية الهيكلية والظرفية بالمغرب', semester: 'S6' },
          { nameFr: 'Économie Numérique & Plateformes', nameAr: 'الاقتصاد الرقمي والمنصات الذكية واقتصاد المعرفة', semester: 'S6' },
          { nameFr: 'Économie Verte & Transition Énergétique', nameAr: 'الاقتصاد الأخضر والانتقال الطاقي والمناخ', semester: 'S6' },
          { nameFr: 'Gouvernance & Réformes Économiques au Maroc', nameAr: 'الحكامة والنموذج التنموي الجديد بالمغرب', semester: 'S6' },
          { nameFr: 'Projet de Fin d\'Études / PFE en Économie', nameAr: 'مشروع نهاية الدراسة وبحث الإجازة في الاقتصاد', semester: 'S6' },
        ],
      },
      {
        id: 'gfc',
        labelFr: 'Gestion Financière & Comptable (GFC)',
        labelAr: 'التسيير المالي والمحاسباتي والتدقيق',
        modules: [
          // S4
          { nameFr: 'Analyse Financière & Diagnostic du Bilan', nameAr: 'التحليل المالي المعمق والميزانية الوظيفية', semester: 'S4' },
          { nameFr: 'Mathématiques Financières & Actuariat', nameAr: 'الرياضيات المالية وحساب الفوائد والقروض', semester: 'S4' },
          { nameFr: 'Gestion de Trésorerie à Court Terme', nameAr: 'تدبير الخزينة والسيولة النقدية والائتمان البنكي', semester: 'S4' },
          // S5
          { nameFr: 'Audit Comptable & Légal des Comptes', nameAr: 'التدقيق المحاسبي ومراقبة الحسابات القانونية', semester: 'S5' },
          { nameFr: 'Contrôle de Gestion & Gestion Budgétaire', nameAr: 'مراقبة التسيير وإعداد الميزانيات التقديرية', semester: 'S5' },
          { nameFr: 'Fiscalité Approfondie : IS, TVA & IR', nameAr: 'الجباية المعمقة للشركات (الضريبة على الشركات والقيمة المضافة)', semester: 'S5' },
          { nameFr: 'Gestion de Portefeuille & Marchés de Capitaux', nameAr: 'إدارة المحافظ المالية وبورصة القيم بالدار البيضاء', semester: 'S5' },
          { nameFr: 'Gestion des Risques & Produits Dérivés', nameAr: 'إدارة المخاطر المالية ومخاطر الصرف والفائدة', semester: 'S5' },
          { nameFr: 'Droit Bancaire & Marchés Financiers', nameAr: 'التشريع البنكي والمالي وهيئة سوق الرساميل', semester: 'S5' },
          // S6
          { nameFr: 'Ingénierie Financière & Fusions-Acquisitions', nameAr: 'الهندسة المالية وعمليات الاندماج والاستحواذ', semester: 'S6' },
          { nameFr: 'Normes Comptables Internationales IFRS', nameAr: 'معايير المحاسبة الدولية IFRS والتوحيد القوائم', semester: 'S6' },
          { nameFr: 'Consolidation des Comptes de Groupes', nameAr: 'توحيد الحسابات المالية للمجموعات والشركات القابضة', semester: 'S6' },
          { nameFr: 'Gouvernance d\'Entreprise & RSE Financière', nameAr: 'حكامة المقاولات والمسؤولية الاجتماعية والبيئية', semester: 'S6' },
          { nameFr: 'Stage Pratique & Mémoire PFE en Finance', nameAr: 'التدريب المهني وبحث التخرج في التسيير المالي', semester: 'S6' },
        ],
      },
      {
        id: 'mgt',
        labelFr: 'Management & Commerce International (ENCG)',
        labelAr: 'التسويق والتجارة الدولية واللوجستيك',
        modules: [
          // S3
          { nameFr: 'Marketing Stratégique & Opérationnel', nameAr: 'التسويق الاستراتيجي والتشغيلي وتحليل السوق', semester: 'S3' },
          { nameFr: 'Techniques de Vente & Négociation', nameAr: 'تقنيات البيع والتفاوض التجاري المتقدم', semester: 'S3' },
          { nameFr: 'Gestion des Opérations & Qualité', nameAr: 'إدارة العمليات وضمان الجودة الشاملة', semester: 'S3' },
          // S4
          { nameFr: 'Gestion des Ressources Humaines & Talents', nameAr: 'تدبير الموارد البشرية وإدارة الكفاءات والتحفيز', semester: 'S4' },
          { nameFr: 'Études de Marché & Comportement d\'Achat', nameAr: 'بحوث التسويق وسبر آراء المستهلكين', semester: 'S4' },
          { nameFr: 'Droit du Commerce International', nameAr: 'قانون التجارة الدولية والعقود العابرة للحدود', semester: 'S4' },
          // S5
          { nameFr: 'Marketing Digital & E-Commerce Omnicanal', nameAr: 'التسويق الرقمي والتجارة الإلكترونية وشبكات التواصل', semester: 'S5' },
          { nameFr: 'Supply Chain & Logistique Internationale', nameAr: 'سلاسل التوريد واللوجستيك الدولي والنقل البحري والجوي', semester: 'S5' },
          { nameFr: 'Financement du Commerce International & Douanes', nameAr: 'الاعتمادات المستندية وتقنيات الجمارك والتخليص', semester: 'S5' },
          { nameFr: 'Management de Projet & Conduite du Changement', nameAr: 'تدبير المشاريع وإدارة التغيير الاستراتيجي', semester: 'S5' },
          // S6
          { nameFr: 'Stratégie d\'Entreprise & Compétitivité Mondiale', nameAr: 'استراتيجية المقاولة والتنافسية في الأسواق العالمية', semester: 'S6' },
          { nameFr: 'Entrepreneuriat & Création de Startups', nameAr: 'ريادة الأعمال وإنشاء الشركات الناشئة وحاضنات الأعمال', semester: 'S6' },
          { nameFr: 'Communication Globale & Relations Publiques', nameAr: 'التواصل المؤسساتي والعلاقات العامة وبناء العلامة', semester: 'S6' },
          { nameFr: 'Stage Professionnel & Mémoire PFE en Management', nameAr: 'التدريب الميداني ومشروع التخرج في التدبير', semester: 'S6' },
        ],
      },
    ],
  },
  {
    id: 'lettres',
    code: 'FLSH',
    labelFr: 'Lettres & Sciences Humaines (FLSH)',
    labelAr: 'الآداب والعلوم الإنسانية (FLSH)',
    icon: BookOpen,
    colorClass: 'purple',
    specialties: [
      {
        id: 'arabe',
        labelFr: 'الدراسات العربية وآدابها (Langue & Littérature Arabe)',
        labelAr: 'الدراسات العربية وآدابها واللسانيات',
        modules: [
          // S1
          { nameFr: 'Introduction à la Linguistique Générale', nameAr: 'مدخل إلى اللسانيات العامة', semester: 'S1' },
          { nameFr: 'Syntaxe Arabe I : La Phrase Nominale', nameAr: 'النحو العربي 1 (الجملة الاسمية ونواسخها)', semester: 'S1' },
          { nameFr: 'Littérature Pré-Islamique (Al Jahiliyya)', nameAr: 'الأدب الجاهلي ونصوصه وقضاياه', semester: 'S1' },
          { nameFr: 'Métrique & Prosodie Poétique (Al \'Arud)', nameAr: 'علم العروض والقافية والموسيقى الشعرية', semester: 'S1' },
          { nameFr: 'Rhétorique Arabe : Science d\'Al Bayan', nameAr: 'البلاغة العربية (علم البيان : التشبيه والاستعارة والكناية)', semester: 'S1' },
          { nameFr: 'Introduction à la Philosophie & Méthodes', nameAr: 'مدخل إلى الفلسفة العامة ومناهج البحث الأدبي', semester: 'S1' },
          // S2
          { nameFr: 'Syntaxe Arabe II : La Phrase Verbale', nameAr: 'النحو العربي 2 (الجملة الفعلية والمفاعيل والمنصوبات)', semester: 'S2' },
          { nameFr: 'Littérature Islamique & Omeyyade', nameAr: 'الأدب الإسلامي والأموي وتطور الأغراض الشعرية', semester: 'S2' },
          { nameFr: 'Morphologie Arabe & Phonétique Appliquée', nameAr: 'علم الصرف الصوتي والتركيبي والاشتقاق', semester: 'S2' },
          { nameFr: 'Rhétorique Arabe : Al Ma\'ani & Al Badi\'', nameAr: 'البلاغة العربية (علم المعاني وعلم البديع المحسنات)', semester: 'S2' },
          { nameFr: 'Lexicographie Arabe & Histoire du Dictionnaire', nameAr: 'المعاجم العربية وصناعة المعجم وعلم الدلالة', semester: 'S2' },
          { nameFr: 'Critique Littéraire Ancienne', nameAr: 'النقد الأدبي القديم عند ابن سلام والآمدي والجرجاني', semester: 'S2' },
          // S3
          { nameFr: 'Syntaxe Fonctionnelle & Théorie du Facteur', nameAr: 'النحو الوظيفي والتطبيقي ونظرية العامل', semester: 'S3' },
          { nameFr: 'Littérature Abbasside : Poésie & Prose', nameAr: 'الأدب العباسي : قضايا التجديد عند أبي تمام والمتنبي', semester: 'S3' },
          { nameFr: 'Philologie & Histoire de la Langue Arabe', nameAr: 'فقه اللغة وأصول المعجم العربي والتعريب والاشتقاق', semester: 'S3' },
          { nameFr: 'Littérature Andalouse & Marocaine Ancienne', nameAr: 'الأدب الأندلسي والمغربي (الموشحات والأزجال والمقامات)', semester: 'S3' },
          { nameFr: 'Critique Littéraire Moderne & Mouvements', nameAr: 'النقد الأدبي الحديث والمناهج السياقية والنصية', semester: 'S3' },
          { nameFr: 'Linguistique Structurale & Descriptive', nameAr: 'اللسانيات الوصفية والبنيوية وتطبيقاتها على العربية', semester: 'S3' },
          // S4
          { nameFr: 'Narratologie Arabe : Contes & Maqamat', nameAr: 'السرد العربي القديم (المقامات، ألف ليلة وليلة، الحكايات)', semester: 'S4' },
          { nameFr: 'Linguistique Générative & Transformationnelle', nameAr: 'اللسانيات التوليدية والتحويلية وتحليل التراكيب', semester: 'S4' },
          { nameFr: 'Littérature Maghrébine d\'Expression Arabe', nameAr: 'الأدب المغاربي المعاصر وقضايا الهوية والتحديث', semester: 'S4' },
          { nameFr: 'Pragmatique & Théories de l\'Énonciation', nameAr: 'التداوليات ونظريات التلفظ وأفعال الكلام', semester: 'S4' },
          { nameFr: 'Codicologie & Édition des Manuscrits', nameAr: 'تحقيق المخطوطات ونشر النصوص التراثية المغربية', semester: 'S4' },
          { nameFr: 'Poésie de la Renaissance (Al Nahda)', nameAr: 'شعر عصر النهضة وحركة الإحياء والبعث', semester: 'S4' },
          // S5
          { nameFr: 'Linguistique Textuelle & Analyse du Discours', nameAr: 'اللسانيات النصية وتحليل الخطاب والتماسك والانسجام', semester: 'S5' },
          { nameFr: 'Roman & Nouvelle Arabes Contemporains', nameAr: 'الرواية والقصة العربية المعاصرة والتحولات البنيوية', semester: 'S5' },
          { nameFr: 'Poésie Contemporaine & Vers Libre', nameAr: 'الشعر العربي المعاصر (شعر التفعيلة وقصيدة النثر)', semester: 'S5' },
          { nameFr: 'Littérature Comparée & Théories de Traduction', nameAr: 'الأدب المقارن ونظريات الترجمة والتفاعل الثقافي', semester: 'S5' },
          { nameFr: 'Traditions Orales & Patrimoine Populaire', nameAr: 'الأدب الشفهي والتراث الثقافي اللامادي المغربي', semester: 'S5' },
          // S6
          { nameFr: 'Méthodologie de la Recherche Littéraire', nameAr: 'مناهج البحث الأدبي واللساني وكتابة الأطروحة', semester: 'S6' },
          { nameFr: 'Sémiotique Littéraire & Visuelle', nameAr: 'السيميائيات السردية والبصرية وتحليل العلامات', semester: 'S6' },
          { nameFr: 'Linguistique Informatique & Traitement Arabe', nameAr: 'اللسانيات الحاسوبية والمعالجة الآلية للغة العربية', semester: 'S6' },
          { nameFr: 'Pragmatique du Texte Sacré & Rhétorique', nameAr: 'تداوليات الخطاب القرآني وبلاغة الإعجاز البياني', semester: 'S6' },
          { nameFr: 'Mémoire de Recherche de Licence / PFE', nameAr: 'مشروع نهاية الدراسة وبحث الإجازة في الدراسات العربية', semester: 'S6' },
        ],
      },
      {
        id: 'fr-lit',
        labelFr: 'Études Françaises (الدراسات الفرنسية)',
        labelAr: 'الدراسات الفرنسية والأدب المقارن',
        modules: [
          // S1
          { nameFr: 'Initiation aux Genres Littéraires', nameAr: 'مدخل إلى الأجناس الأدبية (الشعر، المسرح، الرواية)', semester: 'S1' },
          { nameFr: 'Grammaire Fondamentale I', nameAr: 'قواعد اللغة الفرنسية الأساسية 1', semester: 'S1' },
          { nameFr: 'Phonétique & Phonologie du Français', nameAr: 'علم الأصوات والفونولوجيا في اللغة الفرنسية', semester: 'S1' },
          { nameFr: 'Histoire des Idées & des Arts', nameAr: 'تاريخ الأفكار والتيارات الفنية في فرنسا وأوروبا', semester: 'S1' },
          { nameFr: 'Méthodologie du Travail Universitaire', nameAr: 'منهجية العمل الجامعي وتقنيات التعبير الكتابي', semester: 'S1' },
          // S2
          { nameFr: 'Littérature des XVIIe et XVIIIe Siècles', nameAr: 'أدب القرنين السابع عشر والثامن عشر (الكلاسيكية والأنوار)', semester: 'S2' },
          { nameFr: 'Grammaire Fondamentale II : Syntaxe', nameAr: 'قواعد اللغة الفرنسية 2 (التركيب والجملة المركبة)', semester: 'S2' },
          { nameFr: 'Lexicologie & Sémantique du Français', nameAr: 'علم المعاجم والدلالة وتطور الألفاظ', semester: 'S2' },
          { nameFr: 'Histoire Littéraire & Culturelle', nameAr: 'التاريخ الأدبي والثقافي للمجتمعات الفرانكوفونية', semester: 'S2' },
          { nameFr: 'Pratique de l\'Écrit & Commentaire Composé', nameAr: 'التحليل المنهجي للنصوص والتعليق الأدبي', semester: 'S2' },
          // S3
          { nameFr: 'Littérature du XIXe Siècle : Romantisme', nameAr: 'أدب القرن التاسع عشر (الرومانسية والواقعية والطبيعية)', semester: 'S3' },
          { nameFr: 'Morphosyntaxe Avancée du Français', nameAr: 'الصرف والتركيب المتقدم والوظائف النحوية', semester: 'S3' },
          { nameFr: 'Poétique & Théories du Texte Littéraire', nameAr: 'الشعرية ونظريات النص الأدبي المعاصر', semester: 'S3' },
          { nameFr: 'Littératures Francophones du Maghreb', nameAr: 'الأدب المغاربي المكتوب بالفرنسية وقضايا الهوية', semester: 'S3' },
          { nameFr: 'Traduction : Version & Thème', nameAr: 'تقنيات الترجمة والتعريب المتبادل بين الفرنسية والعربية', semester: 'S3' },
          // S4
          { nameFr: 'Littérature du XXe Siècle : Roman & Théâtre', nameAr: 'أدب القرن العشرين (الوجودية، العبث، الرواية الجديدة)', semester: 'S4' },
          { nameFr: 'Linguistique Générale & Énonciation', nameAr: 'اللسانيات العامة ونظريات التلفظ وسوسير وبنفينيست', semester: 'S4' },
          { nameFr: 'Littérature Comparée & Mythes', nameAr: 'الأدب المقارن ودراسة الأساطير والتناص', semester: 'S4' },
          { nameFr: 'Stylistique Française Appliquée', nameAr: 'الأسلوبية وتحليل الخصائص التعبيرية للنصوص', semester: 'S4' },
          { nameFr: 'Analyse de l\'Image & Médias', nameAr: 'تحليل الصورة والخطاب الإعلامي والإشهاري', semester: 'S4' },
          // S5
          { nameFr: 'Roman Moderne & Théories du Récit', nameAr: 'الرواية الحديثة ونظريات السرد جينيت وتودوروف', semester: 'S5' },
          { nameFr: 'Didactique du Français Langue Étrangère (FLE)', nameAr: 'ديداكتيك اللغة الفرنسية وطرائق تدريسها', semester: 'S5' },
          { nameFr: 'Pragmatique & Analyse du Discours', nameAr: 'التداوليات وتحليل الخطاب والجدل والحجاج', semester: 'S5' },
          { nameFr: 'Littératures Africaines Francophones', nameAr: 'الأدب الإفريقي الفرنكوفوني وحركة الزنوجة', semester: 'S5' },
          // S6
          { nameFr: 'Sémiotique Littéraire & Visuelle', nameAr: 'السيميائيات النصية والبصرية ومدرسة غريماس', semester: 'S6' },
          { nameFr: 'Critique Littéraire Contemporaine', nameAr: 'النقد الأدبي المعاصر وما بعد البنيوية والتفكيك', semester: 'S6' },
          { nameFr: 'Épistémologie des Sciences Humaines', nameAr: 'إبستيمولوجيا وفلسفة العلوم الإنسانية', semester: 'S6' },
          { nameFr: 'Mémoire de Fin d\'Études / PFE', nameAr: 'مشروع نهاية التخرج وبحث الإجازة في الدراسات الفرنسية', semester: 'S6' },
        ],
      },
      {
        id: 'anglais',
        labelFr: 'English Studies (الدراسات الإنجليزية)',
        labelAr: 'الدراسات الإنجليزية والترجمة',
        modules: [
          // S1
          { nameFr: 'Reading Comprehension & Precis Writing', nameAr: 'استيعاب المقروء والتلخيص الأكاديمي المتقدم', semester: 'S1' },
          { nameFr: 'Spoken English & Phonetics', nameAr: 'المحادثة والنطق والصوتيات الإنجليزية التأسيسية', semester: 'S1' },
          { nameFr: 'English Grammar in Context I', nameAr: 'قواعد اللغة الإنجليزية في السياق الوظيفي 1', semester: 'S1' },
          { nameFr: 'Guided Reading & Critical Thinking', nameAr: 'القراءة الموجهة وتنمية التفكير النقدي', semester: 'S1' },
          { nameFr: 'Study Skills & Academic Writing', nameAr: 'مهارات الدراسة الجامعية والكتابة الأكاديمية', semester: 'S1' },
          // S2
          { nameFr: 'Paragraph & Essay Writing', nameAr: 'كتابة الفقرة والمقال الأكاديمي الإنجليزي', semester: 'S2' },
          { nameFr: 'English Grammar in Context II', nameAr: 'قواعد اللغة الإنجليزية 2 والتركيب الصرفي', semester: 'S2' },
          { nameFr: 'Introduction to Literature : Poetry & Drama', nameAr: 'مدخل إلى الأدب الإنجليزي (الشعر والمسرح الكلاسيكي)', semester: 'S2' },
          { nameFr: 'Introduction to General Linguistics', nameAr: 'مدخل إلى علم اللسانيات واللغة البشرية', semester: 'S2' },
          { nameFr: 'Moroccan Culture & Society in English', nameAr: 'الثقافة والمجتمع المغربي في الأدبيات الإنجليزية', semester: 'S2' },
          // S3
          { nameFr: 'British Literature from Renaissance to Romantics', nameAr: 'الأدب البريطاني من عصر النهضة إلى الرومانسية', semester: 'S3' },
          { nameFr: 'Morphology & Syntax of English', nameAr: 'الصرف والتركيب النحوي في اللغة الإنجليزية', semester: 'S3' },
          { nameFr: 'Advanced Composition & Argumentation', nameAr: 'الإنشاء المتقدم والحِجاج والمناظرة الفكرية', semester: 'S3' },
          { nameFr: 'English-Arabic Translation Techniques', nameAr: 'تقنيات الترجمة بين الإنجليزية والعربية', semester: 'S3' },
          { nameFr: 'Introduction to Cultural Studies', nameAr: 'مدخل إلى الدراسات الثقافية ونظريات التمثيل', semester: 'S3' },
          // S4
          { nameFr: 'American Literature & Civilization', nameAr: 'الأدب والحضارة الأمريكية من التأسيس إلى الحداثة', semester: 'S4' },
          { nameFr: 'Phonology & Acoustic Phonetics', nameAr: 'علم الأصوات والفونولوجيا النطقية والفيزيائية', semester: 'S4' },
          { nameFr: 'Literary Theory & Criticism', nameAr: 'النظرية والنقد الأدبي والمدارس النقدية الكبرى', semester: 'S4' },
          { nameFr: 'Public Speaking & Debate Skills', nameAr: 'مهارات الخطابة والإلقاء والمناظرة أمام الجمهور', semester: 'S4' },
          { nameFr: 'Research Methodology in Humanities', nameAr: 'منهجية البحث العلمي والتوثيق الأكاديمي APA/MLA', semester: 'S4' },
          // S5
          { nameFr: 'Modern & Postmodern Literature', nameAr: 'الأدب الحديث وما بعد الحداثة في العالم الأنجلوفوني', semester: 'S5' },
          { nameFr: 'Semantics & Pragmatics of Discourse', nameAr: 'علم المعنى والدلالة والتداوليات اللغوية', semester: 'S5' },
          { nameFr: 'Postcolonial Literature & Global Voices', nameAr: 'أدب ما بعد الاستعمار والأصوات العالمية النامية', semester: 'S5' },
          { nameFr: 'Applied Linguistics & ELT Methodology', nameAr: 'اللسانيات التطبيقية وطرائق تدريس اللغة الإنجليزية', semester: 'S5' },
          { nameFr: 'Sociolinguistics & Language Varieties', nameAr: 'علم الاجتماع اللغوي والتنوع واللهجات الإنجليزية', semester: 'S5' },
          // S6
          { nameFr: 'Critical Discourse Analysis (CDA)', nameAr: 'تحليل الخطاب النقدي والأيديولوجيا والسلطة', semester: 'S6' },
          { nameFr: 'Media & Cultural Representation', nameAr: 'الإعلام والدراسات الثقافية والتمثيل البصري', semester: 'S6' },
          { nameFr: 'Translation Theories & Professional Practice', nameAr: 'نظريات الترجمة وممارستها المهنية التخصصية', semester: 'S6' },
          { nameFr: 'Capstone Monograph / BA Research Project', nameAr: 'مشروع التخرج وبحث الإجازة في الدراسات الإنجليزية', semester: 'S6' },
        ],
      },
      {
        id: 'histoire-geo',
        labelFr: 'التاريخ والحضارة والجغرافيا (Histoire & Géographie)',
        labelAr: 'التاريخ والحضارة والجغرافيا والتراث',
        modules: [
          // S1
          { nameFr: 'Histoire du Maroc Antique & Méditerranée', nameAr: 'تاريخ المغرب القديم وحضارات حوض المتوسط والممالك المورية', semester: 'S1' },
          { nameFr: 'Géographie Générale : Milieux & Climat', nameAr: 'الجغرافيا العامة والأسس الطبيعية لكوكب الأرض', semester: 'S1' },
          { nameFr: 'Histoire de l\'Orient Ancien & Mésopotamie', nameAr: 'تاريخ المشرق القديم وحضارات ما بين النهرين ومصر القديمة', semester: 'S1' },
          { nameFr: 'Archéologie & Vestiges Préhistoriques au Maroc', nameAr: 'علم الآثار والأركيولوجيا والمواقع التاريخية بالمغرب', semester: 'S1' },
          { nameFr: 'Méthodologie de la Recherche Historique', nameAr: 'مناهج البحث التاريخي ونقد الوثائق والمصادر', semester: 'S1' },
          // S2
          { nameFr: 'Histoire du Maroc Médiéval (Idrissides, Almoravides)', nameAr: 'تاريخ المغرب الوسيط (الأدارسة، المرابطون، الموحدون)', semester: 'S2' },
          { nameFr: 'Histoire de l\'Islam Ancien & Califat Omeyyade', nameAr: 'تاريخ صدر الإسلام والدولة الأموية والفتوحات', semester: 'S2' },
          { nameFr: 'Géographie Physique & Écosystèmes', nameAr: 'الجغرافيا الطبيعية والمناخ والهيدرولوجيا والتضاريس', semester: 'S2' },
          { nameFr: 'Histoire de l\'Europe Médiévale & Croisades', nameAr: 'تاريخ أوروبا في العصر الوسيط والعلاقات مع العالم الإسلامي', semester: 'S2' },
          // S3
          { nameFr: 'Histoire du Maroc Moderne (Mérinides, Saadiens)', nameAr: 'تاريخ المغرب الحديث (الدولة المرينية والسعدية والدولة العلوية)', semester: 'S3' },
          { nameFr: 'Histoire de l\'Empire Abbasside & Al-Andalus', nameAr: 'تاريخ الدولة العباسية والأندلس الإسلامية والحضارة المشتركة', semester: 'S3' },
          { nameFr: 'Géographie Humaine & Dynamiques Urbaines', nameAr: 'الجغرافيا البشرية والديموغرافيا والهجرة والتحضر', semester: 'S3' },
          { nameFr: 'Archives, Manuscrits & Calligraphie Marocaine', nameAr: 'الوثائق والمخطوطات والخط المغربي وقراءة الكناشات', semester: 'S3' },
          // S4
          { nameFr: 'Histoire du Maroc Contemporain & Résistance', nameAr: 'تاريخ المغرب المعاصر ومقاومة الاستعمار والاستقلال', semester: 'S4' },
          { nameFr: 'Empire Ottoman & Proche-Orient Moderne', nameAr: 'تاريخ الدولة العثمانية والعالم العربي في العصر الحديث', semester: 'S4' },
          { nameFr: 'Aménagement du Territoire & Régionalisation', nameAr: 'إعداد التراب الوطني والتنمية الترابية والجهوية', semester: 'S4' },
          { nameFr: 'Géographie Économique & Ressources Naturelles', nameAr: 'الجغرافيا الاقتصادية والإنتاج وسلاسل التوزيع والطاقة', semester: 'S4' },
          // S5
          { nameFr: 'Histoire du Temps Présent & État Indépendant', nameAr: 'تاريخ المغرب الراهن وبناء الدولة الوطنية الحديثة والمؤسسات', semester: 'S5' },
          { nameFr: 'Patrimoine Culturel Matériel & Immatériel', nameAr: 'التراث المعماري والثقافي المغربي وصيانته وتثمينه', semester: 'S5' },
          { nameFr: 'Systèmes d\'Information Géographique (SIG)', nameAr: 'نظم المعلومات الجغرافية والاستشعار عن بعد في التخطيط', semester: 'S5' },
          // S6
          { nameFr: 'Histoire des Relations Internationales du Maroc', nameAr: 'تاريخ العلاقات الدولية والدبلوماسية المغربية عبر العصور', semester: 'S6' },
          { nameFr: 'Changements Climatiques & Gestion de l\'Eau', nameAr: 'التغيرات المناخية وإدارة الموارد المائية والتصحر', semester: 'S6' },
          { nameFr: 'Management du Patrimoine & Tourisme Culturel', nameAr: 'تدبير التراث والمتاحف وصناعة السياحة الثقافية', semester: 'S6' },
          { nameFr: 'Mémoire de Recherche de Licence / PFE', nameAr: 'مشروع التخرج وبحث الإجازة في التاريخ أو الجغرافيا', semester: 'S6' },
        ],
      },
      {
        id: 'philo-socio',
        labelFr: 'الفلسفة وعلم الاجتماع (Philosophie & Sociologie)',
        labelAr: 'الفلسفة وعلم الاجتماع وعلم النفس',
        modules: [
          // S1
          { nameFr: 'Philosophie Grecque Antique & Présocratiques', nameAr: 'الفلسفة اليونانية القديمة وميلاد التفلسف (أفلاطون وأرسطو)', semester: 'S1' },
          { nameFr: 'Introduction à la Sociologie & Anthropologie', nameAr: 'مدخل إلى علم الاجتماع والأنثروبولوجيا الثقافية', semester: 'S1' },
          { nameFr: 'Logique Formelle & Théorie de la Connaissance', nameAr: 'المنطق الصوري القديم والحديث ونظرية المعرفة الإنسانية', semester: 'S1' },
          { nameFr: 'Histoire des Sciences & Grandes Pensées', nameAr: 'تاريخ العلوم والأفكار الإنسانية وتطور المنهج العلمي', semester: 'S1' },
          { nameFr: 'Méthodes de Recherche Sociale & Enquêtes', nameAr: 'مناهج البحث الاجتماعي وأدوات الملاحظة والتوثيق', semester: 'S1' },
          // S2
          { nameFr: 'Philosophie Islamique & Kalâm (Al-Farabi, Averroès)', nameAr: 'الفلسفة الإسلامية وعلم الكلام (الفارابي، ابن سينا، ابن رشد)', semester: 'S2' },
          { nameFr: 'Sociologie Rurale & Urbaine au Maroc', nameAr: 'السوسيولوجيا القروية والحضرية في المجتمع المغربي', semester: 'S2' },
          { nameFr: 'Philosophie Médiévale & Scolastique', nameAr: 'الفلسفة الوسيطية واللاتينية والتوفيق بين العقل والإيمان', semester: 'S2' },
          { nameFr: 'Grands Textes Philosophiques Traduits', nameAr: 'قراءة في أمهات النصوص الفلسفية العالمية المترجمة', semester: 'S2' },
          // S3
          { nameFr: 'Philosophie Moderne : Descartes, Spinoza & Kant', nameAr: 'الفلسفة الحديثة : العقلانية والتجريبية والنقدية الكانطية', semester: 'S3' },
          { nameFr: 'Théories Sociologiques Classiques (Durkheim, Weber)', nameAr: 'النظريات السوسيولوجية الكلاسيكية (دوركهايم، فيبر، ماركس)', semester: 'S3' },
          { nameFr: 'Épistémologie & Philosophie des Sciences', nameAr: 'الإبستيمولوجيا وفلسفة العلوم المعاصرة (بوبر، باشلار)', semester: 'S3' },
          { nameFr: 'Sociologie de la Famille & Parenté au Maroc', nameAr: 'سوسيولوجيا الأسرة والقرابة والتحولات القيمية بالمغرب', semester: 'S3' },
          // S4
          { nameFr: 'Philosophie Contemporaine : Phénoménologie', nameAr: 'الفلسفة المعاصرة (الفينومينولوجيا، الوجودية، الهرمينوطيقا)', semester: 'S4' },
          { nameFr: 'Méthodes de Recherche Empirique & Sondages', nameAr: 'تقنيات البحث الميداني والاستمارة والمقابلة المعمقة', semester: 'S4' },
          { nameFr: 'Philosophie Politique : Justice & Démocratie', nameAr: 'الفلسفة السياسية ونظرية العدالة والعقد الاجتماعي والدولة', semester: 'S4' },
          { nameFr: 'Sociologie de l\'Éducation & Jeunesse', nameAr: 'سوسيولوجيا التربية والشباب والمؤسسات التعليمية', semester: 'S4' },
          // S5
          { nameFr: 'Pensée Marocaine Contemporaine (Laroui, Jabri)', nameAr: 'الفكر المغربي المعاصر (عبد الله العروي، الجابري، سبيلا)', semester: 'S5' },
          { nameFr: 'Sociologie du Changement Social & Modernité', nameAr: 'سوسيولوجيا التغير الاجتماعي والتحديث والتنمية بالمغرب', semester: 'S5' },
          { nameFr: 'Philosophie du Langage & Herméneutique', nameAr: 'فلسفة اللغة والتأويليات المعاصرة وفتغنشتاين وريكور', semester: 'S5' },
          // S6
          { nameFr: 'Éthique Appliquée & Bioéthique Médicale', nameAr: 'الأخلاقيات التطبيقية والبيوإيتيقا والقضايا الحيوية الراهنة', semester: 'S6' },
          { nameFr: 'Sociologie des Migrations & Marché du Travail', nameAr: 'سوسيولوجيا الهجرة والاندماج وسوق الشغل والتهميش', semester: 'S6' },
          { nameFr: 'Questions d\'Identité, Altérité & Mondialisation', nameAr: 'قضايا الهوية والغيرية والكونية وحوار الثقافات', semester: 'S6' },
          { nameFr: 'Mémoire de Recherche de Licence / PFE', nameAr: 'مشروع التخرج والبحث الميداني في الفلسفة أو السوسيولوجيا', semester: 'S6' },
        ],
      },
    ],
  },
  {
    id: 'theologie',
    code: 'Oussoul Eddine',
    labelFr: 'Théologie & Oussoul Eddine (جامعة القرويين)',
    labelAr: 'أصول الدين والعلوم الشرعية (جامعة القرويين)',
    icon: Scroll,
    colorClass: 'emerald',
    specialties: [
      {
        id: 'oussoul-deen',
        labelFr: 'مسلك أصول الدين والفكر الإسلامي (Fondements de la Religion)',
        labelAr: 'أصول الدين والفكر الإسلامي المعاصر',
        modules: [
          // S1
          { nameFr: 'Introduction aux Fondements de la Religion & Oussoul', nameAr: 'المدخل إلى أصول الدين والعلوم الشرعية ومناهج الاستدلال', semester: 'S1' },
          { nameFr: 'Exégèse Coranique Analytique I', nameAr: 'التفسير التحليلي لآيات العقيدة والأحكام 1', semester: 'S1' },
          { nameFr: 'Sciences du Coran & Histoire de la Révélation', nameAr: 'علوم القرآن وتاريخ نزول الوحي والتدوين والجمع', semester: 'S1' },
          { nameFr: 'Hadith Analytique & Méthodes des Savants I', nameAr: 'الحديث التحليلي ومناهج المحدثين في الرواية 1', semester: 'S1' },
          { nameFr: 'Introduction à la Théologie Islamique (\'Aqida)', nameAr: 'مدخل لعلم العقيدة الإسلامية وتأصيل الإيمان', semester: 'S1' },
          { nameFr: 'Syntaxe & Morphologie Appliquées au Texte Religieux', nameAr: 'النحو والصرف وتطبيقاته على النص الشرعي والقرآني', semester: 'S1' },
          { nameFr: 'Méthodologie de la Recherche en Études Islamiques', nameAr: 'مناهج البحث العلمي والتحقيق في الدراسات الإسلامية', semester: 'S1' },
          // S2
          { nameFr: 'Théologie : Divinité, Prophéties & Eschatologie', nameAr: 'العقيدة الإسلامية : مباحث الإلهيات والنبوات والسمعيات', semester: 'S2' },
          { nameFr: 'Exégèse Thématique du Texte Coranique', nameAr: 'التفسير الموضوعي وتطبيقاته على قضايا الإنسان والمجتمع', semester: 'S2' },
          { nameFr: 'Sciences du Hadith : Terminologie & Critique', nameAr: 'علوم الحديث : المصطلح وقواعد الحكم على الروايات', semester: 'S2' },
          { nameFr: 'Biographie Prophétique (Sira) & Prédication', nameAr: 'السيرة النبوية العطرة وفقه الدعوة وبناء المجتمع', semester: 'S2' },
          { nameFr: 'Logique & Démonstration Théologique', nameAr: 'المنطق ومناهج الاستدلال الكلامي عند الأصوليين', semester: 'S2' },
          { nameFr: 'Rhétorique Coranique & Inimitabilité (I\'jaz)', nameAr: 'البلاغة القرآنية ودلائل الإعجاز البياني والأسلوبي', semester: 'S2' },
          { nameFr: 'Histoire des Écoles Théologiques & Courants', nameAr: 'تاريخ المذاهب والفرق الإسلامية وتطور علم الكلام', semester: 'S2' },
          // S3
          { nameFr: 'Kalâm & École Achaarite Sunnite au Maroc', nameAr: 'علم الكلام الإسلامي : المذهب الأشعري وثوابت المغرب الدينية', semester: 'S3' },
          { nameFr: 'Exégèse Comparée des Grands Savants', nameAr: 'التفسير المقارن ومناهج أئمة التفسير عبر العصور', semester: 'S3' },
          { nameFr: 'Fiqh des Cultes Malikite & Fondements', nameAr: 'فقه العبادات وأدلته الشرعية على مذهب الإمام مالك', semester: 'S3' },
          { nameFr: 'Maqasid Charia : Origines & Évolution Historique', nameAr: 'مقاصد الشريعة الإسلامية : نشأتها وتطورها التأصيلي', semester: 'S3' },
          { nameFr: 'Histoire des Religions Monothéistes & Comparatisme', nameAr: 'تاريخ الأديان القديمة والأديان الكتابية والشرائع المقارنة', semester: 'S3' },
          { nameFr: 'Pensée Islamique Moderne & Réforme Religieuse', nameAr: 'الفكر الإسلامي الحديث ورواد النهضة والإصلاح والتجديد', semester: 'S3' },
          // S4
          { nameFr: 'Oussoul Al-Fiqh I : Sources & Prescriptions', nameAr: 'أصول الفقه 1 : مباحث الأحكام والأدلة المتفق عليها', semester: 'S4' },
          { nameFr: 'Courants Religieux Contemporains & Dérives', nameAr: 'دراسة الفرق والمذاهب المعاصرة وتيارات الغلو والتشدد', semester: 'S4' },
          { nameFr: 'Apologétique & Défense des Fondements de la Foi', nameAr: 'نقد الشبهات والردود الدفاعية عن العقيدة الإسلامية', semester: 'S4' },
          { nameFr: 'Religions Comparées & Dialogue des Civilisations', nameAr: 'مقارنة الأديان وحوار الحضارات والتعايش الإنساني', semester: 'S4' },
          { nameFr: 'Philosophie Islamique & Réconciliation Raison-Foi', nameAr: 'الفلسفة الإسلامية وعلاقتها بأصول الدين وقضايا العقل', semester: 'S4' },
          { nameFr: 'Fiqh des Transactions & Éthique Financière', nameAr: 'فقه المعاملات المالية وأحكام العدالة والمبادلات', semester: 'S4' },
          // S5
          { nameFr: 'Oussoul Al-Fiqh II : Herméneutique & Textes', nameAr: 'أصول الفقه 2 : دلالات الألفاظ ومناهج الاستنباط الأصولي', semester: 'S5' },
          { nameFr: 'Maqasid Charia & Applications Contemporaines', nameAr: 'مقاصد الشريعة وتطبيقاتها المعاصرة وحفظ الضروريات', semester: 'S5' },
          { nameFr: 'Science du Takhrij & Critique des Chaînes (Isnad)', nameAr: 'علم التخريج ودراسة الأسانيد والرجال ونقد المرويات', semester: 'S5' },
          { nameFr: 'Études Orientalistes & Vision de l\'Islam', nameAr: 'الاستشراق ومناهجه في دراسة القرآن والسنة والفكر', semester: 'S5' },
          { nameFr: 'Soufisme Sunnite Marocain & Éthique Spirituelle', nameAr: 'التصوف السني المغربي والتربية الروحية ومدرسة الجنيد', semester: 'S5' },
          { nameFr: 'Droits de l\'Homme & Liberté dans la Charia', nameAr: 'حقوق الإنسان وكرامة الفرد في المنظور الإسلامي المقاصدي', semester: 'S5' },
          // S6
          { nameFr: 'Pensée Islamique Contemporaine & Renouveau', nameAr: 'قضايا الفكر الإسلامي المعاصر والتجديد والاجتهاد الديني', semester: 'S6' },
          { nameFr: 'Fiqh des Nawaazil Médicales & Économiques', nameAr: 'فقه النوازل والقضايا الطبية والمالية المعاصرة', semester: 'S6' },
          { nameFr: 'Manuscrits Religieux & Codicologie Patrimoniale', nameAr: 'دراسات في التراث المخطوط والتحقيق العلمي لأصول الدين', semester: 'S6' },
          { nameFr: 'Méthodes de Débat & Éthique de la Controverse', nameAr: 'مناهج الجدل والمناظرة وأدب الاختلاف والحوار في الإسلام', semester: 'S6' },
          { nameFr: 'Mémoire de Recherche de Licence / PFE', nameAr: 'مشروع التخرج وبحث الإجازة في أصول الدين والفكر الإسلامي', semester: 'S6' },
        ],
      },
      {
        id: 'coran-hadith',
        labelFr: 'القرآن الكريم والحديث النبوي وعلومه (Sciences du Coran & Hadith)',
        labelAr: 'القرآن الكريم والحديث النبوي الشريف وعلومه',
        modules: [
          // S1
          { nameFr: 'Tajwid, Graphie Coranique (Rasm) & Récitation', nameAr: 'التجويد والرسم القرآني وضبط المصحف الشريف وأصول القراءة', semester: 'S1' },
          { nameFr: 'Sciences du Coran I : Révélation & Circonstances', nameAr: 'علوم القرآن 1 : الوحي وأسباب النزول والمكي والمدني', semester: 'S1' },
          { nameFr: 'Introduction à la Sunna & Histoire de la Tradition', nameAr: 'مدخل إلى السنة النبوية وتاريخ توثيقها ومكانتها التشريعية', semester: 'S1' },
          { nameFr: 'Syntaxe & Analyse Grammaticale du Coran (I\'rab)', nameAr: 'النحو والإعراب القرآني وبلاغة الإعراب', semester: 'S1' },
          { nameFr: 'Vertus Prophétiques & Éthique de la Sunna', nameAr: 'الشمائل المحمدية الشريفة وأخلاق النبي في السنة', semester: 'S1' },
          // S2
          { nameFr: 'Lectures Coraniques & Récitation Warsh', nameAr: 'القراءات القرآنية المتواترة ورواية ورش عن نافع وأصولها', semester: 'S2' },
          { nameFr: 'Terminologie du Hadith I : Sahih, Hasan & Da\'if', nameAr: 'مصطلح الحديث 1 : الصحيح والحسن والضعيف وأنواعه', semester: 'S2' },
          { nameFr: 'Exégèse Traditionnelle (Tafsir bil-Ma\'thour)', nameAr: 'التفسير بالمأثور وأعلامه (ابن جرير، ابن كثير، البغوي)', semester: 'S2' },
          { nameFr: 'Vocabulaire Rare du Coran (Gharib Al-Qur\'an)', nameAr: 'غريب القرآن وبلاغة المفردة القرآنية واشتقاقاتها', semester: 'S2' },
          { nameFr: 'Histoire de la Compilation de la Sunna & Écoles', nameAr: 'تاريخ تدوين السنة ومقاومة الوضع والدفاع عن حجيتها', semester: 'S2' },
          // S3
          { nameFr: 'Méthodes des Grands Imams du Hadith (Bukhari, Muslim)', nameAr: 'مناهج أئمة الحديث (البخاري ومسلم وأصحاب السنن الأربعة)', semester: 'S3' },
          { nameFr: 'Exégèse Rationnelle & Règles d\'Arbitrage', nameAr: 'التفسير بالرأي المحمود وقواعد الترجيح بين الأقوال', semester: 'S3' },
          { nameFr: 'Sciences des Vices Cachés du Hadith (\'Ilal)', nameAr: 'علم علل الحديث وأدق مسائله وخفايا الأسانيد والمتون', semester: 'S3' },
          { nameFr: 'Rhétorique & Inimitabilité Linguistique du Coran', nameAr: 'الإعجاز البلاغي والنظم القرآني وتناسق الآيات والسور', semester: 'S3' },
          // S4
          { nameFr: 'Science de la Critique & Éloge des Transmetteurs', nameAr: 'علم الجرح والتعديل وقواعد الحكم على رواة الحديث', semester: 'S4' },
          { nameFr: 'Compréhension des Hadiths Normatifs (Ahkâm)', nameAr: 'فقه أحاديث الأحكام وشروحها والجمع بين النصوص', semester: 'S4' },
          { nameFr: 'Études sur les Révélations Mecquoises & Médinoises', nameAr: 'دراسات في الخصائص التشريعية للمكي والمدني', semester: 'S4' },
          { nameFr: 'Hadiths Sacrés (Qoudsi) & Spécificités', nameAr: 'الحديث القدسي وخصائصه التعبيرية ومعانيه الإيمانية', semester: 'S4' },
          // S5
          { nameFr: 'Takhrij Approfondi & Analyse des Chaînes', nameAr: 'التخريج المتقدم للأحاديث وتوثيق الروايات في المصادر الأصلية', semester: 'S5' },
          { nameFr: 'Exégèse Littéraire & Moderne du Coran', nameAr: 'التفسير البياني والأدبي في العصر الحديث (ابن عاشور، دراز)', semester: 'S5' },
          { nameFr: 'Abrogation dans le Coran & la Sunna (Nasikh)', nameAr: 'علم الناسخ والمنسوخ في القرآن والسنة وضوابطه الشرعية', semester: 'S5' },
          { nameFr: 'Érudits du Maroc & Service du Coran et Hadith', nameAr: 'جهود علماء المغرب والأندلس في خدمة القرآن والحديث النبوي', semester: 'S5' },
          // S6
          { nameFr: 'Écoles Marocaines d\'Exégèse & d\'Hadith (Ibn Abdilbarr)', nameAr: 'مناهج المحدثين والمفسرين المغاربة (ابن عبد البر، القاضي عياض)', semester: 'S6' },
          { nameFr: 'Critique Textuelle des Matn du Hadith', nameAr: 'نقد المتون عند المحدثين والفقهاء وموافقة صريح القرآن', semester: 'S6' },
          { nameFr: 'Miracles Scientifiques & Cosmiques dans le Coran', nameAr: 'الإعجاز العلمي والكوني والتشريعي في نصوص الوحي', semester: 'S6' },
          { nameFr: 'Mémoire de Recherche de Licence / PFE', nameAr: 'مشروع التخرج وبحث الإجازة في علوم القرآن والحديث الشريف', semester: 'S6' },
        ],
      },
      {
        id: 'charia-fiqh',
        labelFr: 'الفقه وأصوله ومقاصد الشريعة (Charia & Fiqh)',
        labelAr: 'الفقه الإسلامي وأصوله ومقاصد الشريعة',
        modules: [
          // S1
          { nameFr: 'Introduction au Fiqh & Histoire de la Législation', nameAr: 'المدخل لدراسة الفقه الإسلامي وتاريخ التشريع وأدواره', semester: 'S1' },
          { nameFr: 'Introduction à Oussoul Al-Fiqh & Statuts Légaux', nameAr: 'المدخل لأصول الفقه وأقسام الحكم الشرعي (التكليفي والوضعي)', semester: 'S1' },
          { nameFr: 'Fiqh des Cultes Malikite I : Pureté & Prière', nameAr: 'فقه العبادات 1 : الطهارة والصلاة على مذهب الإمام مالك', semester: 'S1' },
          { nameFr: 'Terminologie Juridique Islamique & Règles de Langue', nameAr: 'المصطلحات الفقهية والقواعد اللغوية في الاستنباط', semester: 'S1' },
          // S2
          { nameFr: 'Fiqh des Cultes Malikite II : Zakat, Jeûne & Hajj', nameAr: 'فقه العبادات 2 : الزكاة والصيام والحج والنذور والأيمان', semester: 'S2' },
          { nameFr: 'Oussoul Al-Fiqh : Prescription Légale & Aptitude', nameAr: 'أصول الفقه : مباحث الحكم الشرعي والأهلية وعوارضها', semester: 'S2' },
          { nameFr: 'Histoire de l\'École Malikite au Maroc', nameAr: 'تاريخ المذهب المالكي وأعلامه وأمهات كتبه بالمغرب والأندلس', semester: 'S2' },
          { nameFr: 'Hadiths Juridiques Fondateurs de la Charia', nameAr: 'أحاديث الأحكام الفقهية وتخريج الفروع على الأصول', semester: 'S2' },
          // S3
          { nameFr: 'Fiqh des Contrats & Ventes (Al-Bouyoû\')', nameAr: 'فقه المعاملات 1 : البيوع والمعاوضات والشروط وخيار العيب والربا', semester: 'S3' },
          { nameFr: 'Sources Majeures : Coran, Sunna, Consensus, Analogie', nameAr: 'الأدلة الإجمالية المتفق عليها (الكتاب، السنة، الإجماع، القياس)', semester: 'S3' },
          { nameFr: 'Grandes Maximes Juridiques (Al-Qawa\'id Al-Fiqhiyya)', nameAr: 'القواعد الفقهية الكبرى وتطبيقاتها في التشريع الإسلامي', semester: 'S3' },
          { nameFr: 'Régimes Financiers de la Famille & Droits', nameAr: 'فقه الأسرة المالي وأحكام الصداق والنفقة والمتعة', semester: 'S3' },
          // S4
          { nameFr: 'Contrats de Louage, Sociétés & Partenariats', nameAr: 'فقه المعاملات 2 : الإجارة والشركات والمضاربة والرهن والضمان', semester: 'S4' },
          { nameFr: 'Sources Secondaires : Istihsan, Maslaha, \'Urf', nameAr: 'الأدلة التبعية (الاستحسان، المصالح المرسلة، العرف، الاستصحاب)', semester: 'S4' },
          { nameFr: 'Pénalités & Justice Rétributive en Islam (Jinayat)', nameAr: 'فقه الجنايات والحدود والتعازير والقصاص وحرمة الدماء', semester: 'S4' },
          { nameFr: 'Procédure Judiciaire & Hisba Traditionnelle', nameAr: 'أصول التقاضي والقضاء ونظام الحسبة وحماية المستهلك بالمغرب', semester: 'S4' },
          // S5
          { nameFr: 'Théorie des Maqasid selon Al-Shatibi (Muwafaqat)', nameAr: 'مقاصد الشريعة الكبرى ونظرية الإمام الشاطبي في الموافقات', semester: 'S5' },
          { nameFr: 'Règles d\'Interprétation & Herméneutique (Dalalat)', nameAr: 'دلالات الألفاظ ومناهج الاستنباط (النص، الظاهر، المجمل، المنطوق)', semester: 'S5' },
          { nameFr: 'Droit des Waqfs & Fondations Pieuses au Maroc', nameAr: 'فقه التبرعات والأوقاف وتاريخ مؤسسة الأحباس في المغرب', semester: 'S5' },
          { nameFr: 'Art de la Fatwa & Notariat Adoulaire Marocain', nameAr: 'أصول الفتيا والقضاء وقواعد التوثيق العدلي والشرعي', semester: 'S5' },
          // S6
          { nameFr: 'Finance Islamique & Nawaazil Contemporaines', nameAr: 'فقه النوازل المصرفية والمالية الإسلامية والتأمين التكافلي', semester: 'S6' },
          { nameFr: 'Politique Légale (Siyasa Char\'iyya) & Droit Positif', nameAr: 'السياسة الشرعية والقانون الوضعي ورعاية المصالح العامة', semester: 'S6' },
          { nameFr: 'Ijtihaad, Taqlid & Règles de Pondération (Tarjih)', nameAr: 'الاجتهاد والتقليد والتعارض والترجيح وشروط المفتي والمجتهد', semester: 'S6' },
          { nameFr: 'Mémoire de Fin d\'Études en Charia / PFE', nameAr: 'مشروع التخرج وبحث الإجازة في الفقه وأصوله ومقاصد الشريعة', semester: 'S6' },
        ],
      },
    ],
  },
  {
    id: 'sciences',
    code: 'FS / FST / ENSA',
    labelFr: 'Sciences & Technologies',
    labelAr: 'العلوم والتقنيات والهندسة',
    icon: Cpu,
    colorClass: 'cyan',
    specialties: [
      {
        id: 'smi',
        labelFr: 'Mathématiques & Informatique (SMI)',
        labelAr: 'الرياضيات والإعلاميات (SMI)',
        modules: [
          { nameFr: 'Analyse Mathématique I & Algèbre I', nameAr: 'التحليل الرياضي 1 والجبر 1', semester: 'S1' },
          { nameFr: 'Algorithmique & Programmation en C', nameAr: 'الخوارزميات والبرمجة بلغة C', semester: 'S1' },
          { nameFr: 'Analyse Mathématique II', nameAr: 'التحليل الرياضي 2 والتكامل', semester: 'S2' },
          { nameFr: 'Structures de Données & Programmation Web', nameAr: 'هياكل البيانات والبرمجة على الويب', semester: 'S2' },
          { nameFr: 'Programmation Orientée Objet (Java/C++)', nameAr: 'البرمجة الكائنية الموجهة Java و C++', semester: 'S3' },
          { nameFr: 'Systèmes d\'Exploitation & Linux', nameAr: 'أنظمة التشغيل وهندسة لينكس', semester: 'S3' },
          { nameFr: 'Bases de Données Relationnelles & SQL', nameAr: 'قواعد البيانات العلائقية و SQL', semester: 'S4' },
          { nameFr: 'Réseaux Informatiques & Télécoms', nameAr: 'شبكات الحاسوب والاتصالات والبروتوكولات', semester: 'S4' },
          { nameFr: 'Génie Logiciel & Modélisation UML', nameAr: 'هندسة البرمجيات وتصميم UML', semester: 'S5' },
          { nameFr: 'Intelligence Artificielle & Data Science', nameAr: 'الذكاء الاصطناعي وعلوم البيانات', semester: 'S6' },
        ],
      },
      {
        id: 'smp',
        labelFr: 'Physique & Chimie (SMP / SMC)',
        labelAr: 'علوم المادة فيزياء وكيمياء',
        modules: [
          { nameFr: 'Mécanique du Point Matériel', nameAr: 'ميكانيكا النقطة المادية وقوانين نيوتن', semester: 'S1' },
          { nameFr: 'Thermodynamique Physique I', nameAr: 'الديناميكا الحرارية 1 والغازات المثالية', semester: 'S1' },
          { nameFr: 'Électrostatique et Électrocinétique', nameAr: 'الكهرباء الساكنة والدوائر الكهربائية', semester: 'S2' },
          { nameFr: 'Optique Géométrique et Ondulatoire', nameAr: 'البصريات الهندسية والموجية وتطبيقات الليزر', semester: 'S2' },
          { nameFr: 'Électronique Analogique & Numérique', nameAr: 'الإلكترونيات التناظرية والرقمية والترانزستور', semester: 'S3' },
          { nameFr: 'Mécanique Quantique & Physique Nucléaire', nameAr: 'الميكانيكا الكمية والفيزياء النووية', semester: 'S4' },
        ],
      },
      {
        id: 'ensa',
        labelFr: 'Génie Informatique & Cybersécurité (Cycle Ingénieur ENSA)',
        labelAr: 'سلك مهندسي الدولة في الإعلاميات والأمن السيبراني',
        modules: [
          { nameFr: 'Architecture Microservices & Cloud Computing', nameAr: 'هندسة البرمجيات والمعماريات السحابية Microservices', semester: 'S5' },
          { nameFr: 'Sécurité des Systèmes & Cryptographie Appliquée', nameAr: 'أمن الأنظمة والتشفير التطبيقي واختبار الاختراق', semester: 'S5' },
          { nameFr: 'Intelligence Artificielle & Machine Learning', nameAr: 'الذكاء الاصطناعي وتعلم الآلة والرؤية الحاسوبية', semester: 'S6' },
          { nameFr: 'DevOps, CI/CD & Conteneurisation Docker/K8s', nameAr: 'ممارسات DevOps وأتمتة النشر والحاويات', semester: 'S6' },
        ],
      },
    ],
  },
  {
    id: 'medecine',
    code: 'FMP / Pharmacie',
    labelFr: 'Médecine & Santé',
    labelAr: 'الطب والصيدلة وطب الأسنان',
    icon: Activity,
    colorClass: 'rose',
    specialties: [
      {
        id: 'pcem',
        labelFr: 'Études Médicales (Premier Cycle PCEM)',
        labelAr: 'الدراسات الطبية العامة (السلك الأول)',
        modules: [
          { nameFr: 'Anatomie Générale & Appareil Locomoteur', nameAr: 'التشريح البشري العام والجهاز الحركي والعظام', semester: 'S1' },
          { nameFr: 'Biologie Cellulaire & Génétique Humaine', nameAr: 'البيولوجيا الخلوية والوراثة والجينوم', semester: 'S1' },
          { nameFr: 'Histologie Médicale & Embryologie Humaine', nameAr: 'علم الأنسجة وعلم الأجنة وتطور الأعضاء', semester: 'S2' },
          { nameFr: 'Biochimie Métabolique & Clinique', nameAr: 'الكيمياء الحيوية الأيضية والمسالك الأنزيمية', semester: 'S2' },
          { nameFr: 'Physiologie Cardiovasculaire et Respiratoire', nameAr: 'وظائف الأعضاء القلبية والتنفسية والدموية', semester: 'S3' },
          { nameFr: 'Sémiologie Médicale & Chirurgicale', nameAr: 'علم الأعراض الطبية والجراحية والفحص السريري', semester: 'S4' },
          { nameFr: 'Immunologie Fondamentale & Hématologie', nameAr: 'علم المناعة وأمراض الدم والصفائح الدموية', semester: 'S4' },
        ],
      },
      {
        id: 'pharmacie',
        labelFr: 'Sciences Pharmaceutiques & Pharmacologie',
        labelAr: 'العلوم الصيدلية وعلم الأدوية',
        modules: [
          { nameFr: 'Pharmacologie Générale & Mécanismes d\'Action', nameAr: 'علم الأدوية العام وتفاعلات المستقبلات والأدوية', semester: 'S4' },
          { nameFr: 'Pharmacie Galénique & Formes Médicamenteuses', nameAr: 'الصيدلة الجالينوسية وصناعة وتوصيل الدواء', semester: 'S4' },
          { nameFr: 'Toxicologie Clinique & Pharmacocinétique', nameAr: 'علم السموم السريري وحركية الأدوية في الجسم', semester: 'S5' },
          { nameFr: 'Microbiologie Médicale, Virologie & Antibiotiques', nameAr: 'علم الأحياء الدقيقة والفيروسات ومضادات الحيوية', semester: 'S6' },
        ],
      },
    ],
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  books,
  facultyNews,
  professorNotices,
  student,
  professors,
  onNavigateTab,
  onFilterAndGoToCatalog,
  onOpenProfessorPortal,
  onOpenProfessorRegister,
  onOpenUniversitiesModal,
  onOpenStudentAuth,
  onOpenAdmin,
  isAdminAuthenticated = false,
  onOpenDataProtectionModal,
  authenticatedProfessor,
  onOpenBookDetails,
  onOpenBookReader,
  onOpenVisitorCatalog,
  onOpenUserGuide,
  lang,
}) => {
  const [selectedNewsFaculty, setSelectedNewsFaculty] = useState<string>('all');
  const [homeSearchInput, setHomeSearchInput] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Cascade Filter State: Step 1 (Faculty) -> Step 2 (Specialty) -> Step 3 (Modules)
  const [activeCascadeFacultyId, setActiveCascadeFacultyId] = useState<string>('droit');
  const activeFacultyObject =
    CASCADE_FACULTIES_DATA.find((f) => f.id === activeCascadeFacultyId) || CASCADE_FACULTIES_DATA[0];

  const [activeSpecialtyId, setActiveSpecialtyId] = useState<string>(
    activeFacultyObject.specialties[0].id
  );
  const [cascadeSemesterFilter, setCascadeSemesterFilter] = useState<string>('Tous');
  const [cascadeModuleSearch, setCascadeModuleSearch] = useState<string>('');

  // Automatically update specialty when faculty changes
  const handleSelectCascadeFaculty = (facultyId: string) => {
    setActiveCascadeFacultyId(facultyId);
    setCascadeSemesterFilter('Tous');
    setCascadeModuleSearch('');
    const fac = CASCADE_FACULTIES_DATA.find((f) => f.id === facultyId);
    if (fac && fac.specialties.length > 0) {
      setActiveSpecialtyId(fac.specialties[0].id);
    }
  };

  const handleSelectSpecialty = (specId: string) => {
    setActiveSpecialtyId(specId);
    setCascadeSemesterFilter('Tous');
    setCascadeModuleSearch('');
  };

  const activeSpecialtyObject =
    activeFacultyObject.specialties.find((s) => s.id === activeSpecialtyId) ||
    activeFacultyObject.specialties[0];

  const activeSpecialtySemesters = useMemo(() => {
    const sems = Array.from(new Set(activeSpecialtyObject.modules.map((m) => m.semester)));
    const semOrder = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'M1', 'M2', 'Master'];
    sems.sort((a, b) => {
      const idxA = semOrder.indexOf(a);
      const idxB = semOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ['Tous', ...sems];
  }, [activeSpecialtyObject]);

  const displayedCascadeModules = useMemo(() => {
    return activeSpecialtyObject.modules.filter((mod) => {
      if (cascadeSemesterFilter !== 'Tous' && mod.semester !== cascadeSemesterFilter) {
        return false;
      }
      if (cascadeModuleSearch.trim()) {
        const q = cascadeModuleSearch.toLowerCase().trim();
        const matchFr = mod.nameFr.toLowerCase().includes(q);
        const matchAr = mod.nameAr.toLowerCase().includes(q);
        const matchSem = mod.semester.toLowerCase().includes(q);
        return matchFr || matchAr || matchSem;
      }
      return true;
    });
  }, [activeSpecialtyObject, cascadeSemesterFilter, cascadeModuleSearch]);

  // Real-time live search matches
  const searchResults = useMemo(() => {
    const q = homeSearchInput.toLowerCase().trim();
    if (!q) return [];
    return books.filter((b) => {
      const matchTitle = (b.title || '').toLowerCase().includes(q);
      const matchTitleAr = b.titleAr ? b.titleAr.toLowerCase().includes(q) : false;
      const matchAuthor = (b.author || '').toLowerCase().includes(q);
      const matchFaculty = (b.facultyLabel || b.faculty || '').toLowerCase().includes(q);
      const matchDesc = (b.description || '').toLowerCase().includes(q);
      const matchTag = Array.isArray(b.tags) ? b.tags.some((t) => (t || '').toLowerCase().includes(q)) : false;
      return matchTitle || matchTitleAr || matchAuthor || matchFaculty || matchDesc || matchTag;
    });
  }, [books, homeSearchInput]);

  const filteredNews = facultyNews.filter((item) => {
    if (selectedNewsFaculty === 'all') return true;
    return item.facultyCode === selectedNewsFaculty;
  });

  const featuredBooks = books.slice(0, 4);

  const handleLaunchSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length === 1) {
      onOpenBookDetails(searchResults[0]);
    } else {
      onFilterAndGoToCatalog(undefined, undefined, homeSearchInput.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH DIRECT SEARCH & VALUE PROPOSITION */}
      <section className="relative overflow-hidden bg-stone-900 text-stone-100 py-12 sm:py-16 border-b border-stone-800">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/fac_library_hero_1791375887505.jpg"
            alt="Bibliothèque et amphithéâtre universitaire"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-3 tracking-wide uppercase">
              <span>{lang === 'fr' ? 'Plateforme Académique Unifiée' : 'المنصة الجامعية الرسمية الموحدة'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'fr' ? 'Lecture In-App Sécurisée' : 'قراءة مأمونة بدون تحميل'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 text-balance">
              {lang === 'fr'
                ? 'FAC en PDF : La bibliothèque universitaire numérique et sécurisée'
                : 'منصة FAC en PDF: المكتبة الجامعية الرقمية الآمنة لطلبة وأساتذة الكليات'}
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 sm:p-5 rounded-2xl bg-stone-950/70 border border-stone-800 backdrop-blur-sm">
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-xl">
                {lang === 'fr'
                  ? 'Plateforme académique marocaine unifiée dédiée à la consultation in-app protégée des polycopiés et manuels universitaires. Les étudiants s\'inscrivent pour bénéficier de la tarification préférentielle subventionnée avec lecture interactive sécurisée, tandis que les enseignants-chercheurs bénéficient d\'une protection totale de leurs œuvres et de leurs droits académiques.'
                  : 'المنصة الأكاديمية المغربية الموحدة للمطالعة التفاعلية المحمية للمحاضرات والمقررات الجامعية داخل التطبيق. يسجل الطلبة للاستفادة من الأثمنة التفضيلية المدعومة المخصصة للطلبة والمذاكرة الآمنة، مع ضمان الحماية الفكرية التامة للأساتذة الباحثين وحفظ حقوق التأليف.'}
              </p>

              {/* زر دليل ومرشد استعمال التطبيق لفائدة الأستاذ والطالب (User Guide Button) */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenUserGuide ? onOpenUserGuide('guide_student') : null}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
                  title={lang === 'fr' ? 'Consulter le guide pratique de l\'étudiant' : 'دليل ومرشد استعمال التطبيق للطالب'}
                >
                  <GraduationCap className="w-4 h-4 text-stone-950" />
                  <span>{lang === 'fr' ? 'Guide Étudiant' : 'مرشد استعمال الطالب'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenUserGuide ? onOpenUserGuide('guide_professor') : null}
                  className="flex-1 sm:flex-none px-4 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title={lang === 'fr' ? 'Consulter le guide pratique de l\'enseignant' : 'دليل ومرشد استعمال التطبيق للأستاذ'}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'fr' ? 'Guide Enseignant' : 'مرشد استعمال الأستاذ'}</span>
                </button>
              </div>
            </div>

            {/* LIVE SEARCH MODULE WITH DIRECT JUMP TO BOOK OR PROFESSOR */}
            <div className="relative max-w-2xl mb-4">
              <form onSubmit={handleLaunchSearch} className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={homeSearchInput}
                  onChange={(e) => {
                    setHomeSearchInput(e.target.value);
                    setIsSearchActive(true);
                  }}
                  onFocus={() => setIsSearchActive(true)}
                  placeholder={
                    lang === 'fr'
                      ? 'Rechercher un livre, un module ou un professeur (ex: Bennani, Droit Civil, IS-LM)...'
                      : 'ابحث عن مرجع، مادة أو اسم الأستاذ (مثال: بناني، القانون المدني، الخوارزميات)...'
                  }
                  className="w-full pl-11 pr-28 py-3.5 bg-stone-850/95 border border-stone-700 hover:border-amber-500/80 rounded-xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg transition-all"
                />

                {homeSearchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setHomeSearchInput('');
                      setIsSearchActive(false);
                    }}
                    className="absolute right-24 text-stone-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  {lang === 'fr' ? 'Rechercher' : 'بحث مباشر'}
                </button>
              </form>

              {/* Instant Search Dropdown Results with Direct Book Jump */}
              {isSearchActive && homeSearchInput.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-800">
                  <div className="p-2.5 bg-stone-950/80 text-[11px] font-semibold text-stone-400 flex items-center justify-between">
                    <span>
                      {searchResults.length} {lang === 'fr' ? 'résultat(s) trouvé(s)' : 'نتائج مطابقة'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSearchActive(false)}
                      className="text-stone-400 hover:text-white text-[11px]"
                    >
                      {lang === 'fr' ? 'Fermer' : 'إغلاق'}
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      {lang === 'fr' ? 'Aucun livre ou enseignant ne correspond à cette recherche.' : 'لم يتم العثور على أي مرجع أو أستاذ بهذا الاسم.'}
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {searchResults.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 hover:bg-stone-800/90 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-12 rounded bg-stone-800 overflow-hidden shrink-0 border border-stone-700">
                              <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 text-left">
                              <div className="text-xs font-bold text-white truncate">{b.title}</div>
                              <div className="text-[11px] text-amber-400 truncate">
                                {b.author} · <span className="text-stone-400">{b.facultyLabel} ({b.semester})</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setIsSearchActive(false);
                                onOpenBookDetails(b);
                              }}
                              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-md border border-stone-600 cursor-pointer whitespace-nowrap"
                            >
                              {lang === 'fr' ? 'Consulter le cours' : 'الذهاب للمرجع'}
                            </button>
                            <button
                              onClick={() => {
                                setIsSearchActive(false);
                                onOpenBookReader(b);
                              }}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-md cursor-pointer whitespace-nowrap flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{lang === 'fr' ? 'Lire in-app' : 'قراءة فورية'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Action Shortcuts: Explorer la bibliothèque (Tarifs Étudiants vs Tarifs Visiteurs) */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* زر إمكانية الدخول إلى المكتبة العامة بالصفحة الأولى للزوار بغير الأثمنة المخصصة للطلبة (Requirement 9) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenVisitorCatalog) {
                    onOpenVisitorCatalog();
                  } else {
                    onFilterAndGoToCatalog('all', 'Tous');
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-amber-300/60 ring-2 ring-amber-400/20"
                title={lang === 'fr' ? 'Accès Visiteurs Publics (Tarifs Standards)' : 'دخول الزوار والعموم بالتعريفة العامة'}
              >
                <Compass className="w-4 h-4 text-stone-950" />
                <span>
                  {lang === 'fr'
                    ? 'الدخول إلى المكتبة العامة للزوار (بالتعريفة العامة)'
                    : 'الدخول إلى المكتبة العامة للزوار (بالتعريفة العامة)'}
                </span>
                <span className="text-[10px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {lang === 'fr' ? 'Tarif Public' : 'تعريفة العموم'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onFilterAndGoToCatalog('all', 'Tous')}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-white font-bold text-xs rounded-xl border border-stone-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'fr' ? 'Bibliothèque Étudiante (Tarifs Subventionnés)' : 'مكتبة الطلبة (الأسعار المدعومة)'}</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* 2. ESPACES & PROFILS ACADÉMIQUES : بروفايل الأستاذ، بروفايل الطالب، فضاء الطالب، فضاء الأساتذة (فوق التخصصات والوحدات) */}
          <div className="pt-6 border-t border-stone-800/90 mb-6">
            {/* الإطار 1: إطار الأساتذة والمؤلفين (يجمع بروفايل الأستاذ وفضاء الأساتذة جنباً إلى جنب داخل إطار واحد) */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'fr' ? 'Pôle Enseignants & Auteurs' : 'جناح الأساتذة والمؤلفين'}</span>
                  </span>
                </div>
                <span className="text-[10px] text-amber-300/80 font-mono">
                  {lang === 'fr' ? 'Droits d\'auteur & Gestion' : 'إدارة المقررات وحفظ الحقوق'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* بروفايل الأستاذ (Profil Professeur) */}
                <button
                  type="button"
                  onClick={onOpenProfessorPortal}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-stone-900 to-amber-950/50 border border-amber-500/50 hover:border-amber-400 text-left rtl:text-right flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-sm ring-1 ring-amber-500/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                        <span className="truncate">{lang === 'fr' ? 'Profil Professeur' : 'بروفايل الأستاذ'}</span>
                        <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                          {authenticatedProfessor ? (lang === 'fr' ? 'Actif' : 'نشط') : (lang === 'fr' ? 'Enseignant' : 'أستاذ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-200/80 truncate mt-0.5">
                        {authenticatedProfessor
                          ? authenticatedProfessor.fullName
                          : (lang === 'fr' ? 'Tableau de bord, polycopiés & droits d\'auteur' : 'لوحة القيادة، إيداع المقررات، ومتابعة الأرباح')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0">
                    {authenticatedProfessor ? (lang === 'fr' ? 'Gérer →' : '← إدارة') : (lang === 'fr' ? 'Entrer →' : '← دخول')}
                  </span>
                </button>

                {/* فضاء الأساتذة (Espace Enseignants) */}
                {onOpenProfessorRegister && (
                  <button
                    type="button"
                    onClick={onOpenProfessorRegister}
                    className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/80 via-stone-900 to-purple-950/50 border border-purple-500/50 hover:border-purple-400 text-left rtl:text-right flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-sm ring-1 ring-purple-500/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                          <span className="truncate">{lang === 'fr' ? 'Espace Enseignants' : 'فضاء الأساتذة'}</span>
                          <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                            0 DH
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-200/80 truncate mt-0.5">
                          {lang === 'fr' ? 'Inscription gratuite & droits d\'auteur garantis' : 'تسجيل مجاني للأساتذة والمؤلفين وحفظ الحقوق'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0">
                      {lang === 'fr' ? 'Rejoindre →' : '← انضمام'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* الإطار 2: إطار الطلبة والتسجيل (يجمع بروفايل الطالب وفضاء الطالب جنباً إلى جنب داخل إطار واحد) */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-stone-900/90 border border-emerald-500/30 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'fr' ? 'Pôle Étudiants & Inscriptions' : 'جناح الطلبة والمعطيات الجامعية'}</span>
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300/80 font-mono">
                  {lang === 'fr' ? 'Accès In-App & Inscription' : 'المقررات والتسجيل الجامعي'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* بروفايل الطالب (Profil Étudiant) */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('library')}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-stone-900 to-emerald-950/50 border border-emerald-500/50 hover:border-emerald-400 text-left rtl:text-right flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-sm ring-1 ring-emerald-500/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                        <span className="truncate">{lang === 'fr' ? 'Profil Étudiant' : 'بروفايل الطالب'}</span>
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                          {lang === 'fr' ? 'Espace' : 'حسابي'}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-200/80 truncate mt-0.5">
                        {lang === 'fr' ? 'Mes cours acquis, lecteur in-app & notes' : 'مقرراتي المقتناة، القارئ الآمن، والملاحظات'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0">
                    {lang === 'fr' ? 'Ouvrir →' : '← فتح'}
                  </span>
                </button>

                {/* فضاء الطالب (Espace Étudiant) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenStudentAuth) onOpenStudentAuth();
                    else onNavigateTab('library');
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/80 via-stone-900 to-sky-950/50 border border-sky-500/50 hover:border-sky-400 text-left rtl:text-right flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-sm ring-1 ring-sky-500/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                      <GraduationCap className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-sky-300 flex items-center gap-1.5">
                        <span className="truncate">{lang === 'fr' ? 'Espace Étudiant' : 'فضاء الطالب'}</span>
                        <span className="text-[9px] bg-sky-500/30 text-sky-300 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                          {lang === 'fr' ? 'Inscription' : 'انخراط'}
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-200/80 truncate mt-0.5">
                        {lang === 'fr' ? 'Inscription, connexion & carte Apogée' : 'التسجيل الجديد، البطاقة الجامعية، واختيار الشعبة'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform shrink-0">
                    {lang === 'fr' ? 'S\'inscrire →' : '← انخراط'}
                  </span>
                </button>
              </div>
            </div>

            {/* دليل الجامعات والكليات المغربية (Accès Rapide Base Officielle) */}
            {onOpenUniversitiesModal && (
              <button
                type="button"
                onClick={onOpenUniversitiesModal}
                className="w-full p-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-500/50 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-stone-800 text-amber-400 group-hover:bg-amber-500/20">
                    <Building2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-left rtl:text-right">
                    <span className="text-xs font-bold text-stone-200 group-hover:text-white">
                      {lang === 'fr' ? 'Guide Officiel des Universités & Facultés Marocaines' : 'دليل الجامعات والكليات المغربية المعتمدة'}
                    </span>
                    <span className="text-[11px] text-stone-400 hidden sm:inline mr-2 rtl:ml-2">
                      · {lang === 'fr' ? 'Test et navigation directe sans saisie manuelle' : 'تصفح واختبار فوري للجامعات والكليات'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  <span>{lang === 'fr' ? 'Consulter le Guide' : 'فتح الدليل'}</span>
                  <span>→</span>
                </span>
              </button>
            )}
          </div>

            {/* 3-STEP CASCADE FILTERING MECHANISM (Point 7: الكلية -> التخصص -> الوحدات) */}
            <div className="p-5 rounded-3xl bg-stone-850/90 border border-stone-700/80 shadow-xl mb-6">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-700">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Layers className="w-4 h-4" />
                  <span>
                    {lang === 'fr'
                      ? 'Filtrage Cascade en 3 Étapes : Faculté → Spécialité → Modules'
                      : 'آلية الولوج والفلترة المتسلسلة: الكلية ← التخصص ← الوحدات'}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  {lang === 'fr' ? 'Cliquez sur une unité pour ouvrir le catalogue' : 'اختر وحدة للانتقال المباشر للمقرر'}
                </span>
              </div>

              {/* Step 1: Faculties Selection (6 Moroccan University Faculties) */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {lang === 'fr' ? '1. Choisissez la Faculté / Établissement :' : '1. حدد الكلية / المجال الأكاديمي:'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {CASCADE_FACULTIES_DATA.length} {lang === 'fr' ? 'Pôles Universitaires' : 'أقطاب جامعية'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {CASCADE_FACULTIES_DATA.map((fac) => {
                    const IconComponent = fac.icon;
                    const isActive = activeCascadeFacultyId === fac.id;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => handleSelectCascadeFaculty(fac.id)}
                        className={`p-2.5 rounded-2xl transition-all text-left flex flex-col justify-between gap-2 cursor-pointer border ${
                          isActive
                            ? 'bg-amber-600/20 border-amber-500 text-white shadow-xs ring-1 ring-amber-500/40'
                            : 'bg-stone-800/80 hover:bg-stone-750 border-stone-700 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`p-2 rounded-xl ${
                              isActive ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-700 text-stone-300'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-stone-700/60 text-stone-300">
                            {fac.code.split(' ')[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isActive ? 'text-amber-300' : 'text-white'}`}>
                            {lang === 'ar' ? fac.labelAr : fac.labelFr}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate mt-0.5">{fac.code}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Specialties / Filières Badges */}
              <div className="mb-4 pt-3 border-t border-stone-750">
                <div className="text-[11px] font-bold text-stone-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {lang === 'fr'
                      ? `2. Spécialités & Branches (${activeFacultyObject.labelFr}) :`
                      : `2. التخصصات والشعب التابعة لـ (${activeFacultyObject.labelAr}) :`}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {activeFacultyObject.specialties.length} {lang === 'fr' ? 'filières' : 'شعب ومسالك'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeFacultyObject.specialties.map((spec) => {
                    const isSpecActive = activeSpecialtyId === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => handleSelectSpecialty(spec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          isSpecActive
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                        }`}
                      >
                        <span>{lang === 'ar' ? spec.labelAr : spec.labelFr}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSpecActive ? 'bg-amber-600/40 text-stone-950' : 'bg-stone-700 text-stone-400'}`}>
                          {spec.modules.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Modules / Units (الوحدات) with Semesters & Search */}
              <div className="pt-3 border-t border-stone-750">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                      {lang === 'fr'
                        ? `3. Modules (${activeSpecialtyObject.labelFr}) :`
                        : `3. الوحدات والمقررات الرسمية لـ (${activeSpecialtyObject.labelAr}) :`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      {displayedCascadeModules.length} {lang === 'fr' ? 'modules' : 'وحدة'}
                    </span>
                  </div>

                  {/* Fast Semester Filters (S1 to S6) */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
                      {lang === 'fr' ? 'Semestre :' : 'السداسي:'}
                    </span>
                    {activeSpecialtySemesters.map((sem) => {
                      const isSemActive = cascadeSemesterFilter === sem;
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => setCascadeSemesterFilter(sem)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            isSemActive
                              ? 'bg-amber-500 text-stone-950 shadow-xs'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                          }`}
                        >
                          {sem}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Search within Specialty Modules */}
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={cascadeModuleSearch}
                    onChange={(e) => setCascadeModuleSearch(e.target.value)}
                    placeholder={
                      lang === 'fr'
                        ? 'Rechercher un module spécifique dans cette filière (ex: Obligations, Macro, Tafsir, Fiqh...)'
                        : 'بحث سريع في أسماء المواد والوحدات (مثال: الالتزامات، ماكرو، فقه، نحو، حديث، محاسبة...)'
                    }
                    className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2 bg-stone-800/90 hover:bg-stone-800 focus:bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {cascadeModuleSearch && (
                    <button
                      type="button"
                      onClick={() => setCascadeModuleSearch('')}
                      className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {displayedCascadeModules.length === 0 ? (
                  <div className="text-center py-8 bg-stone-800/50 rounded-2xl border border-stone-750 p-4">
                    <p className="text-xs text-stone-400 mb-2">
                      {lang === 'fr'
                        ? 'Aucun module trouvé pour ce filtre de semestre ou mot-clé.'
                        : 'لم يتم العثور على وحدات مطابقة لهذا السداسي أو كلمة البحث.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCascadeSemesterFilter('Tous');
                        setCascadeModuleSearch('');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      {lang === 'fr' ? 'Réinitialiser les filtres' : 'إعادة ضبط كل الوحدات'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {displayedCascadeModules.map((mod, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          onFilterAndGoToCatalog(
                            activeCascadeFacultyId,
                            mod.semester
                          )
                        }
                        className="p-2.5 rounded-xl bg-stone-800 hover:bg-amber-950/40 border border-stone-700 hover:border-amber-500/80 transition-all text-left flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                            {lang === 'ar' ? mod.nameAr : mod.nameFr}
                          </div>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 bg-stone-700 group-hover:bg-amber-500/20 text-stone-300 group-hover:text-amber-300 rounded font-mono font-bold">
                              {mod.semester}
                            </span>
                            <span className="truncate">{activeFacultyObject.code}</span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
      </section>

      {/* 5. PROFESSORS NOTICES & INSTRUCTIONS */}
      <section className="py-12 bg-amber-50/50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>{lang === 'fr' ? 'Avis & Directives Pédagogiques' : 'إشعارات وتوجيهات الأساتذة لطلبتهم'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {lang === 'fr' ? 'Consignes officielles des enseignants' : 'مستجدات وتوجيهات المقررات الأكاديمية'}
              </h2>
            </div>

            <button
              onClick={onOpenProfessorPortal}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Vous êtes enseignant ? Publier un avis' : 'هل أنت أستاذ؟ نشر إشعار جديد'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professorNotices.map((notice) => (
              <div
                key={notice.id}
                className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-xs sm:text-sm">
                        {notice.professorName}
                      </span>
                      <span className="text-[11px] text-stone-500 hidden sm:inline">
                        · {notice.professorTitle}
                      </span>
                    </div>
                    {notice.pinned && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        {lang === 'fr' ? 'Épinglé' : 'مثبت'}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-semibold text-amber-800 mb-2">
                    {notice.faculty} · {notice.moduleName}
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed mb-3">
                    {lang === 'ar' ? notice.messageAr : notice.messageFr}
                  </p>
                </div>

                <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-2 flex items-center justify-between">
                  <span>{notice.date}</span>
                  <span className="text-stone-500 font-mono text-[10px]">FAC-AUTH-VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED BOOKS SHOWCASE */}
      <section className="py-14 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                {lang === 'fr' ? 'Sélection Académique' : 'مختارات من المقررات الجامعية'}
              </div>
              <h2 className="text-2xl font-black text-stone-900">
                {lang === 'fr' ? 'Polycopiés et manuels phares disponibles' : 'أبرز المقررات والمطبوعات المعتمدة'}
              </h2>
            </div>

            <button
              onClick={() => onFilterAndGoToCatalog('all', 'Tous')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'fr' ? 'Voir toute la bibliothèque' : 'عرض المعرض العام كاملاً'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAcquired={student.acquiredBookIds.includes(book.id)}
                onOpenDetails={onOpenBookDetails}
                onOpenReader={onOpenBookReader}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (DRM ARCHITECTURE) */}
      <section className="py-14 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              {lang === 'fr' ? 'Architecture Sécurisée In-App' : 'هندسة الحماية الحصرية داخل التطبيق'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
              {lang === 'fr'
                ? 'Comment FAC en PDF protège les cours et les droits d\'auteur'
                : 'كيف تضمن المنصة حماية المقررات وحقوق التأليف'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {lang === 'fr'
                ? 'Une chaîne de sécurité inviolable qui permet aux étudiants de réviser sereinement tout en préservant le travail intellectuel des professeurs.'
                : 'نظام متكامل يتيح للطلبة الاستذكار بمرونة عالية، مع منع أي محاولة لنسخ أو تسريب المطبوع خارج أسوار المنصة.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
              <div className="text-xs font-mono font-bold text-stone-400 mb-3">01.</div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-200">
                <FileX className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-1.5">
                {lang === 'fr' ? 'Aucun Fichier PDF Exposé' : 'انعدام ملفات الـ PDF الخام'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Aucun lien de téléchargement direct. Les cours sont rendus sur Canvas in-app sécurisé avec interdiction absolue d\'extraction.'
                  : 'لا توجد روابط تحميل أو ملفات مكشوفة. تتم معالجة الصفحات برمجياً على Canvas مشفر ومحصن من برامج السحب.'}
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
              <div className="text-xs font-mono font-bold text-stone-400 mb-3">02.</div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-1.5">
                {lang === 'fr' ? 'Bouclier Anti-Capture Automatique' : 'الحجب الفوري عند تصوير الشاشة'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Perte de focus, raccourcis de capture ou outils de découpage déclenchent l\'occultation instantanée de l\'écran et le nettoyage du presse-papier.'
                  : 'أي استخدام لأدوات لقطات الشاشة أو فقدان تركيز النافذة يؤدي لحجب المحتوى تلقائياً بضبابية تامة ومسح الحافظة.'}
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-xl shadow-xs">
              <div className="text-xs font-mono font-bold text-stone-400 mb-3">03.</div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-4 border border-sky-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-1.5">
                {lang === 'fr' ? 'Filigrane Nominatif Dynamique' : 'علامة مائية تتبعية متحركة'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'fr'
                  ? 'Un filigrane imperceptible dérive en permanence sur la page avec le nom de l\'étudiant, son numéro d\'immatriculation, son adresse IP et la date.'
                  : 'تتحرك علامة مائية ذكية بصفة مستمرة تحمل هوية الطالب ورقمه الجامعي وعنوان IP لمنع التصوير بكاميرا الهاتف.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
