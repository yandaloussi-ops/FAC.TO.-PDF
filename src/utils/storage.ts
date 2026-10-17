/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Professor, StudentProfile, PaymentOrder, AdminCommercialAccount } from '../types';
import {
  MOCK_BOOKS,
  INITIAL_PROFESSORS,
  initialStudentProfile,
  INITIAL_ADMIN_COMMERCIAL_ACCOUNT,
  INITIAL_PAYMENT_ORDERS,
} from '../data/mockBooks';

// Official Application Gmail Address
export const PLATFORM_GMAIL = 'fac.en.pdf.maroc@gmail.com';

// Keys for localStorage
const KEYS = {
  BOOKS: 'fac_en_pdf_books',
  PROFESSORS: 'fac_en_pdf_professors',
  STUDENTS: 'fac_en_pdf_students',
  CURRENT_STUDENT: 'fac_en_pdf_current_student',
  ADMIN_PIN: 'fac_en_pdf_admin_pin',
  ADMIN_RECOVERY_EMAIL: 'fac_en_pdf_admin_recovery_email',
  ADMIN_ACCOUNT: 'fac_en_pdf_admin_account',
  PAYMENT_ORDERS: 'fac_en_pdf_payment_orders',
};

// Default Private Admin PIN (strictly unexposed in UI, changeable by Admin only)
const DEFAULT_PRIVATE_ADMIN_PIN = 'FAC-Admin@2026';

/** Safe local storage read with fallback */
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

/**
 * Generate a beautiful standalone SVG Data URL cover when no image is uploaded
 * or when an image fails to load.
 */
