import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MasterAdminClient from "./MasterAdminClient";

export const metadata = {
  title: "Master Data - Laporan Abnormality",
};

export default async function MasterPage() {
  const supabase = await createClient();

  // Ambil user saat ini
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Ambil role admin
  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  // Hanya super_admin yang boleh masuk
  if (!admin || admin.role !== "super_admin") {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-2xl font-bold text-text">Akses Ditolak</h1>
        <p className="text-text-muted mt-2">Anda tidak memiliki izin super_admin untuk mengakses halaman ini.</p>
      </div>
    );
  }

  // Fetch semua admin
  const { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Master Data: Admin</h1>
        <p className="text-sm text-text-muted mt-1">Kelola akses, role, dan status aktif akun administrator.</p>
      </div>
      
      <MasterAdminClient initialAdmins={admins || []} />
    </div>
  );
}
