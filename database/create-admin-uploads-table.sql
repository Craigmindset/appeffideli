-- Create admin_uploads table to store document metadata
CREATE TABLE IF NOT EXISTS admin_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('infant_recipe', 'meal_plan', 'nutrition_guide', 'health_plan')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_uploads_category ON admin_uploads(category);

-- Enable Row Level Security
ALTER TABLE admin_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admins can do everything
CREATE POLICY "Admins can manage uploads"
  ON admin_uploads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- Users can read uploads
CREATE POLICY "Users can read uploads"
  ON admin_uploads
  FOR SELECT
  USING (true);

-- Create a function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_admin_uploads_updated_at ON admin_uploads;
CREATE TRIGGER update_admin_uploads_updated_at
BEFORE UPDATE ON admin_uploads
FOR EACH ROW
EXECUTE FUNCTION update_admin_uploads_updated_at();
