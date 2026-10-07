"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { headers } from "next/headers";

// Simple in-memory rate limiting (IP -> array of timestamps)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 3;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Schema Validasi Server (Sama dengan client)
const serverFormSchema = z.object({
  reporterName: z.string().min(1),
  npk: z.string().min(1),
  department: z.string().min(1),
  area: z.string().min(3).max(150),
  hazardLevel: z.enum(["Rendah", "Sedang", "Tinggi"]),
  description: z.string().min(20).max(1000),
});

export async function submitReport(formData: FormData) {
  try {
    // 1. Spam Protection: Honeypot
    const honeypot = formData.get("botField");
    if (honeypot) {
      return { success: false, error: "Spam terdeteksi." };
    }

    // 2. Spam Protection: IP Rate Limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    
    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return { success: false, error: "Terlalu banyak kiriman. Silakan coba lagi nanti." };
    }
    
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);

    // 3. Extract and Validate Text Data
    const rawData = {
      reporterName: formData.get("reporterName") as string,
      npk: formData.get("npk") as string,
      department: formData.get("department") as string,
      area: formData.get("area") as string,
      hazardLevel: formData.get("hazardLevel") as string,
      description: formData.get("description") as string,
    };

    const validatedData = serverFormSchema.safeParse(rawData);
    if (!validatedData.success) {
      return { success: false, error: "Data form tidak valid. Cek kembali isian Anda." };
    }

    // 4. Validate Files (Server-side)
    const files = formData.getAll("files") as File[];
    if (files.length === 0 || files.length > 3) {
      return { success: false, error: "Jumlah foto harus antara 1 sampai 3." };
    }
    
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) { 
        // Max 2MB per file di server (Karena dari client sudah dikompres <300KB)
        return { success: false, error: "Ukuran file terlalu besar." };
      }
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "Tipe file yang diunggah harus berupa gambar." };
      }
    }

    // 5. Get Department ID from DB
    const { data: deptData, error: deptError } = await supabase
      .from("departments")
      .select("id")
      .eq("name", validatedData.data.department)
      .single();

    if (deptError || !deptData) {
      return { success: false, error: "Departemen tidak ditemukan di database." };
    }

    // 6. Insert Report (DB Trigger akan otomatis mengisi report_number, status, dan timestamps)
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert({
        reporter_name: validatedData.data.reporterName,
        npk: validatedData.data.npk,
        department_id: deptData.id,
        area: validatedData.data.area,
        description: validatedData.data.description,
        hazard_level: validatedData.data.hazardLevel,
      })
      .select("id, report_number")
      .single();

    if (reportError || !reportData) {
      console.error("DB Insert Error:", reportError);
      return { success: false, error: "Gagal menyimpan laporan ke database." };
    }

    // 7. Upload Files to Storage & Insert to report_files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${reportData.id}/${Date.now()}_${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("report-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage Upload Error:", uploadError);
        // Kita log saja error file untuk sekarang, laporan tetap tersimpan
      } else {
        await supabase
          .from("report_files")
          .insert({
            report_id: reportData.id,
            file_path: fileName,
          });
      }
    }

    return { success: true, reportNumber: reportData.report_number };

  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: "Terjadi kesalahan internal server." };
  }
}
