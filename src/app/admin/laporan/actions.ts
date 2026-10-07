"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getReportDetail(reportId: string) {
  const supabase = await createClient();

  // 1. Fetch report details
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(`
      *,
      departments(name),
      report_files(file_path, file_kind),
      report_logs(id, action, created_at, admins(name))
    `)
    .eq("id", reportId)
    .single();

  if (reportError || !report) {
    throw new Error("Report not found");
  }

  // 2. Generate signed URLs for photos
  const photos = await Promise.all(
    (report.report_files || []).map(async (file: Record<string, unknown>) => {
      const { data } = await supabase.storage
        .from("report-files")
        .createSignedUrl(file.file_path as string, 60 * 60); // 1 hour
      return {
        path: file.file_path,
        signedUrl: data?.signedUrl || null,
        file_kind: (file.file_kind as string) || "finding",
      };
    })
  );

  // 3. Mark as viewed if it's the first time
  if (!report.first_viewed_at) {
    await supabase
      .from("reports")
      .update({ first_viewed_at: new Date().toISOString() })
      .eq("id", reportId);
    report.first_viewed_at = new Date().toISOString();
  }

  return { report, photos };
}

export async function updateReportAction(
  reportId: string,
  formData: FormData
) {
  const updates = {
    status: formData.get("status") as string | null,
    hazard_level: formData.get("hazard_level") as string | null,
    public_note: formData.get("public_note") as string | null,
    rejected_reason: formData.get("rejected_reason") as string | null,
  };
  const resolutionFile = formData.get("resolution_file") as File | null;
  const supabase = await createClient();

  // Check current status
  const { data: currentReport } = await supabase
    .from("reports")
    .select("status")
    .eq("id", reportId)
    .single();

  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {};
  
  if (updates.status && updates.status !== currentReport?.status) {
    updatePayload.status = updates.status;
    updatePayload.last_status_at = now;
    if (updates.status === "Resolved" || updates.status === "Rejected") {
      updatePayload.closed_at = now;
    } else {
      updatePayload.closed_at = null; // Reopen
    }
  }

  if (updates.hazard_level) updatePayload.hazard_level = updates.hazard_level;
  if (updates.public_note !== undefined) updatePayload.public_note = updates.public_note;

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from("reports").update(updatePayload).eq("id", reportId);
  }

  // Get Admin user
  const { data: userData } = await supabase.auth.getUser();
  const adminId = userData.user?.id;

  // Insert log
  let actionText = "Admin memperbarui laporan.";
  if (updates.status && updates.status !== currentReport?.status) {
    actionText = `Status diubah dari ${currentReport?.status} menjadi ${updates.status}.`;
    if (updates.status === "Rejected" && updates.rejected_reason) {
      actionText += ` Alasan: ${updates.rejected_reason}`;
    }
  } else if (updates.hazard_level || updates.public_note !== undefined) {
    actionText = "Admin memperbarui tingkat bahaya atau catatan.";
  }

  await supabase.from("report_logs").insert({
    report_id: reportId,
    admin_id: adminId,
    action: actionText,
  });

  if (updates.status === "Resolved" && resolutionFile && resolutionFile.size > 0) {
    const ext = resolutionFile.name.split(".").pop();
    const filePath = `${reportId}/resolution-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("report-files")
      .upload(filePath, resolutionFile);
      
    if (!uploadError) {
      await supabase.from("report_files").insert({
        report_id: reportId,
        file_path: filePath,
        file_kind: "resolution"
      });
    }
  }

  revalidatePath("/admin/laporan");
  return { success: true };
}
