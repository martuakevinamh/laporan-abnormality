import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsFormClient from "./SettingsFormClient";
import DeptManagementClient from "./DeptManagementClient";

export default async function PengaturanPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (admin?.role !== "super_admin") {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          Akses Ditolak. Halaman ini hanya untuk Super Admin.
        </div>
      </div>
    );
  }

  const { data: settings } = await supabase.from("settings").select("*").single();
  const { data: departments } = await supabase.from("departments").select("*").order("name");

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text mb-2">Pengaturan Notifikasi</h1>
        <p className="text-text-muted">Atur batas waktu untuk indikator keterlambatan (overdue) pelaporan dan investigasi.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-8">
        <SettingsFormClient initialSettings={settings} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <DeptManagementClient initialDepartments={departments || []} />
      </div>
    </div>
  );
}
