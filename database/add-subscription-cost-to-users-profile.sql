-- Add sub_cost column to users_profile table
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS sub_cost DECIMAL(10, 2) DEFAULT NULL;

-- Create a function to calculate subscription cost based on meal_subscription
CREATE OR REPLACE FUNCTION calculate_subscription_cost(subscription TEXT)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  CASE subscription
    WHEN 'meal_basic' THEN RETURN 3500::DECIMAL;
    WHEN 'meal_premium' THEN RETURN 5000::DECIMAL;
    WHEN 'meal_vip' THEN RETURN 7999::DECIMAL;
    ELSE RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing records with their subscription costs
UPDATE users_profile
SET sub_cost = calculate_subscription_cost(meal_subscription)
WHERE meal_subscription IS NOT NULL;

-- Create a trigger to automatically update sub_cost when meal_subscription changes
CREATE OR REPLACE FUNCTION update_subscription_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sub_cost := calculate_subscription_cost(NEW.meal_subscription);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_subscription_cost ON users_profile;

-- Create the trigger
CREATE TRIGGER trigger_update_subscription_cost
BEFORE INSERT OR UPDATE ON users_profile
FOR EACH ROW
EXECUTE FUNCTION update_subscription_cost();

-- Create an index on sub_cost for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_sub_cost ON users_profile(sub_cost);
