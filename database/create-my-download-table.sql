-- Create my_download table
CREATE TABLE IF NOT EXISTS my_download (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  infant_recipe_guide BOOLEAN DEFAULT FALSE,
  meal_plan BOOLEAN DEFAULT FALSE,
  nutrition_guide_for_toddlers BOOLEAN DEFAULT FALSE,
  weight_loss BOOLEAN DEFAULT FALSE,
  health_nutrition_plan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one row per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_my_download_user_id ON my_download(user_id);

-- Enable Row Level Security
ALTER TABLE my_download ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own downloads
CREATE POLICY "Users can read own downloads"
  ON my_download
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own download record
CREATE POLICY "Users can insert own downloads"
  ON my_download
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own download record
CREATE POLICY "Users can update own downloads"
  ON my_download
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_my_download_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_my_download_updated_at ON my_download;
CREATE TRIGGER update_my_download_updated_at
BEFORE UPDATE ON my_download
FOR EACH ROW
EXECUTE FUNCTION update_my_download_updated_at();
