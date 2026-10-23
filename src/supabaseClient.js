const SUPABASE_URL = "https://lypzxayqympzwoclbdtc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHp4YXlxeW1wendvY2xiZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NzY0NjMsImV4cCI6MjEwODM1MjQ2M30.7Z4qmLltEVMMgnb8YEhHQRW3N1pV1e_BCHdQ00o2hB0";

export async function fetchBooks() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=*`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!response.ok) throw new Error("فشل جلب البيانات من Supabase");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("خطأ أثناء جلب الكتب:", error);
    return [];
  }
}