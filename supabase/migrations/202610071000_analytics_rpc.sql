-- Fungsi untuk mengambil agregasi data analitik dashboard

CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_start_date timestamptz, p_end_date timestamptz)
RETURNS json AS $$
DECLARE
    v_total_reports int;
    v_resolved_count int;
    v_avg_resolution_days numeric;
    v_overdue_count int;
    
    v_monthly_stats json;
    v_dept_stats json;
    v_hazard_stats json;
    v_top_areas json;
BEGIN
    -- Base metrics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'Resolved'),
        COALESCE(AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/86400) FILTER (WHERE status = 'Resolved' AND closed_at IS NOT NULL), 0)
    INTO 
        v_total_reports, v_resolved_count, v_avg_resolution_days
    FROM reports
    WHERE created_at >= p_start_date AND created_at <= p_end_date;

    -- Overdue count (same logic as NotificationHeader: Reported > settings limits)
    SELECT COUNT(*) INTO v_overdue_count
    FROM reports r, settings s
    WHERE r.created_at >= p_start_date AND r.created_at <= p_end_date
      AND r.status = 'Reported'
      AND (EXTRACT(EPOCH FROM (now() - r.last_status_at))/86400) > 
          CASE r.hazard_level 
              WHEN 'Tinggi' THEN s.alert_high_days 
              WHEN 'Sedang' THEN s.alert_medium_days 
              ELSE s.alert_low_days 
          END;

    -- Monthly Incoming vs Resolved (for the date range, grouped by YYYY-MM)
    SELECT json_agg(row_to_json(t)) INTO v_monthly_stats
    FROM (
        SELECT 
            to_char(created_at, 'YYYY-MM') as month,
            COUNT(*) as incoming,
            COUNT(*) FILTER (WHERE status = 'Resolved') as resolved
        FROM reports
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY to_char(created_at, 'YYYY-MM')
        ORDER BY month
    ) t;

    -- Department Stats
    SELECT json_agg(row_to_json(t)) INTO v_dept_stats
    FROM (
        SELECT 
            d.name as department,
            COUNT(r.id) as total
        FROM reports r
        JOIN departments d ON r.department_id = d.id
        WHERE r.created_at >= p_start_date AND r.created_at <= p_end_date
        GROUP BY d.name
        ORDER BY total DESC
    ) t;

    -- Hazard Stats
    SELECT json_agg(row_to_json(t)) INTO v_hazard_stats
    FROM (
        SELECT 
            hazard_level as name,
            COUNT(*) as value
        FROM reports
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY hazard_level
    ) t;

    -- Top 5 Areas (normalize case and spaces)
    SELECT json_agg(row_to_json(t)) INTO v_top_areas
    FROM (
        SELECT 
            UPPER(TRIM(area)) as area_name,
            COUNT(*) as total
        FROM reports
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY UPPER(TRIM(area))
        ORDER BY total DESC
        LIMIT 5
    ) t;

    RETURN json_build_object(
        'metrics', json_build_object(
            'total', v_total_reports,
            'resolved', v_resolved_count,
            'resolved_percentage', CASE WHEN v_total_reports > 0 THEN ROUND((v_resolved_count::numeric / v_total_reports) * 100) ELSE 0 END,
            'avg_resolution_days', ROUND(v_avg_resolution_days, 1),
            'overdue_count', v_overdue_count
        ),
        'monthly', COALESCE(v_monthly_stats, '[]'::json),
        'departments', COALESCE(v_dept_stats, '[]'::json),
        'hazards', COALESCE(v_hazard_stats, '[]'::json),
        'top_areas', COALESCE(v_top_areas, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
