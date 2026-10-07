-- Seed Data: 10 Contoh Laporan untuk melihat display Analitik

DO $$
DECLARE
    dept_press uuid;
    dept_body1 uuid;
    dept_assy1 uuid;
    dept_pe uuid;
    dept_hrd uuid;
BEGIN
    -- Ambil ID Departemen
    SELECT id INTO dept_press FROM departments WHERE name = 'Press';
    SELECT id INTO dept_body1 FROM departments WHERE name = 'Body 1';
    SELECT id INTO dept_assy1 FROM departments WHERE name = 'Assy 1';
    SELECT id INTO dept_pe FROM departments WHERE name = 'PE';
    SELECT id INTO dept_hrd FROM departments WHERE name = 'HRD';

    -- 1. Laporan Selesai (Bulan Lalu) - Tinggi
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at)
    VALUES (now() - interval '35 days', 'Budi Santoso', '12345', dept_press, 'Gudang Utama', 'Ada kebocoran oli di mesin press A', 'Tinggi', 'Resolved', now() - interval '30 days', now() - interval '34 days', now() - interval '30 days');

    -- 2. Laporan Investigating - Sedang
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at)
    VALUES (now() - interval '15 days', 'Agus Supriyadi', '12346', dept_body1, 'Jalur Perakitan B', 'Lantai licin karena air hujan tampias', 'Sedang', 'Investigating', now() - interval '10 days', now() - interval '14 days');

    -- 3. Laporan Terlambat (Reported) - Tinggi
    -- Lewat 1 hari (setting tinggi: 1 hari)
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at)
    VALUES (now() - interval '4 days', 'Citra Kirana', '12347', dept_assy1, 'Line 3', 'Kabel terkelupas di area panel listrik utama', 'Tinggi', 'Reported', now() - interval '4 days', now() - interval '3 days');

    -- 4. Laporan Selesai - Rendah
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at)
    VALUES (now() - interval '20 days', 'Dani Permana', '12348', dept_pe, 'Toilet Karyawan', 'Lampu toilet pria mati 1', 'Rendah', 'Resolved', now() - interval '18 days', now() - interval '19 days', now() - interval '18 days');

    -- 5. Laporan Ditolak
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at, public_note)
    VALUES (now() - interval '10 days', 'Eka Putra', '12349', dept_hrd, 'Kantin', 'Kursi patah 1 buah', 'Rendah', 'Rejected', now() - interval '9 days', now() - interval '9 days', now() - interval '9 days', 'Silakan laporkan ke bagian GA langsung via email internal.');

    -- 6. Laporan Selesai - Sedang
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at)
    VALUES (now() - interval '8 days', 'Feri Hermawan', '12350', dept_press, 'Gudang Utama', 'Tumpukan material nyaris jatuh', 'Sedang', 'Resolved', now() - interval '5 days', now() - interval '7 days', now() - interval '5 days');

    -- 7. Laporan Baru (Reported) - Rendah
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at)
    VALUES (now() - interval '2 hours', 'Gita Gutawa', '12351', dept_body1, 'Parkiran', 'Tong sampah penuh dan berserakan', 'Rendah', 'Reported', now() - interval '2 hours');

    -- 8. Laporan Investigating Lama (Perlu Update) - Tinggi
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at)
    VALUES (now() - interval '25 days', 'Hadi Wijaya', '12352', dept_assy1, 'Line 3', 'Rak komponen miring', 'Tinggi', 'Investigating', now() - interval '20 days', now() - interval '24 days');

    -- 9. Laporan Selesai - Tinggi
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at)
    VALUES (now() - interval '12 days', 'Iwan Fals', '12353', dept_pe, 'Area Mesin CNC', 'Sensor alarm kebakaran rusak', 'Tinggi', 'Resolved', now() - interval '10 days', now() - interval '11 days', now() - interval '10 days');

    -- 10. Laporan Selesai - Sedang
    INSERT INTO reports (created_at, reporter_name, npk, department_id, area, description, hazard_level, status, last_status_at, first_viewed_at, closed_at)
    VALUES (now() - interval '40 days', 'Joko Anwar', '12354', dept_assy1, 'Line Perakitan Depan', 'Kipas angin gantung lepas', 'Sedang', 'Resolved', now() - interval '38 days', now() - interval '39 days', now() - interval '38 days');
END $$;
