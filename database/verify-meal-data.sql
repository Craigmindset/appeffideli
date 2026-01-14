-- Verify meal timetable data insertion
-- Run this query to check what data exists

-- 1. Check total records in meal_timetable
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT week_number) as unique_weeks
FROM meal_timetable;

-- 2. Check records by user
SELECT 
  user_id,
  COUNT(*) as meal_count,
  STRING_AGG(DISTINCT day_of_week, ', ' ORDER BY day_of_week) as days_covered
FROM meal_timetable
GROUP BY user_id;

-- 3. View sample data with user info
SELECT 
  m.user_id,
  u.email,
  m.day_of_week,
  m.week_number,
  m.breakfast,
  m.lunch,
  m.dinner
FROM meal_timetable m
LEFT JOIN auth.users u ON m.user_id = u.id
ORDER BY m.week_number, 
  CASE m.day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END
LIMIT 10;

-- 4. Check all users in the system
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 5. If data exists but not showing, check if user_id matches
-- Replace YOUR_LOGGED_IN_USER_ID with the user ID from the app console
-- SELECT * FROM meal_timetable WHERE user_id = 'YOUR_LOGGED_IN_USER_ID';
