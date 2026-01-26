"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Calendar, Download } from "lucide-react";
import { getUserInfantRecipePurchases } from "@/app/actions/infant-recipes";

export default function OnetimeInfantToddlerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedPacks, setPurchasedPacks] = useState<{
    starter: boolean;
    standard: boolean;
  }>({ starter: false, standard: false });
  const [hasAnyPurchase, setHasAnyPurchase] = useState(false);
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndPurchases = async () => {
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

        // Check for purchased infant recipe packs
        const purchasesResult = await getUserInfantRecipePurchases();
        if (purchasesResult.success && purchasesResult.data) {
          const completedPurchases = purchasesResult.data.filter(
            (p: any) => p.status === "completed"
          );
          const hasStarter = completedPurchases.some(
            (p: any) => p.pack_type === "starter"
          );
          const hasStandard = completedPurchases.some(
            (p: any) => p.pack_type === "standard"
          );
          setPurchasedPacks({ starter: hasStarter, standard: hasStandard });
          setHasAnyPurchase(hasStarter || hasStandard);
        } else {
          setHasAnyPurchase(false);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Authentication check failed:", err);
        setError("Authentication failed");
        setIsLoading(false);
      }
    };

    checkAuthAndPurchases();
  }, []);

  // Show loading state while checking authentication and purchases
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

  // Show prompt if user doesn't have any purchases
  if (!hasAnyPurchase) {
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
                  No recipe packs purchased yet
                </h3>
                <p className="text-muted-foreground">
                  Please click "Get Plan" to purchase an infant recipe pack
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
              {purchasedPacks.starter ? (
                <Button
                  onClick={() => {
                    window.open(
                      "https://dohdf572hojoyskk.public.blob.vercel-storage.com/One-%20Time%20infant%20%26%20Toddler%20Recipe%20Pack%20%28BASIC%20PACK%29.pdf",
                      "_blank"
                    );
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Basic Pack
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/services/infant-recipes")}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Purchase Basic Pack - ₦14,000
                </Button>
              )}
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
              {purchasedPacks.standard ? (
                <Button
                  onClick={() => {
                    window.open(
                      "https://dohdf572hojoyskk.public.blob.vercel-storage.com/One-%20Time%20infant%20%26%20Toddler%20Recipe%20Pack%20%28STANDARD%20PACK%29.pdf",
                      "_blank"
                    );
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Standard Pack
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/services/infant-recipes")}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  Purchase Standard Pack - ₦25,000
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
