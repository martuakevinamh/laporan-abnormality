# Sistem Laporan Abnormality

Sistem Laporan Abnormality adalah aplikasi pelaporan ketidaknormalan (abnormality) di area kerja, dirancang dengan antarmuka yang bersih, premium, dan mudah digunakan (Antislop). Aplikasi ini menggunakan Next.js (App Router), Tailwind CSS, dan Supabase untuk autentikasi, database, serta penyimpanan file.

## Fitur Utama
1. **Pelaporan Publik**: Karyawan dapat membuat laporan ketidaknormalan tanpa perlu login.
2. **Cek Status Laporan**: Karyawan dapat mengecek status laporan yang pernah dibuat menggunakan NPK dan Nomor Laporan.
3. **Dashboard Admin**: Panel aksi untuk memantau laporan baru, laporan *overdue* (terlambat), dan tren.
4. **Analitik**: Visualisasi data laporan masuk vs selesai, komposisi tingkat bahaya, dan area teratas (menggunakan Recharts dan agregasi SQL).
5. **Manajemen Laporan & Bukti Foto**: Fitur *Before/After* (Sebelum & Sesudah) untuk melacak penyelesaian masalah, serta ekspor data ke Excel.
6. **Pengaturan Dinamis**: Super Admin dapat mengatur batas waktu SLA (Service Level Agreement) untuk peringatan keterlambatan dan mengelola departemen.

---

## Prasyarat (Prerequisites)

- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **Docker Desktop** (opsional, direkomendasikan untuk menjalankan Supabase secara lokal)
- Akun **Supabase** (untuk *production*)
- Akun **Vercel** (untuk deploy *frontend*)

---

## Menjalankan Secara Lokal

### 1. Kloning dan Instalasi
```bash
git clone <repository_url>
cd laporan-abnormality
npm install
```

### 2. Menjalankan Supabase Lokal
Pastikan Docker Desktop sudah menyala, lalu jalankan:
```bash
npx supabase start
```
*Command* ini akan menginisialisasi *database* PostgreSQL lokal, menjalankan migrasi (*migrations*), dan membuat *bucket* penyimpanan.

Untuk melihat Studio Supabase Lokal, buka: `http://127.0.0.1:54323`

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root proyek Anda, dan isi dengan kredensial Supabase lokal Anda (URL dan Anon Key). Kredensial ini akan dicetak di terminal setelah perintah `supabase start` berhasil.

Contoh `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR... (Kunci lokal Anda)
```

### 4. Menjalankan Aplikasi Next.js
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

---

## Panduan Deployment (Vercel + Supabase)

### 1. Setup Supabase Project (Backend)
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Dapatkan **Project URL** dan **anon public key** dari *Settings > API*.
3. Tautkan proyek lokal Anda dengan proyek Supabase di cloud:
   ```bash
   npx supabase link --project-ref <your_project_ref>
   ```
4. Dorong (push) skema database dan tabel ke cloud:
   ```bash
   npx supabase db push
   ```
5. Buat *bucket* baru di Supabase Storage bernama `reports` (pastikan bersifat Public).

### 2. Setup Vercel (Frontend)
1. *Push* kode Anda ke repositori GitHub/GitLab/Bitbucket.
2. Buka [Vercel](https://vercel.com/) dan buat proyek baru dengan mengimpor repositori tersebut.
3. Di bagian **Environment Variables** pada Vercel, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: (URL proyek Supabase cloud Anda)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Anon key proyek Supabase cloud Anda)
4. Klik **Deploy**.

*(Catatan: Vercel otomatis menggunakan perintah `npm run build` dan mengonfigurasi Next.js dengan benar).*

---

## Manajemen Role Admin
Saat pertama kali login melalui `/admin/login`, akun Anda secara otomatis masuk ke tabel `admins` dengan role `admin`. Untuk dapat mengakses halaman **Pengaturan**, ubah role Anda menjadi `super_admin` langsung di *Table Editor* Supabase (baik lokal maupun *cloud*).
