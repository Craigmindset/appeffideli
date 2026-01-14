-- Step 1: Create the meal_timetable table (run this first)
-- This script creates the table and inserts demo data

-- Create meal timetable table for storing daily meal plans
CREATE TABLE IF NOT EXISTS meal_timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  week_number INTEGER DEFAULT 1,
  
  -- Breakfast (7:00 AM)
  breakfast TEXT,
  breakfast_time TIME DEFAULT '07:00:00',
  breakfast_notes TEXT,
  
  -- Morning Snack/Tea (9:30 AM)
  morning_snack TEXT,
  morning_snack_time TIME DEFAULT '09:30:00',
  morning_snack_notes TEXT,
  
  -- Lunch (12:30 PM)
  lunch TEXT,
  lunch_time TIME DEFAULT '12:30:00',
  lunch_notes TEXT,
  
  -- Afternoon Bites/Tea/Coffee (3:00 PM)
  afternoon_bites TEXT,
  afternoon_bites_time TIME DEFAULT '15:00:00',
  afternoon_bites_notes TEXT,
  
  -- Dinner (6:00 PM)
  dinner TEXT,
  dinner_time TIME DEFAULT '18:00:00',
  dinner_notes TEXT,
  
  -- Side Dish (6:00 PM)
  side_dish TEXT,
  side_dish_time TIME DEFAULT '18:00:00',
  side_dish_notes TEXT,
  
  -- Evening Snack/Tea/Coffee (8:00 PM)
  evening_snack TEXT,
  evening_snack_time TIME DEFAULT '20:00:00',
  evening_snack_notes TEXT,
  
  -- Dessert (8:00 PM)
  dessert TEXT,
  dessert_time TIME DEFAULT '20:00:00',
  dessert_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one timetable entry per user per day per week
  UNIQUE(user_id, day_of_week, week_number)
);

-- Enable Row Level Security
ALTER TABLE meal_timetable ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own meal timetable"
  ON meal_timetable
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal timetable"
  ON meal_timetable
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal timetable"
  ON meal_timetable
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal timetable"
  ON meal_timetable
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_timetable_user_id ON meal_timetable(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_timetable_day ON meal_timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_meal_timetable_week ON meal_timetable(week_number);

-- Create or replace function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_meal_timetable_updated_at ON meal_timetable;
CREATE TRIGGER update_meal_timetable_updated_at
  BEFORE UPDATE ON meal_timetable
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Insert demo meal timetable data for a week
-- Note: You'll need to replace 'YOUR-USER-ID' with an actual user ID from auth.users
-- Or you can remove the user_id constraint temporarily for demo data

-- To insert data for a specific user, first get their ID:
-- SELECT id FROM auth.users LIMIT 1;

-- Then use it below (replace the placeholder)

-- IMPORTANT: Replace 'YOUR-USER-ID-HERE' with actual user ID or use the following approach:
-- For demo purposes without user_id requirement, you can temporarily disable RLS:
-- ALTER TABLE meal_timetable DISABLE ROW LEVEL SECURITY;

-- Insert Monday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Monday',
  1,
  'Akamu (Pap) with Akara',
  'Tea with Biscuits',
  'Jollof Rice with Chicken',
  'Chin-Chin with Zobo',
  'Eba with Egusi Soup',
  'Fried Plantain',
  'Coffee with Meat Pie',
  'Fresh Fruit Salad'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Tuesday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Tuesday',
  1,
  'Bread with Scrambled Eggs',
  'Smoothie with Banana',
  'Fried Rice with Fish',
  'Puff Puff with Tea',
  'Pounded Yam with Vegetable Soup',
  'Steamed Vegetables',
  'Hot Chocolate with Doughnut',
  'Yogurt with Granola'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Wednesday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Wednesday',
  1,
  'Yam Porridge with Vegetables',
  'Tiger Nuts with Coconut',
  'Ofada Rice with Ayamase',
  'Garden Egg with Groundnut',
  'Tuwo Shinkafa with Miyan Kuka',
  'Fried Fish',
  'Herbal Tea with Chin-Chin',
  'Coconut Candy'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Thursday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Thursday',
  1,
  'Pancakes with Honey',
  'Plantain Chips with Zobo',
  'Spaghetti Jollof with Beef',
  'Roasted Groundnut',
  'Semovita with Okra Soup',
  'Grilled Chicken',
  'Lipton Tea with Biscuits',
  'Puff Puff'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Friday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Friday',
  1,
  'Fried Plantain with Beans',
  'Fruit Smoothie (Mango)',
  'White Rice with Stew',
  'Boli with Groundnut',
  'Fufu with Banga Soup',
  'Fried Fish',
  'Ginger Tea with Cake',
  'Ice Cream'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Saturday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Saturday',
  1,
  'Indomie with Eggs',
  'Orange Juice with Cookies',
  'Pepper Soup with Agidi',
  'Suya with Cucumber',
  'Amala with Ewedu',
  'Assorted Meat',
  'Milo with Bread',
  'Chocolate Cake'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Insert Sunday's meal plan
INSERT INTO meal_timetable (
  day_of_week,
  week_number,
  breakfast,
  morning_snack,
  lunch,
  afternoon_bites,
  dinner,
  side_dish,
  evening_snack,
  dessert
) VALUES (
  'Sunday',
  1,
  'French Toast with Fruits',
  'Chapman with Peanuts',
  'Coconut Rice with Chicken',
  'Moi Moi with Bread',
  'Oha Soup with Pounded Yam',
  'Fried Plantain',
  'Coffee with Buns',
  'Fruit Parfait'
) ON CONFLICT (user_id, day_of_week, week_number) DO NOTHING;

-- Verify the inserted data
SELECT day_of_week, breakfast, lunch, dinner 
FROM meal_timetable 
WHERE week_number = 1
ORDER BY 
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END;
