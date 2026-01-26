-- Create infant_recipes_purchases table to track one-time recipe pack purchases
CREATE TABLE IF NOT EXISTS infant_recipes_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_infant_recipes_user_id ON infant_recipes_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_infant_recipes_reference ON infant_recipes_purchases(purchase_reference);
CREATE INDEX IF NOT EXISTS idx_infant_recipes_status ON infant_recipes_purchases(status);

-- Enable Row Level Security
ALTER TABLE infant_recipes_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for infant_recipes_purchases
CREATE POLICY "Users can view their own purchases"
  ON infant_recipes_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON infant_recipes_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all records
CREATE POLICY "Service role can manage all purchases"
  ON infant_recipes_purchases
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_infant_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_infant_recipes_purchases_updated_at ON infant_recipes_purchases;
CREATE TRIGGER update_infant_recipes_purchases_updated_at
  BEFORE UPDATE ON infant_recipes_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_infant_recipes_updated_at();

-- Comment on table
COMMENT ON TABLE infant_recipes_purchases IS 'Stores one-time infant and toddler recipe pack purchases';
COMMENT ON COLUMN infant_recipes_purchases.pack_type IS 'Type of pack purchased: starter (Basic) or standard';
COMMENT ON COLUMN infant_recipes_purchases.status IS 'Purchase status: pending, completed, failed, or refunded';
