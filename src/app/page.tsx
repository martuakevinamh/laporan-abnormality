import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Card } from "@/components/ui";

export const metadata = {
  title: "Beranda - Laporan Abnormality Fasilitas Umum",
};

export default async function HomePage() {
  const supabase = await createClient();
  
  // Ambil data statistik dari RPC (Aman, hanya angka tanpa data spesifik)
  const { data: stats } = await supabase.rpc("get_public_stats");

  const reported = stats?.reported_this_month || 0;
  const resolved = stats?.resolved_this_month || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 sm:p-6 w-full max-w-4xl mx-auto text-center">
      
      {/* HEADER SECTION */}
      <div className="max-w-2xl mx-auto space-y-4 mb-8 mt-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-accent rounded-full mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text tracking-tight leading-tight">
          Laporan Abnormality <br className="hidden sm:block" /> Fasilitas Umum
        </h1>
        <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto">
          Laporkan kendala, kerusakan, atau temuan abnormality di area fasilitas perusahaan dengan cepat, transparan, dan mudah dipantau.
        </p>
      </div>

      {/* CALL TO ACTION */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-12">
        <Link href="/lapor" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto text-base px-8 py-3">
            Buat Laporan
          </Button>
        </Link>
        <Link href="/cek-status" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-3">
            Cek Status
          </Button>
        </Link>
      </div>

      {/* STATISTIK RINGKAS */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto mb-12">
        <Card className="p-4 bg-white border border-border shadow-sm flex flex-col items-center">
          <p className="text-3xl font-bold text-text mb-1">{reported}</p>
          <p className="text-xs text-text-muted font-medium text-center uppercase tracking-wide">
            Laporan Diterima <br/>(Bulan Ini)
          </p>
        </Card>
        <Card className="p-4 bg-white border border-border shadow-sm flex flex-col items-center">
          <p className="text-3xl font-bold text-accent mb-1">{resolved}</p>
          <p className="text-xs text-text-muted font-medium text-center uppercase tracking-wide">
            Selesai Ditangani <br/>(Bulan Ini)
          </p>
        </Card>
      </div>

      {/* LANGKAH SINGKAT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
        <Card padding="md" className="bg-white hover:border-accent/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-accent flex items-center justify-center font-bold mb-3">1</div>
          <h3 className="font-semibold text-text mb-1">Isi Laporan</h3>
          <p className="text-sm text-text-muted">Foto temuan, pilih lokasi, dan kirimkan detail singkat.</p>
        </Card>
        
        <Card padding="md" className="bg-white hover:border-accent/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold mb-3">2</div>
          <h3 className="font-semibold text-text mb-1">Tim Meninjau</h3>
          <p className="text-sm text-text-muted">Tim terkait akan meninjau dan memulai perbaikan fasilitas.</p>
        </Card>
        
        <Card padding="md" className="bg-white hover:border-accent/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold mb-3">3</div>
          <h3 className="font-semibold text-text mb-1">Ditindaklanjuti</h3>
          <p className="text-sm text-text-muted">Abnormality selesai diperbaiki beserta foto sesudah penanganan.</p>
        </Card>
      </div>

    </div>
  );
}
