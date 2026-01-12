-- First, add meal_subscription column to users_profile table
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS meal_subscription TEXT CHECK (meal_subscription IN ('meal_basic', 'meal_premium', 'meal_vip')),
ADD COLUMN IF NOT EXISTS meal_subscription_status TEXT DEFAULT 'inactive' CHECK (meal_subscription_status IN ('active', 'inactive', 'cancelled')),
ADD COLUMN IF NOT EXISTS meal_subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS meal_subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS meal_subscription_reference TEXT;

-- Create meal_basic table
CREATE TABLE IF NOT EXISTS meal_basic (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_reference TEXT UNIQUE NOT NULL,
  payment_reference TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_premium table
CREATE TABLE IF NOT EXISTS meal_premium (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_reference TEXT UNIQUE NOT NULL,
  payment_reference TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_vip table
CREATE TABLE IF NOT EXISTS meal_vip (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_reference TEXT UNIQUE NOT NULL,
  payment_reference TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE meal_basic ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_premium ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_vip ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_basic
CREATE POLICY "Users can read own meal_basic subscription"
  ON meal_basic
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_basic subscription"
  ON meal_basic
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_basic subscription"
  ON meal_basic
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for meal_premium
CREATE POLICY "Users can read own meal_premium subscription"
  ON meal_premium
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_premium subscription"
  ON meal_premium
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_premium subscription"
  ON meal_premium
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for meal_vip
CREATE POLICY "Users can read own meal_vip subscription"
  ON meal_vip
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_vip subscription"
  ON meal_vip
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_vip subscription"
  ON meal_vip
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at on all tables
CREATE TRIGGER update_meal_basic_updated_at
  BEFORE UPDATE ON meal_basic
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_premium_updated_at
  BEFORE UPDATE ON meal_premium
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_vip_updated_at
  BEFORE UPDATE ON meal_vip
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS meal_basic_user_id_idx ON meal_basic(user_id);
CREATE INDEX IF NOT EXISTS meal_basic_subscription_reference_idx ON meal_basic(subscription_reference);

CREATE INDEX IF NOT EXISTS meal_premium_user_id_idx ON meal_premium(user_id);
CREATE INDEX IF NOT EXISTS meal_premium_subscription_reference_idx ON meal_premium(subscription_reference);

CREATE INDEX IF NOT EXISTS meal_vip_user_id_idx ON meal_vip(user_id);
CREATE INDEX IF NOT EXISTS meal_vip_subscription_reference_idx ON meal_vip(subscription_reference);
