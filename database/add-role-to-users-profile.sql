-- Add role column to users_profile table
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);

-- Update existing users to have 'user' role if null
UPDATE users_profile 
SET role = 'user' 
WHERE role IS NULL;
