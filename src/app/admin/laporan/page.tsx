import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { differenceInBusinessDays, differenceInDays } from "date-fns";
import { Card } from "@/components/ui";
import FiltersClient from "./FiltersClient";
import PaginationClient from "./PaginationClient";
import ReportTableClient from "./ReportTableClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminLaporanPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const dept = typeof params.dept === "string" ? params.dept : "";
  const hazard = typeof params.hazard === "string" ? params.hazard : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const sort = typeof params.sort === "string" ? params.sort : "created_at";
  const order = typeof params.order === "string" ? params.order : "desc";
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  // 1. Fetch Summary Data
  const [
    { count: total }, 
    { count: reported }, 
    { count: investigating }, 
    { count: resolved }
  ] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "Reported"),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "Investigating"),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "Resolved"),
  ]);

  // 2. Build Query for Table
  let queryBuilder = supabase
    .from("reports")
    .select(`
      id,
      report_number,
      created_at,
      reporter_name,
      npk,
      area,
      hazard_level,
      status,
      departments(name),
      report_files(file_path)
    `, { count: "exact" });

  if (status) queryBuilder = queryBuilder.eq("status", status);
  if (dept) queryBuilder = queryBuilder.eq("department_id", dept);
  if (hazard) queryBuilder = queryBuilder.eq("hazard_level", hazard);
  if (q) {
    queryBuilder = queryBuilder.or(`report_number.ilike.%${q}%,reporter_name.ilike.%${q}%,npk.ilike.%${q}%,area.ilike.%${q}%`);
  }

  // Sorting
  queryBuilder = queryBuilder.order(sort, { ascending: order === "asc" });

  // Pagination
  queryBuilder = queryBuilder.range(offset, offset + limit - 1);

  const { data: reports, count } = await queryBuilder;

  // 3. Departments for filters
  const { data: departments } = await supabase.from("departments").select("id, name").order("name");

  const { data: settings } = await supabase.from("settings").select("*").single();

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedReports = (reports || []).map((report: any) => {
    let overdueDays = 0;
    
    if (settings && (report.status === "Reported" || report.status === "Investigating")) {
      const lastDate = new Date(report.last_status_at || report.created_at);
      const businessDays = differenceInBusinessDays(now, lastDate);
      const calendarDays = differenceInDays(now, lastDate);

      if (report.status === "Reported") {
        let limit = 3;
        if (report.hazard_level === "Tinggi") limit = settings.alert_high_days;
        else if (report.hazard_level === "Sedang") limit = settings.alert_medium_days;
        else if (report.hazard_level === "Rendah") limit = settings.alert_low_days;

        if (businessDays > limit) overdueDays = businessDays - limit;
      } else if (report.status === "Investigating") {
        const limit = settings.update_investigating_days || 7;
        if (calendarDays > limit) overdueDays = calendarDays - limit;
      }
    }
    
    return { ...report, overdueDays };
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Daftar Laporan</h1>
        <p className="text-text-muted">Pantau dan kelola seluruh temuan abnormality di fasilitas.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-white border-l-4 border-l-gray-400">
          <p className="text-sm text-text-muted font-medium mb-1">Total Laporan</p>
          <p className="text-3xl font-bold text-text">{total || 0}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-red-500">
          <p className="text-sm text-text-muted font-medium mb-1">Reported</p>
          <p className="text-3xl font-bold text-text">{reported || 0}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-yellow-500">
          <p className="text-sm text-text-muted font-medium mb-1">Investigating</p>
          <p className="text-3xl font-bold text-text">{investigating || 0}</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-green-500">
          <p className="text-sm text-text-muted font-medium mb-1">Resolved</p>
          <p className="text-3xl font-bold text-text">{resolved || 0}</p>
        </Card>
      </div>

      {/* FILTERS */}
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-xl mb-6" />}>
        <FiltersClient departments={departments || []} />
      </Suspense>

      {/* TABLE */}
      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl" />}>
        <ReportTableClient reports={enhancedReports} supabaseUrl={supabaseUrl} />
      </Suspense>

      {/* PAGINATION */}
      <Suspense fallback={null}>
        <PaginationClient total={count || 0} limit={limit} />
      </Suspense>
    </div>
  );
}
