-- Menambahkan kolom file_kind ke tabel report_files
-- Default value: 'finding' untuk menjaga backwards compatibility dengan data yang sudah ada
ALTER TABLE report_files ADD COLUMN IF NOT EXISTS file_kind TEXT NOT NULL DEFAULT 'finding';

-- Hanya izinkan dua jenis file ini
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_file_kind'
    ) THEN
        ALTER TABLE report_files ADD CONSTRAINT check_file_kind CHECK (file_kind IN ('finding', 'resolution'));
    END IF;
END $$;

-- Update function get_report_status untuk mengembalikan data file juga (dalam format JSON)
DROP FUNCTION IF EXISTS get_report_status(text);

CREATE OR REPLACE FUNCTION get_report_status(p_report_number text)
RETURNS TABLE (
    report_number text,
    status report_status,
    created_at timestamptz,
    last_status_at timestamptz,
    hazard_level hazard_level,
    department_name text,
    area text,
    public_note text,
    files json
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        r.report_number, 
        r.status, 
        r.created_at, 
        r.last_status_at, 
        r.hazard_level, 
        d.name as department_name, 
        r.area, 
        r.public_note,
        COALESCE(
            (
                SELECT json_agg(json_build_object('file_path', rf.file_path, 'file_kind', rf.file_kind))
                FROM report_files rf
                WHERE rf.report_id = r.id
            ),
            '[]'::json
        ) as files
    FROM reports r
    LEFT JOIN departments d ON r.department_id = d.id
    WHERE r.report_number = p_report_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agar public bisa membuat signed URL untuk melihat gambar di halaman cek status,
-- mereka butuh akses SELECT ke storage.objects. UUID pada path membuatnya sulit ditebak.
CREATE POLICY "Public can view report-files" ON storage.objects FOR SELECT USING (bucket_id = 'report-files');
