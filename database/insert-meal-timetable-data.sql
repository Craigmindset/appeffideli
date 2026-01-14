-- Insert demo meal timetable data for a week
-- This matches the data from the client-side meal-timetable page

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM meal_timetable;

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
);

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
);

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
);

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
);

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
);

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
);

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
);

-- Verify the inserted data
SELECT day_of_week, breakfast, lunch, dinner 
FROM meal_timetable 
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
