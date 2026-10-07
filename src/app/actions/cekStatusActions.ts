"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchReportStatus(reportNumber: string) {
  if (!reportNumber || reportNumber.trim() === "") {
    return { success: false, error: "Silakan masukkan nomor laporan." };
  }

  try {
    const { data, error } = await supabase
      .rpc('get_report_status', { p_report_number: reportNumber.trim().toUpperCase() });

    if (error) {
      console.error(error);
      return { success: false, error: "Terjadi kesalahan saat terhubung ke database." };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Laporan tidak ditemukan. Pastikan nomor laporan (ABN-...) sudah benar." };
    }

    const report = data[0];
    let photos: { path: string, signedUrl: string | null, file_kind: string }[] = [];

    if (report.files && Array.isArray(report.files)) {
      photos = await Promise.all(
        report.files.map(async (file: { file_path: string, file_kind: string }) => {
          const { data: signedUrlData } = await supabase.storage
            .from("report-files")
            .createSignedUrl(file.file_path, 60 * 60); // 1 jam
          return {
            path: file.file_path,
            signedUrl: signedUrlData?.signedUrl || null,
            file_kind: file.file_kind || "finding",
          };
        })
      );
    }

    return { success: true, data: report, photos };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Terjadi kesalahan sistem saat mengecek status." };
  }
}
