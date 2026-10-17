/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AcademicSpecialty, AcademicModule, FacultyType, SemesterType } from '../types';
import { SPECIALTIES_DATABASE } from '../data/mockBooks';

const STORAGE_KEYS = {
  CUSTOM_SPECIALTIES: 'fac_en_pdf_custom_specialties',
  CUSTOM_MODULES: 'fac_en_pdf_custom_modules',
};

// Rich default Moroccan academic modules
export const INITIAL_MODULES_DATABASE: AcademicModule[] = [
  // Droit & Sciences Juridiques (FSJP)
  {
    id: 'mod-1',
    nameFr: 'Droit Civil : La Théorie Générale des Obligations',
    nameAr: 'القانون المدني : النظرية العامة للالتزامات',
    facultyCode: 'droit',
    specialtyName: 'Droit Privé en Arabe (القانون الخاص باللغة العربية)',
    semester: 'S3',
  },
  {
    id: 'mod-2',
    nameFr: 'Droit Commercial & Entreprises Commerciales',
    nameAr: 'القانون التجاري والشركات التجارية',
    facultyCode: 'droit',
    specialtyName: 'Droit Privé en Arabe (القانون الخاص باللغة العربية)',
    semester: 'S4',
  },
  {
    id: 'mod-3',
    nameFr: 'Droit Constitutionnel & Institutions Politiques',
    nameAr: 'القانون الدستوري والمؤسسات السياسية',
    facultyCode: 'droit',
    specialtyName: 'Droit Public & Sciences Politiques (القانون العام)',
    semester: 'S1',
  },
  {
    id: 'mod-4',
    nameFr: 'Introduction aux Sciences Juridiques',
    nameAr: 'المدخل لدراسة العلوم القانونية',
    facultyCode: 'droit',
    specialtyName: 'Droit Privé en Français (Section Française)',
    semester: 'S1',
  },
  {
    id: 'mod-5',
    nameFr: 'Droit Administratif & Contentieux Administratif',
    nameAr: 'القانون الإداري والمنازعات الإدارية',
    facultyCode: 'droit',
    specialtyName: 'Droit Public & Sciences Politiques (القانون العام)',
    semester: 'S2',
  },
  {
    id: 'mod-6',
    nameFr: 'Droit Pénal Général & Criminologie',
    nameAr: 'القانون الجنائي العام وعلم الإجرام',
    facultyCode: 'droit',
    specialtyName: 'Droit Privé en Arabe (القانون الخاص باللغة العربية)',
    semester: 'S2',
  },
  {
    id: 'mod-7',
    nameFr: 'Droit International Privé & Arbitrage Commercial',
    nameAr: 'القانون الدولي الخاص والتحكيم التجاري',
    facultyCode: 'droit',
    specialtyName: 'Droit des Affaires, Banque & Contentieux (Master)',
    semester: 'Master',
  },

  // Économie & Gestion (FSEG)
  {
    id: 'mod-8',
    nameFr: 'Microéconomie : Théorie du Consommateur & du Producteur',
    nameAr: 'الاقتصاد الجزئي : نظرية المستهلك والمنتج',
    facultyCode: 'economie',
    specialtyName: 'Sciences Économiques & Gestion (Tronc Commun SEG)',
    semester: 'S1',
  },
  {
    id: 'mod-9',
    nameFr: 'Macroéconomie Monétaire & Financière',
    nameAr: 'الاقتصاد الكلي النقدي والمالي',
    facultyCode: 'economie',
    specialtyName: 'Sciences Économiques & Gestion (Tronc Commun SEG)',
    semester: 'S2',
  },
  {
    id: 'mod-10',
    nameFr: 'Comptabilité Générale & Analytique d\'Exploitation',
    nameAr: 'المحاسبة العامة والتحليلية',
    facultyCode: 'economie',
    specialtyName: 'Gestion Financière & Comptable (GFC)',
    semester: 'S1',
  },
  {
    id: 'mod-11',
    nameFr: 'Management & Théorie des Organisations',
    nameAr: 'علم التدبير ونظريات التنظيم',
    facultyCode: 'economie',
    specialtyName: 'Sciences Économiques & Gestion (Tronc Commun SEG)',
    semester: 'S1',
  },
  {
    id: 'mod-12',
    nameFr: 'Finance d\'Entreprise & Analyse des Ratios',
    nameAr: 'مالية الشركات والتحليل المالي',
    facultyCode: 'economie',
    specialtyName: 'Finance, Banque & Marchés des Capitaux (Master)',
    semester: 'S3',
  },
  {
    id: 'mod-13',
    nameFr: 'Marketing Stratégique & Digital',
    nameAr: 'التسويق الاستراتيجي والرقمي',
    facultyCode: 'economie',
    specialtyName: 'Marketing & Commerce International',
    semester: 'S4',
  },

  // Sciences & Technologies (FS / ENSA)
  {
    id: 'mod-14',
    nameFr: 'Algorithmique & Programmation C / Python',
    nameAr: 'الخوارزميات والبرمجة بلغة C وبايثون',
    facultyCode: 'sciences',
    specialtyName: 'Sciences Mathématiques & Informatique (SMI)',
    semester: 'S1',
  },
  {
    id: 'mod-15',
    nameFr: 'Analyse Mathématique & Algèbre Linéaire',
    nameAr: 'التحليل الرياضي والجبر الخطي',
    facultyCode: 'sciences',
    specialtyName: 'Sciences Mathématiques & Informatique (SMI)',
    semester: 'S1',
  },
  {
    id: 'mod-16',
    nameFr: 'Bases de Données Relationnelles & Modélisation SQL',
    nameAr: 'قواعد البيانات العلائقية ونمذجة SQL',
    facultyCode: 'sciences',
    specialtyName: 'Sciences Mathématiques & Informatique (SMI)',
    semester: 'S3',
  },
  {
    id: 'mod-17',
    nameFr: 'Génie Logiciel & Architectures Web Distribuées',
    nameAr: 'هندسة البرمجيات وبنيات الويب الموزعة',
    facultyCode: 'sciences',
    specialtyName: 'Génie Informatique & Cybersécurité (Cycle Ingénieur)',
    semester: 'Master',
  },
  {
    id: 'mod-18',
    nameFr: 'Électrostatique, Magnétostatique & Circuits Électriques',
    nameAr: 'الكهرباء الساكنة والمغناطيسية والدوائر الكهربائية',
    facultyCode: 'sciences',
    specialtyName: 'Sciences de la Matière Physique (SMP) & Chimie (SMC)',
    semester: 'S2',
  },
  {
    id: 'mod-19',
    nameFr: 'Intelligence Artificielle & Machine Learning',
    nameAr: 'الذكاء الاصطناعي وتطبيقات تعلم الآلة',
    facultyCode: 'sciences',
    specialtyName: 'Intelligence Artificielle, Big Data & Génie Logiciel (Master)',
    semester: 'Master',
  },

  // Médecine & Santé (FMP)
  {
    id: 'mod-20',
    nameFr: 'Anatomie Humaine Descriptive & Topographique',
    nameAr: 'التشريح البشري الوصفي والطبغرافي',
    facultyCode: 'medecine',
    specialtyName: 'Médecine Générale (Premier Cycle PCEM1 - PCEM2)',
    semester: 'S1',
  },
  {
    id: 'mod-21',
    nameFr: 'Physiologie Générale & Grands Systèmes',
    nameAr: 'علم وظائف الأعضاء العامة والأنظمة الحيوية',
    facultyCode: 'medecine',
    specialtyName: 'Médecine Générale (Premier Cycle PCEM1 - PCEM2)',
    semester: 'S2',
  },
  {
    id: 'mod-22',
    nameFr: 'Pharmacologie Fondamentale & Molécules Médicamenteuses',
    nameAr: 'علم الأدوية الأساسي والصيدلاني',
    facultyCode: 'medecine',
    specialtyName: 'Sciences Pharmaceutiques & Pharmacologie',
    semester: 'S4',
  },
  {
    id: 'mod-23',
    nameFr: 'Sémiologie Médicale & Examen Clinique',
    nameAr: 'السيميولوجيا السريرية والفحص الطبي',
    facultyCode: 'medecine',
    specialtyName: 'Médecine Clinique & Stages Hospitaliers (Deuxième Cycle)',
    semester: 'S3',
  },

  // Lettres & Sciences Humaines (FLSH)
  {
    id: 'mod-24',
    nameFr: 'النحو العربي والصرف وفقه اللغة',
    nameAr: 'النحو العربي والصرف وفقه اللغة',
    facultyCode: 'lettres',
    specialtyName: 'الدراسات العربية وآدابها (Langue & Littérature Arabe)',
    semester: 'S1',
  },
  {
    id: 'mod-25',
    nameFr: 'Linguistique Générale, Phonétique & Syntaxe',
    nameAr: 'اللسانيات العامة والصوتيات والتركيب',
    facultyCode: 'lettres',
    specialtyName: 'Études Françaises & Littérature Comparée',
    semester: 'S2',
  },
  {
    id: 'mod-26',
    nameFr: 'Histoire du Maroc & Pensée Méditerranéenne',
    nameAr: 'تاريخ المغرب والفكر المتوسطي',
    facultyCode: 'lettres',
    specialtyName: 'Histoire, Géographie & Patrimoine National',
    semester: 'S1',
  },

  // Théologie & Oussoul Eddine (FOE)
  {
    id: 'mod-27',
    nameFr: 'علوم القرآن الكريم والتفسير ومناهجه',
    nameAr: 'علوم القرآن الكريم والتفسير ومناهجه',
    facultyCode: 'theologie',
    specialtyName: 'Sciences du Coran & du Hadith (علوم القرآن والحديث)',
    semester: 'S1',
  },
  {
    id: 'mod-28',
    nameFr: 'أصول الفقه ومقاصد الشريعة الإسلامية',
    nameAr: 'أصول الفقه ومقاصد الشريعة الإسلامية',
    facultyCode: 'theologie',
    specialtyName: 'Charia, Fiqh & Maqasid (الفقه والأصول ومقاصد الشريعة)',
    semester: 'S3',
  },
  {
    id: 'mod-29',
    nameFr: 'فقه المعاملات المالية المعاصرة والنوازل',
    nameAr: 'فقه المعاملات المالية المعاصرة والنوازل',
    facultyCode: 'theologie',
    specialtyName: 'Master Études Coraniques & Nawaazil Contemporaines (Master)',
    semester: 'Master',
  },
];

