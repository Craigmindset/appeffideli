-- Create infant_recipes_guest_purchases table for guest checkout flow
CREATE TABLE IF NOT EXISTS infant_recipes_guest_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  purchase_reference TEXT NOT NULL UNIQUE,
  payment_reference TEXT,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('starter', 'standard')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_infant_guest_purchases_email
  ON infant_recipes_guest_purchases(email);

CREATE INDEX IF NOT EXISTS idx_infant_guest_purchases_reference
  ON infant_recipes_guest_purchases(purchase_reference);

CREATE INDEX IF NOT EXISTS idx_infant_guest_purchases_status
  ON infant_recipes_guest_purchases(status);

CREATE OR REPLACE FUNCTION update_infant_guest_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_infant_guest_purchases_updated_at ON infant_recipes_guest_purchases;
CREATE TRIGGER update_infant_guest_purchases_updated_at
  BEFORE UPDATE ON infant_recipes_guest_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_infant_guest_purchases_updated_at();
