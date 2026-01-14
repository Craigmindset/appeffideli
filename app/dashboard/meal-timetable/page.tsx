"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface MealPlan {
  id: string;
  day: string;
  breakfast: string;
  morningSnack: string;
  lunch: string;
  afternoonBites: string;
  dinner: string;
  sideDish: string;
  eveningSnack: string;
  dessert: string;
}

const mealTimes = [
  { key: "breakfast", label: "🍳 Breakfast", time: "7:00 AM" },
  { key: "morningSnack", label: "☕ Morning Snack/Tea", time: "9:30 AM" },
  { key: "lunch", label: "🍽️ Lunch", time: "12:30 PM" },
  { key: "afternoonBites", label: "🫖 Afternoon Bites/Tea", time: "3:00 PM" },
  { key: "dinner", label: "🍲 Dinner", time: "6:00 PM" },
  { key: "sideDish", label: "🥗 Side Dish", time: "6:00 PM" },
  { key: "eveningSnack", label: "☕ Evening Snack/Tea", time: "8:00 PM" },
  { key: "dessert", label: "🍰 Dessert", time: "8:00 PM" },
];

export default function MealTimetablePage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([
    {
      id: "1",
      day: "Monday",
      breakfast: "Akamu (Pap) with Akara",
      morningSnack: "Tea with Biscuits",
      lunch: "Jollof Rice with Chicken",
      afternoonBites: "Chin-Chin with Zobo",
      dinner: "Eba with Egusi Soup",
      sideDish: "Fried Plantain",
      eveningSnack: "Coffee with Meat Pie",
      dessert: "Fresh Fruit Salad",
    },
    {
      id: "2",
      day: "Tuesday",
      breakfast: "Bread with Scrambled Eggs",
      morningSnack: "Smoothie with Banana",
      lunch: "Fried Rice with Fish",
      afternoonBites: "Puff Puff with Tea",
      dinner: "Pounded Yam with Vegetable Soup",
      sideDish: "Steamed Vegetables",
      eveningSnack: "Hot Chocolate with Doughnut",
      dessert: "Yogurt with Granola",
    },
    {
      id: "3",
      day: "Wednesday",
      breakfast: "Yam Porridge with Vegetables",
      morningSnack: "Tiger Nuts with Coconut",
      lunch: "Ofada Rice with Ayamase",
      afternoonBites: "Garden Egg with Groundnut",
      dinner: "Tuwo Shinkafa with Miyan Kuka",
      sideDish: "Fried Fish",
      eveningSnack: "Herbal Tea with Chin-Chin",
      dessert: "Coconut Candy",
    },
    {
      id: "4",
      day: "Thursday",
      breakfast: "Pancakes with Honey",
      morningSnack: "Plantain Chips with Zobo",
      lunch: "Spaghetti Jollof with Beef",
      afternoonBites: "Roasted Groundnut",
      dinner: "Semovita with Okra Soup",
      sideDish: "Grilled Chicken",
      eveningSnack: "Lipton Tea with Biscuits",
      dessert: "Puff Puff",
    },
    {
      id: "5",
      day: "Friday",
      breakfast: "Fried Plantain with Beans",
      morningSnack: "Fruit Smoothie (Mango)",
      lunch: "White Rice with Stew",
      afternoonBites: "Boli with Groundnut",
      dinner: "Fufu with Banga Soup",
      sideDish: "Fried Fish",
      eveningSnack: "Ginger Tea with Cake",
      dessert: "Ice Cream",
    },
    {
      id: "6",
      day: "Saturday",
      breakfast: "Indomie with Eggs",
      morningSnack: "Orange Juice with Cookies",
      lunch: "Pepper Soup with Agidi",
      afternoonBites: "Suya with Cucumber",
      dinner: "Amala with Ewedu",
      sideDish: "Assorted Meat",
      eveningSnack: "Milo with Bread",
      dessert: "Chocolate Cake",
    },
    {
      id: "7",
      day: "Sunday",
      breakfast: "French Toast with Fruits",
      morningSnack: "Chapman with Peanuts",
      lunch: "Coconut Rice with Chicken",
      afternoonBites: "Moi Moi with Bread",
      dinner: "Oha Soup with Pounded Yam",
      sideDish: "Fried Plantain",
      eveningSnack: "Coffee with Buns",
      dessert: "Fruit Parfait",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meal Timetable</h1>
        <p className="text-muted-foreground mt-2">
          View your weekly meal schedule (Admin-managed)
        </p>
      </div>

      <div className="grid gap-4">
        {mealPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>{plan.day}</CardTitle>
                <Badge variant="outline">This Week</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
                {mealTimes.map((meal) => {
                  const mealValue = plan[meal.key as keyof MealPlan];
                  if (!mealValue) return null;
                  return (
                    <div
                      key={meal.key}
                      className="space-y-1 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
                        <span className="text-base">{meal.label}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{meal.time}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {mealValue as string}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition Tips</CardTitle>
          <CardDescription>
            Important guidelines for a healthy meal plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Ensure each meal includes a balance of proteins, carbohydrates,
                and healthy fats
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Include at least 5 servings of fruits and vegetables daily
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Stay hydrated by drinking water throughout the day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                Plan meals ahead to maintain consistency and avoid unhealthy
                choices
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