export function generateDefaultCoverSvg(title: string, author: string, facultyCode: string = 'droit'): string {
  const cleanTitle = (title || 'Manuel Universitaire').slice(0, 50);
  const cleanAuthor = (author || 'Professeur Universitaire').slice(0, 40);

  let bgGradientStart = '#1e1b4b'; // Indigo
  let bgGradientEnd = '#0f172a';
  let accentColor = '#38bdf8';
  let badgeLabel = 'FACULTÉ';

  if (facultyCode.includes('droit')) {
    bgGradientStart = '#451a03'; // Amber/Dark Brown
    bgGradientEnd = '#1c1917';
    accentColor = '#f59e0b';
    badgeLabel = 'DROIT & SCIENCES JURIDIQUES';
  } else if (facultyCode.includes('eco')) {
    bgGradientStart = '#064e3b'; // Emerald
    bgGradientEnd = '#022c22';
    accentColor = '#10b981';
    badgeLabel = 'ÉCONOMIE & GESTION';
  } else if (facultyCode.includes('med')) {
    bgGradientStart = '#881337'; // Rose
    bgGradientEnd = '#4c0519';
    accentColor = '#f43f5e';
    badgeLabel = 'MÉDECINE & PHARMACIE';
  } else if (facultyCode.includes('sci')) {
    bgGradientStart = '#1e3a8a'; // Blue
    bgGradientEnd = '#0f172a';
    accentColor = '#60a5fa';
    badgeLabel = 'SCIENCES & TECHNOLOGIES';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradientStart}"/>
        <stop offset="100%" stop-color="${bgGradientEnd}"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    </defs>
    <rect width="400" height="560" fill="url(#bg)"/>
    <rect x="20" y="20" width="360" height="520" rx="8" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2"/>
    <rect x="28" y="28" width="344" height="504" rx="4" fill="none" stroke="${accentColor}" stroke-opacity="0.15" stroke-width="1"/>
    
    <!-- Spine binding ornament -->
    <rect x="0" y="0" width="16" height="560" fill="#000000" fill-opacity="0.25"/>
    <line x1="16" y1="0" x2="16" y2="560" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1"/>

    <!-- Header badge -->
    <rect x="40" y="45" width="320" height="28" rx="6" fill="#000000" fill-opacity="0.4"/>
    <text x="200" y="63" fill="${accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" letter-spacing="2" text-anchor="middle">${badgeLabel}</text>

    <!-- University mark -->
    <circle cx="200" cy="130" r="32" fill="${accentColor}" fill-opacity="0.1" stroke="${accentColor}" stroke-width="1.5"/>
    <polygon points="200,110 215,138 185,138" fill="none" stroke="${accentColor}" stroke-width="2"/>
    <circle cx="200" cy="132" r="3" fill="${accentColor}"/>

    <!-- Book Title -->
    <foreignObject x="40" y="180" width="320" height="170">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #ffffff; font-family: system-ui, -apple-system, sans-serif; font-size: 20px; font-weight: 800; line-height: 1.3; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
        ${cleanTitle}
      </div>
    </foreignObject>

    <line x1="80" y1="365" x2="320" y2="365" stroke="url(#gold)" stroke-width="2"/>

    <!-- Author & Edition -->
    <text x="200" y="405" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">${cleanAuthor}</text>
    <text x="200" y="430" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle">Édition Académique Universitaire</text>

    <!-- DRM Seal Badge -->
    <rect x="110" y="480" width="180" height="26" rx="13" fill="#000000" fill-opacity="0.6" stroke="#10b981" stroke-width="1"/>
    <circle cx="125" cy="493" r="4" fill="#10b981"/>
    <text x="205" y="497" fill="#6ee7b7" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="bold" text-anchor="middle">FAC EN PDF · DRM IN-APP</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// 1. Books Storage
export const getStoredBooks = (): Book[] => {
  const stored = safeGet<Book[] | null>(KEYS.BOOKS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    // Ensure all mock books have non-empty valid covers and public prices
    const enhancedMocks = MOCK_BOOKS.map((b) => ({
      ...b,
      publicPriceMAD: b.publicPriceMAD || (b.isFree ? 0 : Math.round(b.priceMAD * 1.5)),
      coverImage: b.coverImage.startsWith('/src/')
        ? b.coverImage.replace('/src/', '/')
        : b.coverImage,
    }));
    safeSet(KEYS.BOOKS, enhancedMocks);
    return enhancedMocks;
  }
  return stored;
};

export const saveStoredBooks = (books: Book[]): void => {
  // Strip temporary blob: URLs from persistent localStorage to avoid stale revokes
  const cleanBooks = books.map((b) => ({
    ...b,
    pdfUrl: b.pdfUrl && b.pdfUrl.startsWith('blob:') ? undefined : b.pdfUrl,
  }));

  const saved = safeSet(KEYS.BOOKS, cleanBooks);
  if (!saved) {
    // Graceful fallback if localStorage quota exceeded: compress large base64 covers
    const optimized = cleanBooks.map((b) => ({
      ...b,
      coverImage:
        b.coverImage && b.coverImage.startsWith('data:image') && b.coverImage.length > 30000
          ? generateDefaultCoverSvg(b.title, b.author, b.faculty)
          : b.coverImage,
    }));
    safeSet(KEYS.BOOKS, optimized);
  }
};


// 2. Professors Storage
export const getStoredProfessors = (): Professor[] => {
  const stored = safeGet<Professor[] | null>(KEYS.PROFESSORS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const withPins: Professor[] = (INITIAL_PROFESSORS as Professor[]).map((p) => ({
      ...p,
      pinCode: p.pinCode || '123456',
      status: (p.status || 'active') as 'active' | 'suspended',
    }));
    safeSet(KEYS.PROFESSORS, withPins);
    return withPins;
  }
  return stored;
};

export const saveStoredProfessors = (professors: Professor[]): void => {
  safeSet(KEYS.PROFESSORS, professors);
};

// 3. Students Storage
export const getStoredStudents = (): StudentProfile[] => {
  const stored = safeGet<StudentProfile[] | null>(KEYS.STUDENTS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    const initialList: StudentProfile[] = [
      {
        ...initialStudentProfile,
        pinCode: '123456',
        status: 'active',
      },
    ];
    safeSet(KEYS.STUDENTS, initialList);
    return initialList;
  }
  return stored.map((s) => ({
    ...s,
    acquiredBookIds: Array.isArray(s.acquiredBookIds) ? s.acquiredBookIds : [],
    bookProgress: s.bookProgress && typeof s.bookProgress === 'object' ? s.bookProgress : {},
  }));
};

export const saveStoredStudents = (students: StudentProfile[]): void => {
  safeSet(KEYS.STUDENTS, students);
};

export const getStoredCurrentStudent = (): StudentProfile => {
  const stored = safeGet<StudentProfile | null>(KEYS.CURRENT_STUDENT, null);
  if (!stored) {
    const defaultStudent: StudentProfile = {
      ...initialStudentProfile,
      pinCode: '123456',
      status: 'active',
    };
    safeSet(KEYS.CURRENT_STUDENT, defaultStudent);
    return defaultStudent;
  }
  return {
    ...initialStudentProfile,
    ...stored,
    acquiredBookIds: Array.isArray(stored.acquiredBookIds)
      ? stored.acquiredBookIds
      : initialStudentProfile.acquiredBookIds,
    bookProgress: stored.bookProgress && typeof stored.bookProgress === 'object' ? stored.bookProgress : {},
  };
};

export const saveStoredCurrentStudent = (student: StudentProfile): void => {
  safeSet(KEYS.CURRENT_STUDENT, student);
};

// Aliases for cleaner consumer APIs
export const getStoredStudent = getStoredCurrentStudent;
export const saveStoredStudent = saveStoredCurrentStudent;
export const getStoredRegisteredStudents = getStoredStudents;
export const saveStoredRegisteredStudents = saveStoredStudents;

// 4. Admin PIN & Recovery Management (Secure, non-public)
export const getStoredAdminPin = (): string => {
  if (typeof window === 'undefined') return DEFAULT_PRIVATE_ADMIN_PIN;
  try {
    const pin = localStorage.getItem(KEYS.ADMIN_PIN);
    if (!pin) {
      localStorage.setItem(KEYS.ADMIN_PIN, DEFAULT_PRIVATE_ADMIN_PIN);
      return DEFAULT_PRIVATE_ADMIN_PIN;
    }
    return pin;
  } catch {
    return DEFAULT_PRIVATE_ADMIN_PIN;
  }
};

export const saveStoredAdminPin = (newPin: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(KEYS.ADMIN_PIN, newPin);
    return true;
  } catch {
    return false;
  }
};

