import { Book } from '../types/supabase';

// قراءة المفاتيح من متغيرات البيئة بأمان
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchBooks(): Promise<Book[]> {
  try {
    // التحقق من وجود المفاتيح قبل إجراء الطلب
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("تنبيه: لم يتم العثور على مفاتيح Supabase في ملف .env");
      return [];
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`فشل جلب البيانات من Supabase: ${response.status} ${response.statusText}`);
    }

    const data: Book[] = await response.json();
    return data;
  } catch (error) {
    console.error("خطأ أثناء جلب الكتب:", error);
    return [];
  }
}
