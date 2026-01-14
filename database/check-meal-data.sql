-- Check if data exists in meal_timetable table
SELECT COUNT(*) as total_records FROM meal_timetable;

-- Check data for your user
SELECT COUNT(*) as my_records FROM meal_timetable WHERE user_id = auth.uid();

-- View all data for your user
SELECT 
  day_of_week, 
  week_number, 
  breakfast, 
  lunch, 
  dinner,
  user_id
FROM meal_timetable 
WHERE user_id = auth.uid()
ORDER BY 
  week_number,
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END;

-- Check if there's data for any user
SELECT 
  user_id,
  COUNT(*) as record_count
FROM meal_timetable
GROUP BY user_id;

-- View table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_timetable'
ORDER BY ordinal_position;
