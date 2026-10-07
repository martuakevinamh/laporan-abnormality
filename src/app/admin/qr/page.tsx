"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button, Card } from "@/components/ui";

export default function QRCodePage() {
  const [siteUrl, setSiteUrl] = useState(
    process.env.NEXT_PUBLIC_SITE_URL || ""
  );

  useEffect(() => {
    if (!siteUrl && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setSiteUrl(window.location.origin);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [siteUrl]);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png", 1.0);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "QR_Laporan_Abnormality.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printPoster = () => {
    window.print();
  };

  if (!siteUrl) return null;

  return (
    <>
      {/* ─── TAMPILAN ADMIN (SEMBUNYI SAAT DI-PRINT) ─── */}
      <div className="p-6 md:p-10 print:hidden">
        <h1 className="text-2xl font-bold text-text mb-2">Kode QR Pelaporan</h1>
        <p className="text-text-muted mb-8">
          Cetak atau unduh kode QR ini untuk ditempel di area fasilitas agar memudahkan karyawan melakukan pelaporan.
        </p>

        <Card padding="lg" className="max-w-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
            <QRCodeCanvas 
              id="qr-canvas"
              value={siteUrl} 
              size={200} 
              level="H" 
              includeMargin={true}
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">URL Tujuan</p>
              <p className="text-accent font-medium break-all">{siteUrl}</p>
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <Button onClick={downloadQR} variant="primary" className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh PNG
              </Button>
              
              <Button onClick={printPoster} variant="outline" className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak Poster A5
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── TAMPILAN POSTER (HANYA MUNCUL SAAT DI-PRINT) ─── */}
      {/* Menggunakan @media print lewat utilitas Tailwind `print:flex` */}
      <div className="hidden print:flex flex-col items-center justify-center w-full min-h-screen bg-white text-center p-8">
        <div className="border-12 border-accent p-12 rounded-[40px] flex flex-col items-center max-w-[148mm]">
          <h1 className="text-4xl font-extrabold text-text mb-4 leading-tight">
            Temukan kondisi tidak normal di fasilitas umum?
          </h1>
          <p className="text-xl text-text-muted mb-10 font-medium">
            Bantu kami menjaga kenyamanan bersama. Laporkan segera melalui portal resmi kami.
          </p>
          
          <div className="p-6 bg-white border-4 border-gray-100 rounded-3xl mb-10 shadow-sm">
            <QRCodeCanvas 
              value={siteUrl} 
              size={360} 
              level="H" 
              includeMargin={true}
            />
          </div>

          <h2 className="text-3xl font-black text-accent mb-3 uppercase tracking-wide">
            Scan untuk lapor!
          </h2>
          <p className="text-lg font-mono text-text-muted font-medium">
            {siteUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>
    </>
  );
}
