"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchExportData(filters?: {
  search?: string;
  status?: string;
  hazard_level?: string;
  department_id?: string;
}) {
  const supabase = await createClient();

  let query = supabase.from("reports").select(`
    report_number,
    created_at,
    reporter_name,
    npk,
    departments (name),
    area,
    hazard_level,
    description,
    status,
    closed_at,
    report_files (file_path, file_kind)
  `).order("created_at", { ascending: false });

  if (filters) {
    if (filters.search) {
      query = query.or(`report_number.ilike.%${filters.search}%,reporter_name.ilike.%${filters.search}%,area.ilike.%${filters.search}%`);
    }
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.hazard_level) query = query.eq("hazard_level", filters.hazard_level);
    if (filters.department_id) query = query.eq("department_id", filters.department_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Export data error:", error);
    return [];
  }

  return data;
}

export async function fetchFullExportData() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("reports").select(`
    *,
    departments (name),
    report_files (*),
    report_logs (
      action,
      created_at,
      admins (name)
    )
  `).order("created_at", { ascending: false });

  if (error) {
    console.error("Full export data error:", error);
    return [];
  }

  return data;
}
