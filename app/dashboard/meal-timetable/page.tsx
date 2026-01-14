"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download } from "lucide-react";
import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface MealPlan {
  id: string;
  day: string;
  breakfast: string;
  [key: string]: string;
}

const mealTimes = [
  { key: "breakfast", label: "🍳 Breakfast", time: "7:00 AM" },
  { key: "snack/tea", label: "Snack/Tea", time: "9:30 AM" },
  { key: "lunch", label: "🍽️ Lunch", time: "12:30 PM" },
  { key: "snack/bites-1", label: "Snack/Bites-1", time: "3:00 PM" },
  { key: "dinner", label: "🍲 Dinner", time: "6:00 PM" },
  { key: "sideDish", label: "🥗 Side Dish", time: "6:00 PM" },
  { key: "snack/bites-2", label: "Snack/Bites-2", time: "8:00 PM" },
  { key: "dessert", label: "🍰 Dessert", time: "8:00 PM" },
];

export default function MealTimetablePage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([
    {
      id: "1",
      day: "Monday",
      breakfast: "Akamu (Pap) with Akara",
      "snack/tea": "Tea with Biscuits",
      lunch: "Jollof Rice with Chicken",
      "snack/bites-1": "Chin-Chin with Zobo",
      dinner: "Eba with Egusi Soup",
      sideDish: "Fried Plantain",
      "snack/bites-2": "Coffee with Meat Pie",
      dessert: "Fresh Fruit Salad",
    },
    {
      id: "1",
      day: "Monday",
      breakfast: "Akamu (Pap) with Akara",
      "snack/tea": "Tea with Biscuits",
      lunch: "Jollof Rice with Chicken",
      "snack/bites-1": "Chin-Chin with Zobo",
      dinner: "Eba with Egusi Soup",
      sideDish: "Fried Plantain",
      "snack/bites-2": "Coffee with Meat Pie",
      dessert: "Fresh Fruit Salad",
    },
    {
      id: "2",
      day: "Tuesday",
      breakfast: "Bread with Scrambled Eggs",
      "snack/tea": "Smoothie with Banana",
      lunch: "Fried Rice with Fish",
      "snack/bites-1": "Puff Puff with Tea",
      dinner: "Pounded Yam with Vegetable Soup",
      sideDish: "Steamed Vegetables",
      "snack/bites-2": "Hot Chocolate with Doughnut",
      dessert: "Yogurt with Granola",
    },
    {
      id: "3",
      day: "Wednesday",
      breakfast: "Yam Porridge with Vegetables",
      "snack/tea": "Tiger Nuts with Coconut",
      lunch: "Ofada Rice with Ayamase",
      "snack/bites-1": "Garden Egg with Groundnut",
      dinner: "Tuwo Shinkafa with Miyan Kuka",
      sideDish: "Fried Fish",
      "snack/bites-2": "Herbal Tea with Chin-Chin",
      dessert: "Coconut Candy",
    },
    {
      id: "4",
      day: "Thursday",
      breakfast: "Pancakes with Honey",
      "snack/tea": "Plantain Chips with Zobo",
      lunch: "Spaghetti Jollof with Beef",
      "snack/bites-1": "Roasted Groundnut",
      dinner: "Semovita with Okra Soup",
      sideDish: "Grilled Chicken",
      "snack/bites-2": "Lipton Tea with Biscuits",
      dessert: "Puff Puff",
    },
    {
      id: "5",
      day: "Friday",
      breakfast: "Fried Plantain with Beans",
      "snack/tea": "Fruit Smoothie (Mango)",
      lunch: "White Rice with Stew",
      "snack/bites-1": "Boli with Groundnut",
      dinner: "Fufu with Banga Soup",
      sideDish: "Fried Fish",
      "snack/bites-2": "Ginger Tea with Cake",
      dessert: "Ice Cream",
    },
    {
      id: "6",
      day: "Saturday",
      breakfast: "Indomie with Eggs",
      "snack/tea": "Orange Juice with Cookies",
      lunch: "Pepper Soup with Agidi",
      "snack/bites-1": "Suya with Cucumber",
      dinner: "Amala with Ewedu",
      sideDish: "Assorted Meat",
      "snack/bites-2": "Milo with Bread",
      dessert: "Chocolate Cake",
    },
    {
      id: "7",
      day: "Sunday",
      breakfast: "French Toast with Fruits",
      "snack/tea": "Chapman with Peanuts",
      lunch: "Coconut Rice with Chicken",
      "snack/bites-1": "Moi Moi with Bread",
      dinner: "Oha Soup with Pounded Yam",
      sideDish: "Fried Plantain",
      "snack/bites-2": "Coffee with Buns",
      dessert: "Fruit Parfait",
    },
  ]);

  const timetableRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!timetableRef.current) return;

    try {
      const canvas = await html2canvas(timetableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("meal-timetable.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Timetable</h1>
          <p className="text-muted-foreground mt-2">
            View your weekly meal schedule
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={downloadPDF}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div ref={timetableRef} className="grid gap-4">
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
