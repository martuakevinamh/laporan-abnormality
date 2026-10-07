-- Create an RPC to fetch public stats for the homepage
-- SECURITY DEFINER ensures it runs with the privileges of the creator
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reported_count int;
  resolved_count int;
  start_date timestamp;
BEGIN
  -- Laporan bulan ini
  start_date := date_trunc('month', CURRENT_TIMESTAMP);

  -- Count all reports created this month
  SELECT count(*) INTO reported_count
  FROM reports
  WHERE created_at >= start_date;

  -- Count all reports resolved this month
  SELECT count(*) INTO resolved_count
  FROM reports
  WHERE status = 'Resolved' AND closed_at >= start_date;

  RETURN json_build_object(
    'reported_this_month', reported_count,
    'resolved_this_month', resolved_count
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_stats() TO anon, authenticated;
