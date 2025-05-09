-- First, disable RLS temporarily to allow the migration to run
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can view admin_roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can insert admin_roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can update admin_roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can delete admin_roles" ON admin_roles;

-- Create a policy that allows public access for SELECT
-- This is necessary for the isUserAdmin function to work properly
CREATE POLICY "Public access to admin_roles"
  ON admin_roles FOR SELECT
  USING (true);

-- Re-enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Add a comment to explain why this policy is necessary
COMMENT ON POLICY "Public access to admin_roles" ON admin_roles
  IS 'Allows public SELECT access to admin_roles table for authentication checks';
