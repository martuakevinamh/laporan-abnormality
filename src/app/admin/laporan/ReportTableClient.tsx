"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { StatusBadge, SeverityBadge, Status, Severity } from "@/components/badges/Badges";
import { useSearchParams } from "next/navigation";
import ReportDrawerClient from "./ReportDrawerClient";

type ReportTableClientProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reports: any[];
  supabaseUrl: string;
};

export default function ReportTableClient({ reports, supabaseUrl }: ReportTableClientProps) {
  const searchParams = useSearchParams();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(searchParams.get("drawer") || null);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg text-text-muted font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">No. Laporan & Umur</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Departemen</th>
                <th className="px-6 py-4">Area</th>
                <th className="px-6 py-4">Tingkat Bahaya</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-text-muted gap-3">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium text-text">Tidak ada laporan ditemukan</p>
                      <p className="text-sm">Coba sesuaikan filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                reports.map((report: any) => {
                  const thumbnail = report.report_files?.[0]?.file_path;
                  const thumbUrl = thumbnail ? `${supabaseUrl}/storage/v1/object/public/report_photos/${thumbnail}` : null;
                  
                  return (
                    <tr 
                      key={report.id} 
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer relative ${
                        report.overdueDays > 0 ? "border-l-4 border-l-red-500" : ""
                      }`}
                      onClick={() => setSelectedReportId(report.id as string)}
                    >
                      <td className="px-6 py-4">
                        {thumbUrl ? (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-border overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-border flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text mb-1 flex items-center gap-2">
                          {report.report_number as string}
                          {report.overdueDays > 0 && (
                            <span className="text-[10px] text-red-600 font-bold px-1.5 py-0.5 rounded bg-red-100 shrink-0">
                              Terlambat {report.overdueDays} hari
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted">
                          {formatDistanceToNow(new Date(report.created_at as string), { addSuffix: true, locale: idLocale })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text">{report.reporter_name}</div>
                        <div className="text-xs text-text-muted">NPK: {report.npk || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-text">{report.departments?.name || "-"}</td>
                      <td className="px-6 py-4 text-text">{report.area}</td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={report.hazard_level as Severity} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status as Status} />
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="inline-flex items-center gap-1.5 text-accent hover:text-blue-700 font-medium text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportId(report.id);
                          }}
                        >
                          Detail
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDrawerClient 
        reportId={selectedReportId} 
        onClose={() => setSelectedReportId(null)} 
      />
    </>
  );
}
