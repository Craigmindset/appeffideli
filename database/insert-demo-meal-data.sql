-- Insert demo meal timetable data
-- This script will automatically use your logged-in user ID
-- If you want to specify a different user, replace the auth.uid() with a specific UUID

-- First, let's check your user ID (uncomment to view)
-- SELECT id, email FROM auth.users;

-- Monday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Monday',
  1,
  'Akamu (Pap) with Akara and Bread',
  'Tea with Biscuits',
  'Jollof Rice with Grilled Chicken and Coleslaw',
  'Chin-Chin with Zobo',
  'Eba with Egusi Soup',
  'Fried Plantain',
  'Coffee with Meat Pie',
  'Fresh Fruit Salad'
);

-- Tuesday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Tuesday',
  1,
  'Bread with Scrambled Eggs and Avocado',
  'Smoothie with Banana and Milk',
  'Fried Rice with Fish and Salad',
  'Puff Puff with Tea',
  'Pounded Yam with Vegetable Soup',
  'Steamed Vegetables',
  'Hot Chocolate with Doughnut',
  'Yogurt with Granola'
);

-- Wednesday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Wednesday',
  1,
  'Yam Porridge with Vegetables',
  'Tiger Nuts (Aya) with Coconut',
  'Ofada Rice with Ayamase Sauce and Chicken',
  'Garden Egg with Groundnut',
  'Tuwo Shinkafa with Miyan Kuka',
  'Fried Fish',
  'Herbal Tea with Chin-Chin',
  'Coconut Candy'
);

-- Thursday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Thursday',
  1,
  'Pancakes with Honey and Fresh Fruits',
  'Plantain Chips with Zobo',
  'Spaghetti Jollof with Beef and Vegetables',
  'Roasted Groundnut with Coconut',
  'Semovita with Okra Soup',
  'Grilled Chicken',
  'Lipton Tea with Biscuits',
  'Puff Puff'
);

-- Friday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Friday',
  1,
  'Fried Plantain with Beans Porridge',
  'Fruit Smoothie (Mango, Pineapple)',
  'White Rice with Stew and Goat Meat',
  'Boli (Roasted Plantain) with Groundnut',
  'Fufu with Banga Soup',
  'Fried Fish',
  'Ginger Tea with Cake',
  'Ice Cream'
);

-- Saturday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Saturday',
  1,
  'Indomie with Eggs and Sausages',
  'Fresh Orange Juice with Cookies',
  'Pepper Soup with Assorted Meat and Agidi',
  'Suya with Sliced Cucumber',
  'Amala with Ewedu and Gbegiri Soup',
  'Assorted Meat',
  'Milo with Bread',
  'Chocolate Cake'
);

-- Sunday
INSERT INTO meal_timetable (
  user_id, 
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
  auth.uid(),
  'Sunday',
  1,
  'French Toast with Syrup and Fruits',
  'Chapman with Peanuts',
  'Coconut Rice with Stewed Chicken',
  'Moi Moi with Bread',
  'Oha Soup with Pounded Yam',
  'Fried Plantain',
  'Coffee with Buns',
  'Fruit Parfait'
);

-- Verify the inserted data
SELECT * FROM meal_timetable WHERE user_id = auth.uid() ORDER BY 
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
    WHEN 'Sunday' THEN 7
  END;
