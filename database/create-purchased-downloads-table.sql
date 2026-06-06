-- Create purchased_downloads table
CREATE TABLE IF NOT EXISTS purchased_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  package_url TEXT NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT FALSE,
  amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful indexes for dashboard lookup and payment updates
CREATE INDEX IF NOT EXISTS idx_purchased_downloads_user_id
  ON purchased_downloads(user_id);

CREATE INDEX IF NOT EXISTS idx_purchased_downloads_email
  ON purchased_downloads(email);

CREATE INDEX IF NOT EXISTS idx_purchased_downloads_payment_verified
  ON purchased_downloads(payment_verified);

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION update_purchased_downloads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS purchased_downloads_set_updated_at ON purchased_downloads;
CREATE TRIGGER purchased_downloads_set_updated_at
BEFORE UPDATE ON purchased_downloads
FOR EACH ROW
EXECUTE FUNCTION update_purchased_downloads_updated_at();
