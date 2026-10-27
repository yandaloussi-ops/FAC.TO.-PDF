import { PDFDocument } from 'pdf-lib';
import { Book } from '../types';

/**
 * IndexedDB and Blob storage manager for real uploaded PDF documents and covers
 * Prevents localStorage QuotaExceededError and provides high-performance binary storage
 */

const DB_NAME = 'FacEnPdf_DB';
const DB_VERSION = 1;
const STORE_NAME = 'book_pdfs';

// In-memory cache of Blobs for fast access & private browsing fallback
const blobCache = new Map<string, Blob>();
// In-memory cache of active Object URLs
const objectUrlCache = new Map<string, string>();

/**
 * Read the actual page count of an uploaded PDF file or blob using pdf-lib
 */
export async function getPdfPageCount(fileOrBlob: Blob | File | ArrayBuffer): Promise<number | null> {
  try {
    const arrayBuffer =
      fileOrBlob instanceof ArrayBuffer
        ? fileOrBlob
        : await (fileOrBlob as Blob).arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const count = pdfDoc.getPageCount();
    return count > 0 ? count : null;
  } catch (err) {
    console.warn('Notice extracting PDF page count via pdf-lib:', err);
    return null;
  }
}

/**
 * Purge legacy auto-generated French placeholders from previous runs
 * This ensures that authentic Arabic content and real PDF uploads take precedence
 */
const PURGE_KEY = 'fac_purged_french_placeholders_v4';
export async function purgeLegacyFrenchPlaceholders(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (!localStorage.getItem(PURGE_KEY)) {
      await deleteBookPdf('book-science-politique');
      localStorage.removeItem('fac_pdf_b64_book-science-politique');
      localStorage.setItem(PURGE_KEY, 'true');
    }
  } catch (err) {
    console.warn('Notice purging legacy placeholder:', err);
  }
}

// Auto-run purge on script load
if (typeof window !== 'undefined') {
  purgeLegacyFrenchPlaceholders().catch(() => {});
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const parts = base64.split(';base64,');
  const raw = window.atob(parts.length > 1 ? parts[1] : parts[0]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: mimeType });
}

/**
 * Save an uploaded PDF file/blob in IndexedDB (as ArrayBuffer) and memory cache, with base64 localStorage fallback
 */
export async function saveBookPdf(
  bookId: string,
  file: Blob | File | ArrayBuffer | Uint8Array
): Promise<string> {
  let blob: Blob;
  let arrayBuffer: ArrayBuffer;

  if (file instanceof Blob) {
    blob = file;
    arrayBuffer = await file.arrayBuffer();
  } else if (file instanceof ArrayBuffer) {
    arrayBuffer = file;
    blob = new Blob([file], { type: 'application/pdf' });
  } else {
    arrayBuffer = file.buffer as ArrayBuffer;
    blob = new Blob([file as BlobPart], { type: 'application/pdf' });
  }

  // 1. Store in memory cache immediately
  blobCache.set(bookId, blob);

  // 2. Revoke previous object URL if any
  if (objectUrlCache.has(bookId)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(bookId)!);
    } catch {
      // ignore
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(bookId, objectUrl);

  // 3. Store in persistent IndexedDB as ArrayBuffer (avoids DataCloneError across browsers)
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(arrayBuffer, bookId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Notice: PDF stored in memory, IndexedDB error:', err);
  }

  // 4. Safe base64 fallback in localStorage for persistence across iframes/reloads (< 4.5MB)
  try {
    if (blob.size < 4.5 * 1024 * 1024) {
      const base64 = await blobToBase64(blob);
      localStorage.setItem(`fac_pdf_b64_${bookId}`, base64);
    }
  } catch {
    // Quota reached, ignore
  }

  return objectUrl;
}

/**
 * Retrieve a stored PDF blob URL for a book (checks memory cache, IndexedDB, localStorage fallback,
 * or auto-generates a certified academic multi-page PDF if book data is provided)
 */
export async function loadBookPdf(
  bookId: string,
  bookFallback?: Partial<Book>
): Promise<string | null> {
  // 1. Check in-memory object URL cache
  if (objectUrlCache.has(bookId)) {
    return objectUrlCache.get(bookId)!;
  }

  // 2. Check in-memory Blob cache
  if (blobCache.has(bookId)) {
    const blob = blobCache.get(bookId)!;
    const objectUrl = URL.createObjectURL(blob);
    objectUrlCache.set(bookId, objectUrl);
    return objectUrl;
  }

  // 3. Check persistent IndexedDB
  try {
    const db = await openDb();
    const stored = await new Promise<ArrayBuffer | Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(bookId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (stored) {
      const blob = stored instanceof Blob ? stored : new Blob([stored], { type: 'application/pdf' });
      blobCache.set(bookId, blob);
      const objectUrl = URL.createObjectURL(blob);
      objectUrlCache.set(bookId, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn(`Notice reading PDF for book ${bookId} from IndexedDB:`, err);
  }

  // 4. Check localStorage base64 fallback
  try {
    const b64 = localStorage.getItem(`fac_pdf_b64_${bookId}`);
    if (b64) {
      const blob = base64ToBlob(b64, 'application/pdf');
      blobCache.set(bookId, blob);
      const objectUrl = URL.createObjectURL(blob);
      objectUrlCache.set(bookId, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn(`Notice reading PDF from localStorage for ${bookId}:`, err);
  }

  // 5. Existing valid external or data URL (if uploaded by admin/prof or set)
  if (bookFallback?.pdfUrl && (bookFallback.pdfUrl.startsWith('data:') || bookFallback.pdfUrl.startsWith('http') || bookFallback.pdfUrl.startsWith('blob:'))) {
    return bookFallback.pdfUrl;
  }

  // Do not generate artificial French placeholders. Return null so the genuine Arabic academic chapters
  // or the prominent upload interface are presented clearly to the user.
  return null;
}

/**
 * Check if a PDF exists for this book in memory or IndexedDB
 */
export async function hasBookPdf(bookId: string): Promise<boolean> {
  if (blobCache.has(bookId) || objectUrlCache.has(bookId)) return true;
  try {
    const db = await openDb();
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(bookId);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Delete a PDF from storage
 */
export async function deleteBookPdf(bookId: string): Promise<void> {
  if (objectUrlCache.has(bookId)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(bookId)!);
    } catch {}
    objectUrlCache.delete(bookId);
  }
  blobCache.delete(bookId);

  try {
    localStorage.removeItem(`fac_pdf_b64_${bookId}`);
  } catch {}

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(bookId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Error deleting PDF for book ${bookId}:`, err);
  }
}

/**
 * Downscale and compress an uploaded cover image file to prevent localStorage overflow
 */
export function compressCoverImage(file: File, maxWidth = 500, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => {
        resolve((e.target?.result as string) || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
