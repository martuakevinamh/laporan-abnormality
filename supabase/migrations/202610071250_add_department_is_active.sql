-- Tambahkan kolom is_active ke tabel departments

ALTER TABLE departments ADD COLUMN is_active boolean DEFAULT true;

-- Update kebijakan RLS (jika belum ada, buat jika diperlukan)
-- Laporan publik mungkin butuh departemen yang aktif saja, tapi biarkan RLS saat ini jika hanya SELECT anon = true
