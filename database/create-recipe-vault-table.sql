-- Create recipe_vault table
CREATE TABLE IF NOT EXISTS recipe_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  recipe_suit TEXT,
  image_url TEXT,
  pdf_file TEXT,
  youtube_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_recipe_vault_title ON recipe_vault(title);
CREATE INDEX IF NOT EXISTS idx_recipe_vault_recipe_suit ON recipe_vault(recipe_suit);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipe_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS recipe_vault_set_updated_at ON recipe_vault;
CREATE TRIGGER recipe_vault_set_updated_at
BEFORE UPDATE ON recipe_vault
FOR EACH ROW
EXECUTE FUNCTION update_recipe_vault_updated_at();

-- Insert sample data
INSERT INTO recipe_vault (title, description, recipe_suit, image_url, pdf_file, youtube_link) VALUES
('Classic Jollof Rice', 'A beloved West African one-pot rice dish cooked in a rich tomato sauce with aromatic spices and vegetables.', 'Family Meals', '/images/sample-recipe.jpg', '/pdfs/jollof-rice.pdf', 'https://www.youtube.com/watch?v=sample1'),
('Creamy Chicken Alfredo', 'Tender chicken breast in a velvety parmesan cream sauce served over fresh fettuccine pasta.', 'International Cuisine', '/images/sample-recipe.jpg', '/pdfs/chicken-alfredo.pdf', 'https://www.youtube.com/watch?v=sample2'),
('Baby-Friendly Veggie Puree', 'Nutritious blended vegetables perfect for introducing solids to babies 6+ months.', 'Baby-Friendly', '/images/sample-recipe.jpg', '/pdfs/veggie-puree.pdf', 'https://www.youtube.com/watch?v=sample3');
