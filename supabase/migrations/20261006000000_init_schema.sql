-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE hazard_level AS ENUM ('Rendah', 'Sedang', 'Tinggi');
CREATE TYPE report_status AS ENUM ('Reported', 'Investigating', 'Resolved', 'Rejected');

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Departments
CREATE TABLE departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- 2. Admins
CREATE TABLE admins (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    created_at timestamptz DEFAULT now()
);

-- 3. Reports
CREATE TABLE reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number text UNIQUE, -- Diisi via trigger
    created_at timestamptz DEFAULT now(),
    reporter_name text NOT NULL,
    npk text,
    department_id uuid REFERENCES departments(id),
    area text NOT NULL,
    description text NOT NULL,
    hazard_level hazard_level NOT NULL,
    status report_status NOT NULL DEFAULT 'Reported',
    last_status_at timestamptz DEFAULT now(),
    first_viewed_at timestamptz,
    closed_at timestamptz
);

-- 4. Report Files
CREATE TABLE report_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
    file_path text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 5. Report Logs (Audit trail)
CREATE TABLE report_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
    action text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 6. Settings
CREATE TABLE settings (
    id int PRIMARY KEY DEFAULT 1,
    alert_high_days int NOT NULL DEFAULT 1,
    alert_medium_days int NOT NULL DEFAULT 2,
    alert_low_days int NOT NULL DEFAULT 3,
    update_investigating_days int NOT NULL DEFAULT 7,
    CONSTRAINT single_row CHECK (id = 1)
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger untuk men-generate report_number: ABN-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_daily_report_number()
RETURNS TRIGGER AS $$
DECLARE
    date_str text;
    daily_count int;
BEGIN
    date_str := to_char(NEW.created_at, 'YYYYMMDD');
    
    -- Hitung jumlah laporan hari ini untuk nomor urut
    SELECT COUNT(*) INTO daily_count 
    FROM reports 
    WHERE to_char(created_at, 'YYYYMMDD') = date_str;
    
    NEW.report_number := 'ABN-' || date_str || '-' || lpad((daily_count + 1)::text, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_daily_report_number
BEFORE INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION generate_daily_report_number();

-- Trigger untuk update last_status_at ketika status berubah
CREATE OR REPLACE FUNCTION update_last_status_at()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.last_status_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_status_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_last_status_at();

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO departments (name) VALUES 
('Press'), ('Body 1'), ('Body 2'), ('Toso 1'), ('Toso 2'),
('Assy 1'), ('Assy 2'), ('Log. 1'), ('Log. 2'), ('PCD'),
('GA'), ('PE'), ('QI'), ('QE'), ('QSS'), ('R&D'), ('CIT'),
('MTNC PW'), ('MTNC TA'), ('EA'), ('HRD'), ('EID');

INSERT INTO settings (id, alert_high_days, alert_medium_days, alert_low_days, update_investigating_days)
VALUES (1, 1, 2, 3, 7);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper Function (Apakah user ini admin?)
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Departments & Settings (Semua orang bisa baca)
CREATE POLICY "Public can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (is_admin());

CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON settings FOR ALL USING (is_admin());

-- 2. Admins
CREATE POLICY "Admins can view admins" ON admins FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage admins" ON admins FOR ALL USING (is_admin());

-- 3. Reports
-- Public hanya boleh INSERT
CREATE POLICY "Public can insert reports" ON reports FOR INSERT WITH CHECK (true);
-- Admin bebas akses (SELECT, UPDATE, DELETE, INSERT)
CREATE POLICY "Admins have full access to reports" ON reports FOR ALL USING (is_admin());

-- [PENTING] Karena public tidak punya akses SELECT ke tabel Reports (untuk mencegah scraping data),
-- kita buat function khusus SECURITY DEFINER agar public BISA mencari laporan by report_number.
CREATE OR REPLACE FUNCTION get_report_status(p_report_number text)
RETURNS TABLE (
    report_number text,
    status report_status,
    reporter_name text,
    created_at timestamptz,
    last_status_at timestamptz,
    hazard_level hazard_level,
    department_name text
) AS $$
BEGIN
    RETURN QUERY 
    SELECT r.report_number, r.status, r.reporter_name, r.created_at, r.last_status_at, r.hazard_level, d.name
    FROM reports r
    LEFT JOIN departments d ON r.department_id = d.id
    WHERE r.report_number = p_report_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Report Files
CREATE POLICY "Public can insert report files" ON report_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage report files" ON report_files FOR ALL USING (is_admin());

-- 5. Report Logs
CREATE POLICY "Admins can manage report logs" ON report_logs FOR ALL USING (is_admin());

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Masukkan Storage Bucket untuk foto (Privat)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-files', 'report-files', false) 
ON CONFLICT DO NOTHING;

-- RLS untuk tabel storage.objects
-- Public hanya bisa upload (INSERT) ke bucket ini
CREATE POLICY "Public can upload to report-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-files');

-- Admin bisa melihat, download, dan kelola file (ALL)
CREATE POLICY "Admins can manage report-files" ON storage.objects FOR ALL USING (bucket_id = 'report-files' AND is_admin());
