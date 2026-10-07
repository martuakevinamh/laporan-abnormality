"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { fetchReportStatus } from "../actions/cekStatusActions";
import { Button, Input, Card } from "@/components/ui";
import { StatusBadge, Status } from "@/components/badges/Badges";

interface ReportData {
  report_number: string;
  status: string;
  created_at: string;
  department_name: string;
  area: string;
  public_note?: string | null;
}

function CekStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get("id") || "";

  const [reportNumber, setReportNumber] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [photos, setPhotos] = useState<{path: string, signedUrl: string | null, file_kind: string}[]>([]);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reportNumber.trim()) return;

    // Update URL quietly without triggering full reload
    router.replace(`/cek-status?id=${reportNumber.trim()}`, { scroll: false });

    setIsLoading(true);
    setErrorMsg(null);
    setReportData(null);

    const result = await fetchReportStatus(reportNumber);
    if (result.success) {
      setReportData(result.data);
      setPhotos(result.photos || []);
    } else {
      setErrorMsg(result.error || "Gagal mengambil data.");
    }
    setIsLoading(false);
  };

  // Auto search on mount if ID is present in URL
  useEffect(() => {
    let isMounted = true;
    
    async function fetchInitial() {
      if (initialId) {
        setIsLoading(true);
        const result = await fetchReportStatus(initialId);
        if (isMounted) {
          if (result.success) {
            setReportData(result.data as ReportData);
            setPhotos(result.photos || []);
          } else {
            setErrorMsg(result.error || "Gagal mengambil data.");
          }
          setIsLoading(false);
        }
      }
    }
    
    fetchInitial();
    
    return () => {
      isMounted = false;
    };
  }, [initialId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Cek Status Laporan</h1>
        <p className="mt-2 text-sm text-text-muted">
          Masukkan nomor laporan (contoh: ABN-20261006-0001) untuk melihat status penanganan terkini tanpa harus login.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input 
              placeholder="Masukkan Nomor Laporan..." 
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" variant="primary" disabled={isLoading || !reportNumber.trim()}>
            {isLoading ? "Mencari..." : "Cari Laporan"}
          </Button>
        </form>

        {errorMsg && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {reportData && (
          <div className="mt-8 pt-6 border-t border-border flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status Saat Ini</p>
                <div className="mt-2">
                  <StatusBadge status={reportData.status as Status} />
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Dibuat Pada</p>
                <p className="text-sm font-medium text-text mt-1">
                  {new Date(reportData.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg p-4 rounded-lg border border-border">
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Departemen</p>
                <p className="text-sm font-medium text-text">{reportData.department_name}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">Area Temuan</p>
                <p className="text-sm font-medium text-text">{reportData.area}</p>
              </div>
            </div>

            {reportData.public_note ? (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] p-4 rounded-lg">
                <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Catatan dari PIC / Admin
                </p>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {reportData.public_note}
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-muted italic text-center mt-2">
                Belum ada catatan publik dari tim yang menangani.
              </p>
            )}

            {/* Bagian Foto */}
            {photos.length > 0 && (
              <div className="bg-white border border-border p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-text-muted mb-3">Foto / Bukti Lampiran</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foto Sebelum (Finding) */}
                  <div>
                    <p className="text-xs font-medium text-text mb-2 text-center sm:text-left">Sebelum (Temuan)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {photos.filter(p => p.file_kind === "finding").map((p, i) => (
                        <div 
                          key={i} 
                          className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => p.signedUrl && setZoomedPhoto(p.signedUrl)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.signedUrl && <img src={p.signedUrl} alt={`Sebelum ${i + 1}`} className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Foto Sesudah (Resolution) */}
                  <div>
                    <p className="text-xs font-medium text-text mb-2 text-center sm:text-left">Sesudah (Perbaikan)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {photos.filter(p => p.file_kind === "resolution").length > 0 ? (
                        photos.filter(p => p.file_kind === "resolution").map((p, i) => (
                          <div 
                            key={i} 
                            className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => p.signedUrl && setZoomedPhoto(p.signedUrl)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {p.signedUrl && <img src={p.signedUrl} alt={`Sesudah ${i + 1}`} className="w-full h-full object-cover" />}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 aspect-square rounded-md border border-dashed border-border bg-bg flex items-center justify-center">
                          <span className="text-xs text-text-muted">Belum ada</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal Zoom Foto */}
      {zoomedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomedPhoto} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-md" />
        </div>
      )}
    </div>
  );
}

export default function CekStatusPage() {
  return (
    <Suspense fallback={<p className="text-center text-text-muted mt-20">Memuat...</p>}>
      <CekStatusContent />
    </Suspense>
  );
}
