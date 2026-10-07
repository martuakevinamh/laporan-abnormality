-- Migration: Add area and public_note to reports, update get_report_status

ALTER TABLE reports ADD COLUMN public_note text;

DROP FUNCTION IF EXISTS get_report_status(text);

CREATE OR REPLACE FUNCTION get_report_status(p_report_number text)
RETURNS TABLE (
    report_number text,
    status report_status,
    created_at timestamptz,
    last_status_at timestamptz,
    hazard_level hazard_level,
    department_name text,
    area text,
    public_note text
) AS $$
BEGIN
    RETURN QUERY 
    SELECT r.report_number, r.status, r.created_at, r.last_status_at, r.hazard_level, d.name, r.area, r.public_note
    FROM reports r
    LEFT JOIN departments d ON r.department_id = d.id
    WHERE r.report_number = p_report_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
