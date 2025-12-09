-- Create subscription tokens table
CREATE TABLE IF NOT EXISTS subscription_tokens (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  reference TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription downloads table
CREATE TABLE IF NOT EXISTS subscription_downloads (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reference TEXT NOT NULL,
  week INTEGER NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, week)
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reference TEXT,
  feedback TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_token ON subscription_tokens(token);
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_email ON subscription_tokens(email);
CREATE INDEX IF NOT EXISTS idx_subscription_downloads_email ON subscription_downloads(email);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);

