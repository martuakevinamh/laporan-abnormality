"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchAnalyticsData(startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_dashboard_analytics", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    console.error("Error fetching analytics:", error);
    return null;
  }

  return data;
}
