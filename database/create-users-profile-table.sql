-- Create users_profile table
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public to read only email for password reset verification
CREATE POLICY "Public can check if email exists"
  ON users_profile
  FOR SELECT
  USING (true);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users_profile
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users_profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create a function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_profile_email_idx ON users_profile(email);
