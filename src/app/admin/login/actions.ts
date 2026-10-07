"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Pesan error dari Supabase (bisa diterjemahkan)
    let errorMessage = "Terjadi kesalahan saat login.";
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Email atau password salah.";
    }
    return { error: errorMessage };
  }

  // Cek apakah dia admin aktif (Double check, middleware juga mengecek)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: admin, error: dbError } = await supabase
      .from("admins")
      .select("id, is_active")
      .eq("id", user.id)
      .maybeSingle();
    
    if (dbError) {
      console.error("DB Error fetching admin:", dbError);
      await supabase.auth.signOut();
      return { error: `Database Error: ${dbError.message}` };
    }

    if (!admin) {
      await supabase.auth.signOut();
      return { error: `Data admin tidak ditemukan untuk UUID: ${user.id}` };
    }

    if (!admin.is_active) {
      await supabase.auth.signOut();
      return { error: "Akun Anda berstatus tidak aktif (is_active = false)." };
    }
  }

  redirect("/admin/dashboard");
}
