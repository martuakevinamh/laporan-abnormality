"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAdmin(id: string, role: string, is_active: boolean) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data: currentUserAdmin } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentUserAdmin || currentUserAdmin.role !== "super_admin") {
    return { success: false, error: "Hanya super_admin yang dapat mengubah data." };
  }

  // Mencegah admin mengubah dirinya sendiri menjadi non-aktif atau merubah role dirinya sendiri (opsional)
  // Untuk keamanan, setidaknya kita cegah dia menonaktifkan dirinya sendiri
  if (id === user.id && !is_active) {
    return { success: false, error: "Anda tidak dapat menonaktifkan akun Anda sendiri." };
  }

  const { error } = await supabase
    .from("admins")
    .update({ role, is_active })
    .eq("id", id);

  if (error) {
    console.error("Error updating admin:", error);
    return { success: false, error: "Gagal memperbarui admin." };
  }

  revalidatePath("/admin/master");
  return { success: true };
}
