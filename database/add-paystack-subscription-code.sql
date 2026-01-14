-- Add paystack_subscription_code and paystack_email_token columns to meal subscription tables
-- These are needed to cancel subscriptions on Paystack

ALTER TABLE meal_basic 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

ALTER TABLE meal_premium 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

ALTER TABLE meal_vip 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

-- Also add to users_profile for quick reference
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT,
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;
