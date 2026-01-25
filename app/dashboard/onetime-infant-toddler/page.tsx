"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Calendar } from "lucide-react";

export default function OnetimeInfantToddlerPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }

        // Check subscription status from users_profile table
        const { data: profileData, error: profileError } = await supabase
          .from("users_profile")
          .select("meal_subscription_status")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Failed to verify subscription status");
          setIsLoading(false);
          return;
        }

        const status = profileData?.meal_subscription_status;
        setSubscriptionStatus(status);
        setIsLoading(false);
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError("Authentication failed");
        setIsLoading(false);
      }
    };

    checkAuthAndSubscription();
  }, []);

  // Show loading state while checking authentication and subscription
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            One-Time Infant & Toddler Recipe Packs
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose the perfect recipe pack for your little one. Our specialized
            meal plans are designed for infants and toddlers.
          </p>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subscription prompt if user doesn't have an active subscription
  if (subscriptionStatus !== "active") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            One-Time Infant & Toddler Recipe Packs
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose the perfect recipe pack for your little one. Our specialized
            meal plans are designed for infants and toddlers.
          </p>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  You are currently not subscribed to any plan
                </h3>
                <p className="text-muted-foreground">
                  Please click "Get Plan" to begin your download recipe request
                </p>
              </div>
              <Button
                onClick={() => router.push("/services/infant-recipes")}
                size="lg"
                className="mt-4"
              >
                Get Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          One-Time Infant & Toddler Recipe Packs
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose the perfect recipe pack for your little one. Our specialized
          meal plans are designed for infants and toddlers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Pack */}
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
              One-Time Infant & Toddler Recipe Pack (Basic)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-muted-foreground">
              Perfect for getting started with simple, nutritious meals for your
              infant or toddler. Includes 7 days of easy-to-prepare recipes with
              basic ingredients.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>7 days of meal plans</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Simple recipes for beginners</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Basic nutritional guidance</span>
              </div>
            </div>
            <div className="mt-auto pt-9">
              <Button
                onClick={() => router.push("/services/infant-recipes")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Download Basic Pack - ₦15,000
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Standard Pack */}
        <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-900/50 hover:scale-[1.02] hover:border-green-300 dark:hover:border-green-700 cursor-pointer">
          <CardHeader>
            <CardTitle className="text-xl text-green-900 dark:text-green-100">
              One-Time Infant & Toddler Recipe Pack (Standard)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <p className="text-muted-foreground">
              Comprehensive meal planning with advanced recipes, nutritional
              analysis, and personalized recommendations for your growing child.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>14 days of meal plans</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Advanced recipes with variations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Detailed nutritional analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Personalized recommendations</span>
              </div>
            </div>
            <div className="mt-auto pt-4">
              <Button
                onClick={() => router.push("/services/infant-recipes")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Download Standard Pack - ₦25,000
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
