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
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createBrowserSupabaseClient } from "@/lib/supabase";

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
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserSupabaseClient();
  const timetableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMealTimetable();
  }, []);

  const fetchMealTimetable = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching meal timetable...");

      const { data, error: fetchError } = await supabase
        .from("meal_timetable")
        .select("*")
        .eq("week_number", 1);

      console.log("Fetch result:", { data, error: fetchError });

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        console.warn("No data returned from meal_timetable");
        setMealPlans([]);
        return;
      }

      console.log("Raw data from database:", data);

      // Map database fields to component format
      const mappedData: MealPlan[] = (data || []).map((item: any) => ({
        id: item.id,
        day: item.day_of_week,
        breakfast: item.breakfast || "",
        "snack/tea": item.morning_snack || "",
        lunch: item.lunch || "",
        "snack/bites-1": item.afternoon_bites || "",
        dinner: item.dinner || "",
        sideDish: item.side_dish || "",
        "snack/bites-2": item.evening_snack || "",
        dessert: item.dessert || "",
      }));

      console.log("Mapped data:", mappedData);

      // Sort by day of week
      const dayOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      mappedData.sort(
        (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
      );

      console.log("Final sorted data:", mappedData);
      setMealPlans(mappedData);
    } catch (err: any) {
      console.error("Error fetching meal timetable:", err);
      setError(err.message || "Failed to load meal timetable");
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-muted-foreground">
                  Loading meal timetable...
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-destructive">Error: {error}</div>
                <Button
                  onClick={fetchMealTimetable}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : mealPlans.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No meal plans found for this week
              </div>
            </CardContent>
          </Card>
        ) : (
          mealPlans.map((plan) => (
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
          ))
        )}
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
