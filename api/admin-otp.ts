import { Resend } from 'resend';

// Strictly bound to the official Super Admin identity
export const SUPER_ADMIN_EMAIL = 'yandaloussi@uae.ac.ma';
const SECRET_SALT = process.env.ADMIN_OTP_SECRET || 'FAC-OTP-SECURE-SALT-2026-ANDALOUSSI';

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
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const config = {
  runtime: 'edge',
};

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

    // ACTION 1: SEND 6-DIGIT OTP EXCLUSIVELY TO SUPER ADMIN
    if (action === 'send') {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const otp = (100000 + (randomBuffer[0] % 900000)).toString();

      // OTP validity: 10 minutes
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const signaturePayload = `${SUPER_ADMIN_EMAIL}:${otp}:${expiresAt}`;
      const token = await computeHash(signaturePayload, SECRET_SALT);
      const challenge = `${expiresAt}.${token}`;

      let emailSent = false;
      let emailError: string | null = null;
      const resendApiKey = process.env.RESEND_API_KEY;

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: 'FAC en PDF - Sécurité <onboarding@resend.dev>',
            to: [SUPER_ADMIN_EMAIL],
            subject: 'رمز الدخول السري للوحة الإدارة - FAC en PDF',
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #fafaf9;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #1c1917; margin: 0;">بوابة الدخول الآمن للمشرف العام</h2>
                  <p style="color: #78716c; font-size: 13px; margin: 4px 0 0;">منصة FAC en PDF للكتب الجامعية المحمية</p>
                </div>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e7e5e4; text-align: center;">
                  <p style="color: #44403c; font-size: 14px; margin-bottom: 12px;">مرحباً الأستاذ ياسين الأندلسي، تم طلب تسجيل الدخول للوحة تحكم الإدارة. رمز التحقق السري الخاص بك هو:</p>
                  <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #b45309; background-color: #fef3c7; padding: 12px 24px; border-radius: 10px; display: inline-block; font-family: monospace;">
                    ${otp}
                  </div>
                  <p style="color: #a8a29e; font-size: 12px; margin-top: 14px;">ينتهي هذا الرمز خلال 10 دقائق. إذا لم تكن أنت من طلب هذا الرمز، يرجى تجاهله بأمان.</p>
                </div>
                <p style="color: #a8a29e; font-size: 11px; text-align: center; margin-top: 16px;">مرسل حصرياً إلى البريد الأكاديمي: ${SUPER_ADMIN_EMAIL}</p>
              </div>
            `,
          });
          emailSent = true;
        } catch (err: any) {
          emailError = err?.message || 'Failed to dispatch email via Resend';
        }
      } else {
        emailError = 'RESEND_API_KEY non configurée';
      }

      return new Response(
        JSON.stringify({
          success: true,
          challenge,
          targetEmail: SUPER_ADMIN_EMAIL,
          emailSent,
          emailError,
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

      const signaturePayload = `${SUPER_ADMIN_EMAIL}:${String(otp).trim()}:${expiresAt}`;
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
          adminEmail: SUPER_ADMIN_EMAIL,
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