/** Safe local storage read */
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

/** Safe local storage write */
function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
    return false;
  }
}

/** Broadcast update to other components */
function broadcastStructureChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('academic-structure-updated'));
  }
}

/**
 * Get all custom specialties added by professors or admins
 */
export function getStoredCustomSpecialties(): AcademicSpecialty[] {
  return safeGet<AcademicSpecialty[]>(STORAGE_KEYS.CUSTOM_SPECIALTIES, []);
}

/**
 * Save custom specialties list
 */
export function saveStoredCustomSpecialties(specialties: AcademicSpecialty[]): void {
  safeSet(STORAGE_KEYS.CUSTOM_SPECIALTIES, specialties);
  broadcastStructureChange();
}

/**
 * Get unified list of all academic specialties (Base + Custom)
 */
export function getAllSpecialties(): AcademicSpecialty[] {
  const custom = getStoredCustomSpecialties();
  const existingNames = new Set(SPECIALTIES_DATABASE.map((s) => s.nameFr.toLowerCase().trim()));

  // Filter custom to avoid duplicates
  const uniqueCustom = custom.filter(
    (c) => !existingNames.has(c.nameFr.toLowerCase().trim())
  );

  return [...SPECIALTIES_DATABASE, ...uniqueCustom];
}

/**
 * Add a new academic specialty dynamically from professor or admin interface
 */
