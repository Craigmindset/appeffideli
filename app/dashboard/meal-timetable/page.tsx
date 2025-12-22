"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2, Clock } from "lucide-react";
import { useState } from "react";

interface MealPlan {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  time: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
}

export default function MealTimetablePage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([
    {
      id: "1",
      day: "Monday",
      breakfast: "Oatmeal with fruits",
      lunch: "Grilled chicken with vegetables",
      dinner: "Fish with brown rice",
      snacks: "Fresh fruits and nuts",
      time: {
        breakfast: "7:00 AM",
        lunch: "12:30 PM",
        dinner: "7:00 PM",
        snacks: "3:00 PM",
      },
    },
    {
      id: "2",
      day: "Tuesday",
      breakfast: "Whole grain toast with eggs",
      lunch: "Vegetable soup with bread",
      dinner: "Pasta with marinara sauce",
      snacks: "Yogurt with berries",
      time: {
        breakfast: "7:00 AM",
        lunch: "12:30 PM",
        dinner: "7:00 PM",
        snacks: "3:00 PM",
      },
    },
    {
      id: "3",
      day: "Wednesday",
      breakfast: "Smoothie bowl",
      lunch: "Rice with stew and salad",
      dinner: "Grilled turkey with veggies",
      snacks: "Granola bars",
      time: {
        breakfast: "7:00 AM",
        lunch: "12:30 PM",
        dinner: "7:00 PM",
        snacks: "3:00 PM",
      },
    },
    {
      id: "4",
      day: "Thursday",
      breakfast: "Pancakes with honey",
      lunch: "Chicken wrap with salad",
      dinner: "Vegetable stir-fry",
      snacks: "Fruit smoothie",
      time: {
        breakfast: "7:00 AM",
        lunch: "12:30 PM",
        dinner: "7:00 PM",
        snacks: "3:00 PM",
      },
    },
    {
      id: "5",
      day: "Friday",
      breakfast: "Cereal with milk",
      lunch: "Fish tacos",
      dinner: "Grilled beef with potatoes",
      snacks: "Trail mix",
      time: {
        breakfast: "7:00 AM",
        lunch: "12:30 PM",
        dinner: "7:00 PM",
        snacks: "3:00 PM",
      },
    },
    {
      id: "6",
      day: "Saturday",
      breakfast: "French toast",
      lunch: "Pizza with salad",
      dinner: "Roasted chicken with vegetables",
      snacks: "Cheese and crackers",
      time: {
        breakfast: "8:00 AM",
        lunch: "1:00 PM",
        dinner: "7:30 PM",
        snacks: "4:00 PM",
      },
    },
    {
      id: "7",
      day: "Sunday",
      breakfast: "Waffles with fruits",
      lunch: "Pasta salad",
      dinner: "Beef stew with bread",
      snacks: "Ice cream",
      time: {
        breakfast: "8:00 AM",
        lunch: "1:00 PM",
        dinner: "7:30 PM",
        snacks: "4:00 PM",
      },
    },
  ]);

  const handleEdit = (id: string) => {
    console.log("Edit meal plan:", id);
    // Implement edit functionality
  };

  const handleDelete = (id: string) => {
    console.log("Delete meal plan:", id);
    // Implement delete functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meal Timetable</h1>
          <p className="text-muted-foreground mt-2">
            Plan and manage your weekly meal schedule
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <div className="grid gap-4">
        {mealPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>{plan.day}</CardTitle>
                  <Badge variant="outline">This Week</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Breakfast - {plan.time.breakfast}</span>
                  </div>
                  <p className="text-sm font-medium">{plan.breakfast}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Lunch - {plan.time.lunch}</span>
                  </div>
                  <p className="text-sm font-medium">{plan.lunch}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Dinner - {plan.time.dinner}</span>
                  </div>
                  <p className="text-sm font-medium">{plan.dinner}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Snacks - {plan.time.snacks}</span>
                  </div>
                  <p className="text-sm font-medium">{plan.snacks}</p>
                </div>
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
              <span>Ensure each meal includes a balance of proteins, carbohydrates, and healthy fats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Include at least 5 servings of fruits and vegetables daily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Stay hydrated by drinking water throughout the day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Plan meals ahead to maintain consistency and avoid unhealthy choices</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
