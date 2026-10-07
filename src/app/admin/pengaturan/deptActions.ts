"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleDepartmentStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .update({ is_active: isActive })
    .eq("id", id);
    
  if (error) {
    console.error("Toggle department error:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/pengaturan");
  return { success: true };
}

export async function addDepartment(name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("departments")
    .insert([{ name, is_active: true }]);
    
  if (error) {
    console.error("Add department error:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/pengaturan");
  return { success: true };
}
