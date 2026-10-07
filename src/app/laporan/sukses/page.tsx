"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button, Card } from "@/components/ui";

function SuksesContent() {
  const searchParams = useSearchParams();
  const reportNumber = searchParams.get("id");

  const copyToClipboard = () => {
    if (reportNumber) {
      navigator.clipboard.writeText(reportNumber);
      alert("Nomor laporan berhasil disalin ke clipboard!");
    }
  };

  if (!reportNumber) {
    return (
      <div className="flex justify-center mt-20">
        <p className="text-text-muted">Data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <Card padding="lg" className="text-center flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-status-resolved-bg flex items-center justify-center text-severity-low mb-2">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-text mb-2">Laporan Berhasil Terkirim!</h1>
        <p className="text-sm text-text-muted">
          Terima kasih telah melaporkan abnormality. Simpan nomor laporan berikut untuk memantau status penanganannya.
        </p>
      </div>

      <div className="w-full bg-bg p-4 rounded-lg border border-border flex flex-col gap-2">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Nomor Laporan</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-mono font-bold text-accent">{reportNumber}</span>
          <button 
            onClick={copyToClipboard}
            className="p-2 text-text-muted hover:text-accent hover:bg-white rounded-md transition-all border border-transparent hover:border-border"
            aria-label="Salin nomor laporan"
            title="Salin"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
        <Link href="/" className="flex-1 w-full">
          <Button variant="outline" className="w-full">
            Buat Laporan Baru
          </Button>
        </Link>
        <Link href={`/cek-status?id=${reportNumber}`} className="flex-1 w-full">
          <Button variant="primary" className="w-full">
            Cek Status
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function LaporanSuksesPage() {
  return (
    <div className="max-w-125 mx-auto px-4 sm:px-6 py-12">
      <Suspense fallback={<p className="text-center text-text-muted mt-20">Memuat...</p>}>
        <SuksesContent />
      </Suspense>
    </div>
  );
}
