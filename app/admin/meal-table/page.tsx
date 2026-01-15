"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Edit2, X, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface MealData {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

export default function AdminMealTablePage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMeal, setEditedMeal] = useState<MealData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("meal_timetable")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast({
        title: "Error",
        description: "Failed to load meal timetable",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (meal: MealData) => {
    setEditingId(meal.id);
    setEditedMeal({ ...meal });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedMeal(null);
  };

  const handleSave = async () => {
    if (!editedMeal) return;

    setIsSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("meal_timetable")
        .update({
          breakfast: editedMeal.breakfast,
          lunch: editedMeal.lunch,
          dinner: editedMeal.dinner,
          snack: editedMeal.snack,
        })
        .eq("id", editedMeal.id);

      if (error) throw error;

      // Update local state
      setMeals(
        meals.map((meal) => (meal.id === editedMeal.id ? editedMeal : meal))
      );

      toast({
        title: "Success",
        description: "Meal timetable updated successfully",
      });

      setEditingId(null);
      setEditedMeal(null);
    } catch (error) {
      console.error("Error saving meal:", error);
      toast({
        title: "Error",
        description: "Failed to update meal timetable",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof MealData, value: string) => {
    if (editedMeal) {
      setEditedMeal({ ...editedMeal, [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Meal Timetable
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          View and edit the weekly meal timetable
        </p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Weekly Meal Plan</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Edit meal plans for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700 dark:bg-gray-700/50">
                  <TableHead className="dark:text-gray-200">Day</TableHead>
                  <TableHead className="dark:text-gray-200">
                    Breakfast
                  </TableHead>
                  <TableHead className="dark:text-gray-200">Lunch</TableHead>
                  <TableHead className="dark:text-gray-200">Dinner</TableHead>
                  <TableHead className="dark:text-gray-200">Snack</TableHead>
                  <TableHead className="dark:text-gray-200 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2">Loading meal data...</p>
                    </TableCell>
                  </TableRow>
                ) : meals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 dark:text-gray-400"
                    >
                      No meal data found
                    </TableCell>
                  </TableRow>
                ) : (
                  meals.map((meal) => {
                    const isEditing = editingId === meal.id;
                    const displayMeal = isEditing ? editedMeal! : meal;

                    return (
                      <TableRow
                        key={meal.id}
                        className="dark:border-gray-700 dark:hover:bg-gray-700/50"
                      >
                        <TableCell className="font-medium dark:text-white">
                          {meal.day}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {isEditing ? (
                            <Input
                              value={displayMeal.breakfast}
                              onChange={(e) =>
                                handleInputChange("breakfast", e.target.value)
                              }
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            displayMeal.breakfast
                          )}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {isEditing ? (
                            <Input
                              value={displayMeal.lunch}
                              onChange={(e) =>
                                handleInputChange("lunch", e.target.value)
                              }
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            displayMeal.lunch
                          )}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {isEditing ? (
                            <Input
                              value={displayMeal.dinner}
                              onChange={(e) =>
                                handleInputChange("dinner", e.target.value)
                              }
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            displayMeal.dinner
                          )}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {isEditing ? (
                            <Input
                              value={displayMeal.snack}
                              onChange={(e) =>
                                handleInputChange("snack", e.target.value)
                              }
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          ) : (
                            displayMeal.snack
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="dark:bg-green-600 dark:hover:bg-green-700"
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(meal)}
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
