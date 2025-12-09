-- Create subscription_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  reference TEXT NOT NULL,
  pin TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_downloads table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_downloads (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reference TEXT NOT NULL,
  week INTEGER NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, reference, week)
);

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reference TEXT,
  feedback TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add PIN column if it doesn't exist
ALTER TABLE subscription_tokens ADD COLUMN IF NOT EXISTS pin TEXT;

-- Create index on PIN
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_pin ON subscription_tokens(pin);

