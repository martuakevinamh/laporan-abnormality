-- Migration: Add is_active and email to admins table

ALTER TABLE admins 
ADD COLUMN is_active boolean DEFAULT true,
ADD COLUMN email text;

-- (Optional) If you want to make sure future admins have valid roles
-- You can add the CHECK constraint if it doesn't exist yet:
-- ALTER TABLE admins ADD CONSTRAINT admins_role_check CHECK (role IN ('superadmin', 'admin'));
