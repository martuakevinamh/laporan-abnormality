"use client";

import { useEffect, useState, useTransition } from "react";
import { getReportDetail, updateReportAction } from "./actions";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { FileUpload } from "@/components/ui";

type ReportDrawerProps = {
  reportId: string | null;
  onClose: () => void;
};

export default function ReportDrawerClient({ reportId, onClose }: ReportDrawerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [report, setReport] = useState<any>(null);
  const [photos, setPhotos] = useState<{path: string, signedUrl: string | null, file_kind: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevReportId, setPrevReportId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [status, setStatus] = useState("");
  const [hazardLevel, setHazardLevel] = useState("");
  const [publicNote, setPublicNote] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  
  // Photo zoom state
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (reportId) {
      getReportDetail(reportId)
        .then(({ report, photos }) => {
          if (!active) return;
          setReport(report);
          setPhotos(photos);
          setStatus(report.status);
          setHazardLevel(report.hazard_level);
          setPublicNote(report.public_note || "");
        })
        .catch(console.error)
        .finally(() => {
           if (active) setIsLoading(false);
        });
    }
    return () => { active = false; };
  }, [reportId]);

  // Handle state reset during render phase when reportId changes (React recommended way to bypass effects)
  if (reportId !== prevReportId) {
    setPrevReportId(reportId);
    setReport(null);
    setPhotos([]);
    setResolutionFiles([]);
    setZoomedPhoto(null);
    setIsLoading(!!reportId);
  }

  if (!reportId) return null;

  const handleSave = () => {
    if (status === "Rejected" && !rejectedReason.trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("hazard_level", hazardLevel);
      formData.append("public_note", publicNote);
      formData.append("rejected_reason", rejectedReason);
      if (status === "Resolved" && resolutionFiles.length > 0) {
        formData.append("resolution_file", resolutionFiles[0]);
      }

      await updateReportAction(reportId, formData);
      // Refresh report data
      const updated = await getReportDetail(reportId);
      setReport(updated.report);
      setPhotos(updated.photos);
      setStatus(updated.report.status);
      setHazardLevel(updated.report.hazard_level);
      setPublicNote(updated.report.public_note || "");
      setRejectedReason("");
      setResolutionFiles([]);
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-125 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg/50">
          <div>
            <h2 className="text-lg font-bold text-text">Detail Laporan</h2>
            {report && <p className="text-sm text-text-muted">{report.report_number}</p>}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
          ) : report ? (
            <>
              {/* Info Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-1">Pelapor</h3>
                  <p className="font-medium text-text">{report.reporter_name} {report.npk && <span className="text-sm text-text-muted font-normal">(NPK: {report.npk})</span>}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Area</h3>
                    <p className="font-medium text-text">{report.area}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Departemen</h3>
                    <p className="font-medium text-text">{report.departments?.name || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Dibuat</h3>
                    <p className="font-medium text-text text-sm">{format(new Date(report.created_at), "dd MMM yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-muted mb-1">Waktu Respons</h3>
                    <p className="font-medium text-text text-sm">{report.first_viewed_at ? formatDistanceToNow(new Date(report.first_viewed_at), { addSuffix: true, locale: idLocale }) : "Baru dilihat"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-1">Deskripsi</h3>
                  <div className="bg-bg p-3 rounded-md text-sm text-text whitespace-pre-wrap border border-border">
                    {report.description}
                  </div>
                </div>
              </div>

              {/* Photos */}
              {photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-2">Foto / Bukti</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Foto Sebelum (Finding) */}
                    <div>
                      <p className="text-xs font-medium text-text mb-1 text-center">Sebelum (Temuan)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {photos.filter(p => p.file_kind === "finding").map((p, i) => (
                          <div 
                            key={i} 
                            className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setZoomedPhoto(p.signedUrl)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {p.signedUrl && <img src={p.signedUrl} alt={`Sebelum ${i + 1}`} className="w-full h-full object-cover" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Foto Sesudah (Resolution) */}
                    <div>
                      <p className="text-xs font-medium text-text mb-1 text-center">Sesudah (Perbaikan)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {photos.filter(p => p.file_kind === "resolution").length > 0 ? (
                          photos.filter(p => p.file_kind === "resolution").map((p, i) => (
                            <div 
                              key={i} 
                              className="aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setZoomedPhoto(p.signedUrl)}
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

              <hr className="border-border" />

              {/* Update Section */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-text">Update Status</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-text">Tingkat Bahaya</label>
                    <select 
                      value={hazardLevel}
                      onChange={(e) => setHazardLevel(e.target.value)}
                      className="w-full p-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="Rendah">Rendah</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Tinggi">Tinggi</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-text">Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {status === "Rejected" && (
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-red-500">Alasan Penolakan (Wajib)</label>
                    <textarea 
                      value={rejectedReason}
                      onChange={(e) => setRejectedReason(e.target.value)}
                      className="w-full p-2 text-sm border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      rows={2}
                      placeholder="Masukkan alasan penolakan..."
                    />
                  </div>
                )}

                {status === "Resolved" && (
                  <div className="space-y-1">
                    <FileUpload
                      label="Foto Setelah Perbaikan (Opsional)"
                      accept="image/jpeg, image/png, image/heic"
                      multiple={false}
                      maxFiles={1}
                      maxSizeMB={5}
                      onFilesChange={setResolutionFiles}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-text">Catatan Tindak Lanjut</label>
                  <textarea 
                    value={publicNote}
                    onChange={(e) => setPublicNote(e.target.value)}
                    className="w-full p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
                    rows={3}
                    placeholder="Catatan perbaikan atau tindak lanjut..."
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full py-2 bg-accent hover:bg-blue-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>

              <hr className="border-border" />

              {/* History Section */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted mb-4">Riwayat Status & Log</h3>
                {report.report_logs && report.report_logs.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {report.report_logs.map((log: any) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-gray-300 group-[.is-active]:bg-accent text-white group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-white p-3 rounded border border-border shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-text text-sm">{log.admins?.name || "Sistem"}</div>
                            <time className="text-xs font-medium text-text-muted">{format(new Date(log.created_at), "dd MMM HH:mm")}</time>
                          </div>
                          <div className="text-xs text-text-muted">{log.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted text-center py-4">Belum ada riwayat update.</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoomedPhoto} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-md" />
        </div>
      )}
    </>
  );
}
