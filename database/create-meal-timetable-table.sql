-- Create meal timetable table for storing user's daily meal plans
CREATE TABLE IF NOT EXISTS meal_timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
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
CREATE INDEX idx_meal_timetable_user_id ON meal_timetable(user_id);
CREATE INDEX idx_meal_timetable_day ON meal_timetable(day_of_week);
CREATE INDEX idx_meal_timetable_week ON meal_timetable(week_number);

-- Create trigger for updated_at
CREATE TRIGGER update_meal_timetable_updated_at
  BEFORE UPDATE ON meal_timetable
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for a user (optional - remove user_id value or update with actual user ID)
-- EXAMPLE:
-- INSERT INTO meal_timetable (user_id, day_of_week, week_number, breakfast, lunch, dinner)
-- VALUES 
--   ('YOUR-USER-ID-HERE', 'Monday', 1, 'Akamu (Pap) with Akara', 'Jollof Rice with Chicken', 'Eba and Egusi Soup'),
--   ('YOUR-USER-ID-HERE', 'Tuesday', 1, 'Bread and Egg', 'Fried Rice with Fish', 'Pounded Yam with Vegetable Soup');
