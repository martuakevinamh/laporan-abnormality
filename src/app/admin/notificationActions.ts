"use server";

import { createClient } from "@/lib/supabase/server";
import { differenceInBusinessDays, differenceInDays } from "date-fns";

export async function getNotifications() {
  const supabase = await createClient();

  const [{ data: settings }, { data: reports }] = await Promise.all([
    supabase.from("settings").select("*").single(),
    supabase.from("reports").select("id, report_number, status, hazard_level, last_status_at, first_viewed_at, created_at, reporter_name").in("status", ["Reported", "Investigating"])
  ]);

  if (!settings || !reports) return { overdue: [], unread: [] };

  const now = new Date();
  
  const overdue: Record<string, unknown>[] = [];
  const unread: Record<string, unknown>[] = [];

  reports.forEach(report => {
    // Unread
    if (!report.first_viewed_at) {
      unread.push(report);
    }

    // Overdue logic
    const lastDate = new Date(report.last_status_at || report.created_at);
    const businessDays = differenceInBusinessDays(now, lastDate);
    const calendarDays = differenceInDays(now, lastDate);

    let isOverdue = false;
    let overdueDays = 0;

    if (report.status === "Reported") {
      let limit = 3;
      if (report.hazard_level === "Tinggi") limit = settings.alert_high_days;
      else if (report.hazard_level === "Sedang") limit = settings.alert_medium_days;
      else if (report.hazard_level === "Rendah") limit = settings.alert_low_days;

      if (businessDays > limit) {
        isOverdue = true;
        overdueDays = businessDays - limit;
      }
    } else if (report.status === "Investigating") {
      const limit = settings.update_investigating_days || 7;
      if (calendarDays > limit) {
        isOverdue = true;
        overdueDays = calendarDays - limit;
      }
    }

    if (isOverdue) {
      overdue.push({ ...report, overdueDays });
    }
  });

  return { overdue, unread, settings };
}

export async function saveSettingsAction(payload: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from("settings").update(payload).eq("id", 1);
}
