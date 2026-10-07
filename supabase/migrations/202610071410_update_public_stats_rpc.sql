-- Perbarui RPC untuk mengambil total semua laporan tanpa batasan waktu (Bulan Ini)
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reported_count int;
  resolved_count int;
BEGIN
  -- Hitung total semua laporan yang pernah dibuat
  SELECT count(*) INTO reported_count
  FROM reports;

  -- Hitung total semua laporan yang sudah selesai
  SELECT count(*) INTO resolved_count
  FROM reports
  WHERE status = 'Resolved';

  RETURN json_build_object(
    'reported_this_month', reported_count, -- tetap menggunakan key lama agar tidak perlu ganti di Vercel
    'resolved_this_month', resolved_count
  );
END;
$$;