export function addCustomSpecialty(
  specialtyData: Omit<AcademicSpecialty, 'id'> & { id?: string }
): AcademicSpecialty {
  const currentList = getStoredCustomSpecialties();
  const trimmedName = specialtyData.nameFr.trim();

  // Check if already exists in base or custom
  const existingInBase = SPECIALTIES_DATABASE.find(
    (s) => s.nameFr.toLowerCase().trim() === trimmedName.toLowerCase()
  );
  if (existingInBase) {
    return existingInBase;
  }

  const existingInCustom = currentList.find(
    (s) => s.nameFr.toLowerCase().trim() === trimmedName.toLowerCase()
  );
  if (existingInCustom) {
    return existingInCustom;
  }

  const newSpecialty: AcademicSpecialty = {
    id: specialtyData.id || `sp-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    facultyCode: specialtyData.facultyCode || 'FSJP',
    nameFr: trimmedName,
    nameAr: specialtyData.nameAr?.trim() || trimmedName,
    cycle: specialtyData.cycle || 'Licence',
    isCustom: true,
    createdBy: specialtyData.createdBy || 'Professeur',
    createdAt: specialtyData.createdAt || new Date().toISOString(),
  };

  const updated = [newSpecialty, ...currentList];
  saveStoredCustomSpecialties(updated);
  return newSpecialty;
}

/**
 * Get all custom modules added by professors or admins
 */
export function getStoredCustomModules(): AcademicModule[] {
  return safeGet<AcademicModule[]>(STORAGE_KEYS.CUSTOM_MODULES, []);
}

/**
 * Save custom modules list
 */
export function saveStoredCustomModules(modules: AcademicModule[]): void {
  safeSet(STORAGE_KEYS.CUSTOM_MODULES, modules);
  broadcastStructureChange();
}

/**
 * Get unified list of all modules / units (Base + Custom)
 */
export function getAllModules(): AcademicModule[] {
  const custom = getStoredCustomModules();
  const existingNames = new Set(INITIAL_MODULES_DATABASE.map((m) => m.nameFr.toLowerCase().trim()));

  const uniqueCustom = custom.filter(
    (c) => !existingNames.has(c.nameFr.toLowerCase().trim())
  );

  return [...INITIAL_MODULES_DATABASE, ...uniqueCustom];
}

/**
 * Add a new academic module dynamically from professor or admin interface
 */
export function addCustomModule(
  moduleData: Omit<AcademicModule, 'id'> & { id?: string }
): AcademicModule {
  const currentList = getStoredCustomModules();
  const trimmedName = moduleData.nameFr.trim();

  // Check if exists in initial or custom
  const existingInBase = INITIAL_MODULES_DATABASE.find(
    (m) => m.nameFr.toLowerCase().trim() === trimmedName.toLowerCase()
  );
  if (existingInBase) {
    return existingInBase;
  }

  const existingInCustom = currentList.find(
    (m) => m.nameFr.toLowerCase().trim() === trimmedName.toLowerCase()
  );
  if (existingInCustom) {
    return existingInCustom;
  }

  const newModule: AcademicModule = {
    id: moduleData.id || `mod-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    nameFr: trimmedName,
    nameAr: moduleData.nameAr?.trim() || trimmedName,
    facultyCode: moduleData.facultyCode || 'droit',
    specialtyName: moduleData.specialtyName,
    semester: moduleData.semester || 'S1',
    isCustom: true,
    createdBy: moduleData.createdBy || 'Professeur',
    createdAt: moduleData.createdAt || new Date().toISOString(),
  };

  const updated = [newModule, ...currentList];
  saveStoredCustomModules(updated);
  return newModule;
}

