/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Vercel Serverless Function: /api/get-book-access
 * Strict Server-Side DRM Authorization & Protected PDF Delivery
 */

export const config = {
  runtime: 'edge',
};

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'fac-en-pdf';
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'fac-en-pdf.firebasestorage.app';
const ADMIN_SECRET = process.env.ADMIN_PIN || 'FAC-Admin@2026';

// Known hardcoded private storage mappings as high-speed serverless fallback
const STATIC_BOOK_FILES: Record<string, string> = {
  'book-prof-1793748053309': 'books/pdfs/1793748053367_%D9%83%D8%AA%D8%A7%D8%A8_%D9%85%D8%A8%D8%A7%D8%AD%D8%AB_%D9%81%D9%8A_%D8%B9%D9%84%D9%85_%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9_%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%8A_A5%20(3).pdf',
  'book-prof-1794164335508': 'books/pdfs/1794164335583_%D9%85%D8%A8%D8%A7%D8%AD%D8%AB_%D9%81%D9%8A_%D8%A7%D9%84%D8%B9%D9%84%D9%88%D9%85_%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B3%D9%8A%D8%A9_%D9%85%D9%86%D9%82%D8%AD_A5.docx.pdf',
};

async function handleRequest(request: Request): Promise<Response> {
  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-student-email, x-student-phone, x-student-id, x-drm-key, x-admin-pin',
      },
    });
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 1. Extract Query / Header Parameters
    const bookId = searchParams.get('bookId') || '';
    const studentEmail = (request.headers.get('x-student-email') || searchParams.get('email') || '').trim().toLowerCase();
    const studentPhone = (request.headers.get('x-student-phone') || searchParams.get('phone') || '').replace(/\D/g, '');
    const drmKey = (request.headers.get('x-drm-key') || searchParams.get('key') || '').trim().toUpperCase();
    const authHeader = request.headers.get('authorization') || '';
    const adminPinHeader = request.headers.get('x-admin-pin') || '';

    if (!bookId) {
      return new Response(JSON.stringify({ error: 'Missing bookId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Server-Side Entitlement Check
    let isAuthorized = false;
    let authReason = '';

    // Check A: Super Admin Bypass
    const isTokenMatch = authHeader === `Bearer ${ADMIN_SECRET}` || adminPinHeader === ADMIN_SECRET || searchParams.get('adminPin') === ADMIN_SECRET;
    if (isTokenMatch) {
      isAuthorized = true;
      authReason = 'SUPER_ADMIN_VERIFIED';
    }

    // Check B: Query Firestore 'drm_keys' server-to-server for verified active status
    if (!isAuthorized) {
      if (studentEmail || studentPhone || drmKey) {
        try {
          const firestoreRes = await fetch(
            `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/drm_keys`,
            { headers: { 'Accept': 'application/json' } }
          );

          if (firestoreRes.ok) {
            const data: any = await firestoreRes.json();
            const docs = data.documents || [];

            for (const d of docs) {
              const f = d.fields || {};
              const kStatus = f.status?.stringValue || '';
              const kBookId = f.bookId?.stringValue || '';
              const kEmail = (f.studentEmail?.stringValue || '').trim().toLowerCase();
              const kPhone = (f.studentPhone?.stringValue || '').replace(/\D/g, '');
              const kKey = (f.key?.stringValue || f.code?.stringValue || d.name.split('/').pop() || '').trim().toUpperCase();

              if (kStatus !== 'active') continue;
              if (kBookId !== bookId) continue;

              // Check if matching email, phone or individual DRM key
              if (studentEmail && kEmail && studentEmail === kEmail && studentEmail !== 'etudiant@univ.ac.ma') {
                isAuthorized = true;
                authReason = `STUDENT_EMAIL_MATCH (${studentEmail})`;
                break;
              }
              if (studentPhone && studentPhone.length >= 8 && kPhone && studentPhone === kPhone) {
                isAuthorized = true;
                authReason = `STUDENT_PHONE_MATCH (${studentPhone})`;
                break;
              }
              if (drmKey && kKey && drmKey === kKey) {
                isAuthorized = true;
                authReason = `DRM_KEY_MATCH (${drmKey})`;
                break;
              }
            }
          }
        } catch (dbErr) {
          console.error('Error verifying entitlement from Firestore:', dbErr);
        }
      }
    }

    // If still unauthorized, block access immediately with 403 Forbidden
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          error: 'ACCESS_DENIED',
          message: 'Ce contenu est protégé par un verrou numérique DRM. Vous devez acquérir une licence nominative pour consulter ce cours.',
          messageAr: 'هذا المحتوى محمي برخصة رقمية DRM. يلزم تسجيل حسابك الطلابي واقتناء ترخيص رسمي لمطالعة هذا المقرر.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 3. Resolve Private Storage Path from Server Collection 'book_files'
    let storagePath = STATIC_BOOK_FILES[bookId] || '';

    try {
      const bookFileRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/book_files/${bookId}`
      );
      if (bookFileRes.ok) {
        const docData: any = await bookFileRes.json();
        const p = docData.fields?.storagePath?.stringValue;
        if (p) storagePath = p;
      }
    } catch (bfErr) {
      console.warn('Notice reading book_files from Firestore:', bfErr);
    }

    if (!storagePath) {
      return new Response(JSON.stringify({ error: 'FILE_NOT_FOUND', message: 'Fichier PDF introuvable pour ce cours.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 4. Fetch the private file directly server-to-server from Firebase Storage
    const encodedPath = encodeURIComponent(storagePath).replace(/%2F/g, '%2F');
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;

    const upstream = await fetch(storageUrl);
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'UPSTREAM_STORAGE_ERROR', status: upstream.status }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 5. Stream Secure PDF Response with STRICT no-store headers (never cached)
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/pdf');
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Content-Disposition', `inline; filename="academic_${bookId}.pdf"`);
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-DRM-Auth', authReason);

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('Serverless access error:', err);
    return new Response(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Universal Handler: Seamlessly supports both Vercel Edge Runtime & Node.js Serverless Runtime
export default async function handler(req: any, res?: any) {
  // If running in Node.js serverless environment (req, res):
  if (res && typeof res.status === 'function') {
    try {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
      const url = `${proto}://${host}${req.url}`;
      
      const headers = new Headers();
      for (const [k, v] of Object.entries(req.headers)) {
        if (v !== undefined) {
          headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
        }
      }

      const webReq = new Request(url, {
        method: req.method,
        headers,
      });

      const webRes = await handleRequest(webReq);
      res.status(webRes.status);
      webRes.headers.forEach((val, name) => {
        res.setHeader(name, val);
      });

      const arrayBuffer = await webRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    } catch (adapterErr: any) {
      console.error('Node serverless adapter error:', adapterErr);
      res.status(500).json({ error: 'SERVERLESS_ADAPTER_ERROR', message: adapterErr?.message });
      return;
    }
  }

  // Running in Vercel Edge Runtime:
  return handleRequest(req as Request);
}
