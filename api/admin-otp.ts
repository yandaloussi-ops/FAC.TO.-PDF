import tls from 'tls';

// Official Platform Admin Email for OTP and Notifications
export const PLATFORM_ADMIN_EMAIL = 'fac.en.pdf.maroc@gmail.com';
const GMAIL_USER = process.env.GMAIL_USER || 'fac.en.pdf.maroc@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASS || 'waaxokvmglrbwkze').replace(/\s+/g, '');
const SECRET_SALT = process.env.ADMIN_OTP_SECRET || 'FAC-OTP-SECURE-SALT-2026-ANDALOUSSI';

// Direct Google SMTP Email Sender (Zero external npm dependencies)
function sendGmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com');
    socket.setEncoding('utf8');

    const commands = [
      'EHLO localhost',
      'AUTH LOGIN',
      Buffer.from(GMAIL_USER).toString('base64'),
      Buffer.from(GMAIL_PASS).toString('base64'),
      `MAIL FROM:<${GMAIL_USER}>`,
      `RCPT TO:<${to}>`,
      'DATA',
    ];

    let cmdIndex = 0;
    let finished = false;

    socket.on('data', (data: string) => {
      if (data.startsWith('5') || data.startsWith('4')) {
        finished = true;
        socket.end();
        return reject(new Error('SMTP Error: ' + data.trim()));
      }

      if (cmdIndex < commands.length) {
        socket.write(commands[cmdIndex] + '\r\n');
        cmdIndex++;
      } else if (data.startsWith('354')) {
        const rawMessage = [
          `From: "FAC en PDF - Administration" <${GMAIL_USER}>`,
          `To: <${to}>`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          Buffer.from(html).toString('base64'),
          '.',
          '',
        ].join('\r\n');
        socket.write(rawMessage);
      } else if (data.startsWith('250') && cmdIndex >= commands.length) {
        finished = true;
        socket.write('QUIT\r\n');
        socket.end();
        resolve(true);
      }
    });

    socket.on('error', (err) => {
      if (!finished) reject(err);
    });

    socket.on('close', () => {
      if (!finished) reject(new Error('SMTP connection closed unexpectedly'));
    });
  });
}

// Helper: HMAC SHA-256 for secure stateless OTP challenge verification
async function computeHash(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(request: Request) {
  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await request.json();
    const action = body.action; // 'send' | 'verify'

    // ACTION 1: SEND 6-DIGIT OTP DIRECTLY TO PLATFORM GMAIL
    if (action === 'send') {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const otp = (100000 + (randomBuffer[0] % 900000)).toString();

      // OTP validity: 10 minutes
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const signaturePayload = `${PLATFORM_ADMIN_EMAIL}:${otp}:${expiresAt}`;
      const token = await computeHash(signaturePayload, SECRET_SALT);
      const challenge = `${expiresAt}.${token}`;

      let emailSent = false;
      let emailError: string | null = null;

      try {
        await sendGmail({
          to: PLATFORM_ADMIN_EMAIL,
          subject: `🔐 رمز الدخول للوحة الإدارة: ${otp}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #fafaf9;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #111827; margin: 0;">بوابة الدخول الآمن للمشرف</h2>
                <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">منصة FAC en PDF للكتب الجامعية المحمية</p>
              </div>
              <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #374151; font-size: 14px; margin-bottom: 14px;">تم طلب رمز تحقق للدخول إلى لوحة الإدارة. رمز الأمان الخاص بك هو:</p>
                <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #b45309; background-color: #fef3c7; padding: 14px 28px; border-radius: 12px; display: inline-block; font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 14px;">صلاحية هذا الرمز: 10 دقائق فقط.</p>
              </div>
              <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">مرسل حصرياً إلى بريد الإدارة الرسمي.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err: any) {
        emailError = err?.message || 'SMTP sending error';
        emailSent = false;
      }

      if (!emailSent) {
        return new Response(
          JSON.stringify({
            success: false,
            emailSent: false,
            error: emailError || "Erreur d'envoi",
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          challenge,
          emailSent: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // ACTION 2: VERIFY OTP CHALLENGE
    if (action === 'verify') {
      const { otp, challenge } = body;
      if (!otp || !challenge) {
        return new Response(JSON.stringify({ success: false, message: 'Missing OTP or challenge' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const parts = String(challenge).split('.');
      if (parts.length !== 2) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid challenge' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const [expiresAtStr, token] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);

      if (isNaN(expiresAt) || Date.now() > expiresAt) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'انتهت صلاحية الرمز، يرجى طلب رمز جديد (Code expiré)',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      const signaturePayload = `${PLATFORM_ADMIN_EMAIL}:${String(otp).trim()}:${expiresAt}`;
      const expectedToken = await computeHash(signaturePayload, SECRET_SALT);

      if (token !== expectedToken) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'رمز التحقق غير صحيح، يرجى التأكد من الرمز المستلم (Code incorrect)',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      // Success
      return new Response(
        JSON.stringify({
          success: true,
          authenticatedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