/**
 * Helper to ensure both specialty and module are permanently registered
 * in the application structure when a book or professor profile is saved.
 */
export function registerDynamicAcademicUnit({
  specialtyName,
  specialtyNameAr,
  moduleName,
  moduleNameAr,
  facultyCode,
  semester,
  cycle,
  createdBy,
}: {
  specialtyName?: string;
  specialtyNameAr?: string;
  moduleName?: string;
  moduleNameAr?: string;
  facultyCode?: string;
  semester?: string;
  cycle?: 'Licence' | 'Master' | 'Doctorat' | 'Ingénieur' | 'Médecine';
  createdBy?: string;
}): { specialty?: AcademicSpecialty; module?: AcademicModule } {
  let createdSpecialty: AcademicSpecialty | undefined = undefined;
  let createdModule: AcademicModule | undefined = undefined;

  if (specialtyName && specialtyName.trim().length > 1) {
    createdSpecialty = addCustomSpecialty({
      facultyCode: facultyCode || 'FSJP',
      nameFr: specialtyName.trim(),
      nameAr: specialtyNameAr?.trim() || specialtyName.trim(),
      cycle: cycle || 'Licence',
      createdBy: createdBy || 'Professeur',
    });
  }

  if (moduleName && moduleName.trim().length > 1) {
    createdModule = addCustomModule({
      nameFr: moduleName.trim(),
      nameAr: moduleNameAr?.trim() || moduleName.trim(),
      facultyCode: facultyCode || 'droit',
      specialtyName: specialtyName?.trim(),
      semester: semester || 'S1',
      createdBy: createdBy || 'Professeur',
    });
  }

  return { specialty: createdSpecialty, module: createdModule };
}

/**
 * React Hook to access reactive, dynamically updating specialties and modules
 */
export function useAcademicStructure() {
  const [specialties, setSpecialties] = useState<AcademicSpecialty[]>(() => getAllSpecialties());
  const [modules, setModules] = useState<AcademicModule[]>(() => getAllModules());

  useEffect(() => {
    const handleUpdate = () => {
      setSpecialties(getAllSpecialties());
      setModules(getAllModules());
    };

    window.addEventListener('academic-structure-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('academic-structure-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    specialties,
    modules,
    addSpecialty: addCustomSpecialty,
    addModule: addCustomModule,
    registerUnit: registerDynamicAcademicUnit,
  };
}
