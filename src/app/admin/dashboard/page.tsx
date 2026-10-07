import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { StatusBadge, SeverityBadge, LateBadge, type Status, type Severity } from "@/components/badges/Badges";
import Link from "next/link";
import { getNotifications } from "../notificationActions";

export const metadata = {
  title: "Dashboard - Laporan Abnormality",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Ambil semua laporan yang belum berstatus 'Resolved' maupun 'Rejected'
  const { count: countActive } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["Reported", "Investigating"]);

  // Ambil laporan selesai bulan ini
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: countResolved } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "Resolved")
    .gte("closed_at", startOfMonth.toISOString());

  // Ambil pengaturan limit hari keterlambatan
  const { data: settings } = await supabase.from("settings").select("*").single();

  // Ambil laporan berstatus Reported untuk dihitung jumlah total & mana yang terlambat
  const { data: reportedTasks } = await supabase
    .from("reports")
    .select("*, departments(name)")
    .eq("status", "Reported")
    .order("created_at", { ascending: true });

  const { overdue } = await getNotifications();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueReports = overdue as any[];

  // 5 Laporan Terakhir Masuk
  const { data: recentReports } = await supabase
    .from("reports")
    .select("*, departments(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard Overview</h1>
          <p className="text-sm text-text-muted mt-1">Ringkasan cepat status pabrik hari ini.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/qr" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 19h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Pindai QR
          </Link>
          <Link href="/admin/analitik" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Lihat Analitik
          </Link>
        </div>
      </div>
      
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg" className="relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-blue-100 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
          </div>
          <p className="text-text-muted font-medium text-sm relative z-10">Total Laporan Aktif</p>
          <p className="text-4xl font-bold text-accent mt-2 relative z-10">{countActive || 0}</p>
        </Card>
        
        <Card padding="lg" className="relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-yellow-100 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
          </div>
          <p className="text-text-muted font-medium text-sm relative z-10">Menunggu Review</p>
          <p className="text-4xl font-bold text-yellow-600 mt-2 relative z-10">{reportedTasks?.length || 0}</p>
        </Card>
        
        <Card padding="lg" className="relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-green-100 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
          </div>
          <p className="text-text-muted font-medium text-sm relative z-10">Selesai (Bulan Ini)</p>
          <p className="text-4xl font-bold text-green-600 mt-2 relative z-10">{countResolved || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* OVERDUE REPORTS (URGENT) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              Perlu Perhatian Segera
            </h2>
            {overdueReports.length > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">{overdueReports.length} Terlambat</span>
            )}
          </div>
          
          <Card className="divide-y divide-border">
            {overdueReports.length > 0 ? (
              overdueReports.slice(0, 5).map((r) => (
                <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-start">
                  <div>
                    <Link href={`/admin/laporan?search=${r.report_number}`} className="font-semibold text-accent hover:underline">
                      {r.report_number}
                    </Link>
                    <p className="text-sm text-text-muted mt-1">{r.area} &bull; {r.departments?.name}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <LateBadge />
                    <SeverityBadge severity={r.hazard_level as Severity} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p>Tidak ada laporan yang melebihi batas waktu.</p>
                <p className="text-sm">Kerja bagus!</p>
              </div>
            )}
          </Card>
        </div>

        {/* RECENT REPORTS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text">Laporan Terbaru Masuk</h2>
            <Link href="/admin/laporan" className="text-sm font-medium text-accent hover:underline">Lihat Semua</Link>
          </div>

          <Card className="divide-y divide-border">
            {recentReports && recentReports.length > 0 ? (
              recentReports.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <Link href={`/admin/laporan?search=${r.report_number}`} className="font-semibold text-text hover:text-accent">
                      {r.report_number}
                    </Link>
                    <span className="text-sm text-text-muted">oleh {r.reporter_name}</span>
                  </div>
                  <StatusBadge status={r.status as Status} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted">Belum ada laporan masuk.</div>
            )}
          </Card>
        </div>
        
      </div>
    </div>
  );
}
