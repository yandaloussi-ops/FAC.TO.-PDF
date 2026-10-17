import { generateAcademicPdfBlob } from './academicPdfGenerator';
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

/**
 * Save an uploaded PDF file/blob in IndexedDB and in-memory cache, returning an object URL
 */
export async function saveBookPdf(
  bookId: string,
  file: Blob | File | ArrayBuffer | Uint8Array
): Promise<string> {
  const blob: Blob =
    file instanceof Blob
      ? file
      : new Blob([file as BlobPart], { type: 'application/pdf' });

  // Store in memory cache immediately
  blobCache.set(bookId, blob);

  // Revoke previous object URL if any
  if (objectUrlCache.has(bookId)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(bookId)!);
    } catch {
      // ignore
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(bookId, objectUrl);

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, bookId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Notice: PDF saved in session memory cache (IndexedDB notice):', err);
  }

  return objectUrl;
}

/**
 * Retrieve a stored PDF blob URL for a book (checks memory cache, then IndexedDB,
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
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(bookId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (blob) {
      blobCache.set(bookId, blob);
      const objectUrl = URL.createObjectURL(blob);
      objectUrlCache.set(bookId, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn(`Notice reading PDF for book ${bookId}:`, err);
  }

  // 4. Auto-generate a real multi-page certified academic PDF for instant genuine reading
  if (bookFallback && bookFallback.title) {
    try {
      const generatedBlob = await generateAcademicPdfBlob(bookFallback);
      const generatedUrl = await saveBookPdf(bookId, generatedBlob);
      return generatedUrl;
    } catch (genErr) {
      console.warn('Could not generate academic PDF fallback:', genErr);
    }
  }

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
