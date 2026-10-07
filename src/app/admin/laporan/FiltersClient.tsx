"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import * as XLSX from "xlsx";
import { fetchExportData, fetchFullExportData } from "./exportActions";

interface Dept {
  id: string;
  name: string;
}

export default function FiltersClient({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const status = searchParams.get("status") || "";
  const dept = searchParams.get("dept") || "";
  const hazard = searchParams.get("hazard") || "";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilter = (key: string, value: string) => {
    router.push(pathname + "?" + createQueryString(key, value));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter("q", q);
  };

  const handleReset = () => {
    setQ("");
    router.push(pathname);
  };

  const handleExportFiltered = async () => {
    try {
      const data = await fetchExportData({
        search: q,
        status,
        hazard_level: hazard,
        department_id: dept,
      });

      if (!data || data.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedData = data.map((r: any) => ({
        "No. Laporan": r.report_number,
        "Tanggal": new Date(r.created_at).toLocaleString("id-ID"),
        "Nama": r.reporter_name,
        "NPK": r.npk,
        "Departemen": r.departments?.name,
        "Area": r.area,
        "Tingkat Bahaya": r.hazard_level,
        "Deskripsi": r.description,
        "Status": r.status,
        "Tanggal Selesai": r.closed_at ? new Date(r.closed_at).toLocaleString("id-ID") : "-",
        "Tautan Foto": r.report_files && r.report_files.length > 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? r.report_files.map((f: any) => `[${f.file_kind}] ${f.file_path}`).join("; ")
          : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Terfilter");
      XLSX.writeFile(wb, `Ekspor_Laporan_${new Date().getTime()}.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Gagal mengekspor data.");
    }
  };

  const handleExportFull = async () => {
    try {
      const data = await fetchFullExportData();
      if (!data || data.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedData = data.map((r: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logs = r.report_logs?.map((l: any) => `[${new Date(l.created_at).toLocaleString("id-ID")}] ${l.admins?.name}: ${l.action}`).join(" | ") || "";
        return {
          "No. Laporan": r.report_number,
          "Tanggal": new Date(r.created_at).toLocaleString("id-ID"),
          "Nama": r.reporter_name,
          "NPK": r.npk,
          "Departemen": r.departments?.name,
          "Area": r.area,
          "Tingkat Bahaya": r.hazard_level,
          "Deskripsi": r.description,
          "Status": r.status,
          "Tanggal Selesai": r.closed_at ? new Date(r.closed_at).toLocaleString("id-ID") : "-",
          "Tautan Foto": r.report_files && r.report_files.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? r.report_files.map((f: any) => `[${f.file_kind}] ${f.file_path}`).join("; ")
            : "-",
          "Riwayat Tindakan": logs
        };
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Semua Laporan Lengkap");
      XLSX.writeFile(wb, `Ekspor_Semua_Lengkap_${new Date().getTime()}.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Gagal mengekspor data penuh.");
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-border mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input 
            label="Cari"
            placeholder="No. Laporan, Nama, NPK, atau Area..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            label="Status"
            value={status}
            onChange={(e) => handleFilter("status", e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "Reported", label: "Reported" },
              { value: "Investigating", label: "Investigating" },
              { value: "Resolved", label: "Resolved" },
            ]}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            label="Tingkat Bahaya"
            value={hazard}
            onChange={(e) => handleFilter("hazard", e.target.value)}
            options={[
              { value: "", label: "Semua Bahaya" },
              { value: "Rendah", label: "Rendah" },
              { value: "Sedang", label: "Sedang" },
              { value: "Tinggi", label: "Tinggi" },
              { value: "Kritis", label: "Kritis" },
            ]}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            label="Departemen"
            value={dept}
            onChange={(e) => handleFilter("dept", e.target.value)}
            options={[
              { value: "", label: "Semua Departemen" },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button type="submit" variant="primary" className="flex-1 md:flex-none">Terapkan</Button>
          {(q || status || dept || hazard) && (
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 md:flex-none">Reset</Button>
          )}
        </div>
      </form>
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 justify-end">
        <Button type="button" variant="outline" onClick={handleExportFiltered} className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ekspor Excel (Filter)
        </Button>
        <Button type="button" variant="outline" onClick={handleExportFull} className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100">
          <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ekspor Lengkap (Migrasi)
        </Button>
      </div>
    </div>
  );
}