export const getStoredAdminRecoveryEmail = (): string => {
  if (typeof window === 'undefined') return PLATFORM_GMAIL;
  try {
    return localStorage.getItem(KEYS.ADMIN_RECOVERY_EMAIL) || PLATFORM_GMAIL;
  } catch {
    return PLATFORM_GMAIL;
  }
};

export const saveStoredAdminRecoveryEmail = (email: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.ADMIN_RECOVERY_EMAIL, email);
  } catch {
    // Ignore
  }
};

// 5. Commercial & Payment Orders Storage
export const getStoredAdminAccount = (): AdminCommercialAccount => {
  return safeGet<AdminCommercialAccount>(KEYS.ADMIN_ACCOUNT, INITIAL_ADMIN_COMMERCIAL_ACCOUNT);
};

export const saveStoredAdminAccount = (account: AdminCommercialAccount): void => {
  safeSet(KEYS.ADMIN_ACCOUNT, account);
};

export const getStoredPaymentOrders = (): PaymentOrder[] => {
  return safeGet<PaymentOrder[]>(KEYS.PAYMENT_ORDERS, INITIAL_PAYMENT_ORDERS);
};

export const saveStoredPaymentOrders = (orders: PaymentOrder[]): void => {
  safeSet(KEYS.PAYMENT_ORDERS, orders);
};
