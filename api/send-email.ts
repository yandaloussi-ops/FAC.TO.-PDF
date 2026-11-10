import tls from 'tls';

export const PLATFORM_ADMIN_EMAIL = 'fac.en.pdf.maroc@gmail.com';
const GMAIL_USER = process.env.GMAIL_USER || 'fac.en.pdf.maroc@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASS || 'waaxokvmglrbwkze').replace(/\s+/g, '');

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
          `From: "FAC en PDF" <${GMAIL_USER}>`,
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

export async function POST(request: Request) {
  try {
    const { studentName, studentEmail, studentPhone, bookTitle, receiptUrl } = await request.json();

    // 1. Send confirmation to Student from the official Gmail
    try {
      await sendGmail({
        to: studentEmail,
        subject: `تأكيد استلام طلب شراء مطبوع: ${bookTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background-color: #fafaf9;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #059669; margin: 0;">منصة FAC en PDF للكتب الجامعية</h2>
              <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">إشعار استلام طلب الشراء</p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
              <p style="font-size: 15px; color: #111827;">مرحباً <strong>${studentName}</strong>،</p>
              <p style="color: #374151; line-height: 1.6;">تم استلام طلب اقتناء المطبوع الجامعي <strong>«${bookTitle}»</strong> عبر تحويل Cash Plus بنجاح.</p>
              <p style="color: #374151; line-height: 1.6;">يقوم المشرف بمراجعة صورة الوصل المرفقة وتفعيل نسختك الرقمية في أقرب وقت.</p>
              <div style="margin-top: 16px; padding: 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 13px; color: #065f46;">
                ✓ بمجرد تأكيد الوصل، سيفتح الكتاب تلقائياً في حسابك داخل التطبيق.
              </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">لأي استفسار يرجى التواصل مع إدارة المنصة: <a href="mailto:${PLATFORM_ADMIN_EMAIL}" style="color: #059669;">${PLATFORM_ADMIN_EMAIL}</a></p>
          </div>
        `,
      });
    } catch (studentErr) {
      console.warn('Student email error:', studentErr);
    }

    // 2. Send instant alert notification to Platform Admin Gmail
    try {
      await sendGmail({
        to: PLATFORM_ADMIN_EMAIL,
        subject: `🔔 طلب شراء جديد: ${bookTitle} (${studentName})`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background-color: #fafaf9;">
            <h2 style="color: #1f2937; margin-top: 0;">إشعار طلب شراء جديد (Cash Plus)</h2>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
              <p>قام طالب برفع وصل دفع جديد عبر المنصة:</p>
              <ul style="line-height: 1.8; color: #374151;">
                <li><strong>اسم الطالب:</strong> ${studentName}</li>
                <li><strong>البريد الإلكتروني:</strong> ${studentEmail}</li>
                <li><strong>رقم الهاتف (واتساب):</strong> ${studentPhone || 'غير مسجل'}</li>
                <li><strong>المطبوع المطلوب:</strong> ${bookTitle}</li>
              </ul>
              <div style="margin-top: 20px; text-align: center;">
                <a href="${receiptUrl}" style="background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  معاينة صورة الوصل المرفوع
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (adminErr) {
      console.warn('Admin notification error:', adminErr);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error?.message || error }, { status: 500 });
  }
}
