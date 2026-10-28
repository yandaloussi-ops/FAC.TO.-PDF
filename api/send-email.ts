import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { studentName, studentEmail, bookTitle, receiptUrl } = await request.json();

    const data = await resend.emails.send({
      from: 'Fac to PDF <onboarding@resend.dev>',
      to: [studentEmail],
      subject: `تأكيد استلام طلب شراء: ${bookTitle}`,
      html: `
        <div style="font-family: sans-serif; direction: rtl; text-align: right;">
          <h2>مرحباً ${studentName}،</h2>
          <p>تم استلام طلب شراء مطبوع <strong>${bookTitle}</strong> عبر Cash Plus بنجاح.</p>
          <p>سيقوم المسؤول بمراجعة صورة الوصل المرفقة وتفعيل كتابك في أقرب وقت.</p>
          <hr />
          <p><small>رابط الوصل المرفوع: <a href="${receiptUrl}">عرض الوصل</a></small></p>
        </div>
      `,
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
