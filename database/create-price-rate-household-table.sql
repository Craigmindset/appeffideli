-- Create household pricing table (Price_rate_Household)
CREATE TABLE IF NOT EXISTS Price_rate_Household (
  id BIGSERIAL PRIMARY KEY,
  apartment_type TEXT NOT NULL UNIQUE CHECK (
    apartment_type IN (
      'studio',
      'apartment',
      'bungalow',
      'duplex-terrace',
      'duplex-balcony'
    )
  ),
  home_type TEXT NOT NULL,
  pdf_rate INTEGER NOT NULL CHECK (pdf_rate >= 0),
  audio_rate INTEGER NOT NULL DEFAULT 0 CHECK (audio_rate >= 0),
  vat NUMERIC(5,2) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION update_price_rate_household_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_price_rate_household_updated_at_trigger ON Price_rate_Household;
CREATE TRIGGER update_price_rate_household_updated_at_trigger
BEFORE UPDATE ON Price_rate_Household
FOR EACH ROW
EXECUTE FUNCTION update_price_rate_household_updated_at();

-- Seed dedicated rows for each home type
INSERT INTO Price_rate_Household (apartment_type, home_type, pdf_rate, audio_rate, vat)
VALUES
  ('studio', 'Studio', 15000, 15000, NULL),
  ('apartment', 'Apartment', 20000, 20000, NULL),
  ('bungalow', 'Bungalow', 25000, 25000, NULL),
  ('duplex-terrace', 'Duplex/Terrace', 35000, 35000, NULL),
  ('duplex-balcony', 'Duplex with Balcony', 30000, 30000, NULL)
ON CONFLICT (apartment_type) DO UPDATE
SET
  home_type = EXCLUDED.home_type,
  pdf_rate = EXCLUDED.pdf_rate,
  audio_rate = EXCLUDED.audio_rate,
  vat = EXCLUDED.vat,
  updated_at = NOW();
