"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { cancelMealSubscription } from "@/app/actions/meal-subscription";

interface Subscription {
  plan: string;
  status: "active" | "expired" | "cancelled" | "inactive";
  startDate: string;
  endDate: string;
  amount: string;
  nextBillingDate: string;
  autoRenew: boolean;
}

export default function MySubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelMealSubscription();
      if (result.success) {
        // Update local state to reflect cancellation
        setSubscription((prev) =>
          prev ? { ...prev, status: "cancelled", autoRenew: false } : null
        );
        alert("Subscription cancelled successfully");
        router.refresh();
      } else {
        alert(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("An error occurred while cancelling your subscription");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch user profile subscription info
        const { data: profile } = await supabase
          .from("users_profile")
          .select(
            "meal_subscription, meal_subscription_status, meal_subscription_started_at, meal_subscription_expires_at"
          )
          .eq("id", user.id)
          .single();

        if (!profile || !profile.meal_subscription) {
          setIsLoading(false);
          return;
        }

        // Fetch subscription details from the appropriate table
        const tableName = profile.meal_subscription;
        const { data: subscriptionData } = await supabase
          .from(tableName)
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (subscriptionData) {
          // Format plan name
          const planName =
            subscriptionData.subscription_reference.split("_")[0] === "EFFIDELI"
              ? profile.meal_subscription
                  .replace("meal_", "")
                  .charAt(0)
                  .toUpperCase() + profile.meal_subscription.slice(6)
              : "Premium";

          // Plan pricing map
          const pricingMap: Record<string, string> = {
            meal_basic: "₦3,500",
            meal_premium: "₦5,000",
            meal_vip: "₦7,999",
          };

          const billingAmount = pricingMap[tableName] || "₦0";

          // Calculate next billing date (30 days from start)
          const startDate = new Date(subscriptionData.started_at);
          const nextBillingDate = new Date(startDate);
          nextBillingDate.setDate(nextBillingDate.getDate() + 30);

          setSubscription({
            plan: `${planName} Plan`,
            status:
              (profile.meal_subscription_status as
                | "active"
                | "expired"
                | "cancelled"
                | "inactive") || "inactive",
            startDate: subscriptionData.started_at,
            endDate:
              subscriptionData.expires_at || nextBillingDate.toISOString(),
            amount: billingAmount,
            nextBillingDate: nextBillingDate.toISOString(),
            autoRenew: true,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            <p className="text-muted-foreground text-center">
              Fetching your subscription information
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Active Subscription
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Subscribe to access premium features and content
            </p>
            <Button>View Plans</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.plan}</div>
            <div className="mt-2">{getStatusBadge(subscription.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Billing Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.amount}</div>
            <p className="text-xs text-muted-foreground mt-2">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {subscription.autoRenew
                ? "Auto-renew enabled"
                : "Auto-renew disabled"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Complete information about your current subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">End Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline">Update Payment Method</Button>
            <Button
              variant="outline"
              onClick={() => router.push("/services/meal-plan-subscription")}
            >
              Change Plan
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={subscription.status === "cancelled" || isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : subscription.status === "cancelled" ? (
                    "Subscription Cancelled"
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your {subscription.plan}?
                    <br />
                    <br />
                    <strong>What happens when you cancel:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your subscription will be cancelled immediately</li>
                      <li>You will lose access to your plan features</li>
                      <li>No further charges will be made</li>
                      <li>You can subscribe again anytime</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSubscription}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Benefits</CardTitle>
          <CardDescription>
            What's included in your {subscription.plan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.plan.toLowerCase().includes("basic") && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Perfect for families who want core meal guidance and easy weekly
                menus.
              </p>
              <div>
                <p className="font-medium mb-2">Includes:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Weekly meal plans (breakfast, lunch, dinner)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Simple shopping list (view only)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Best for: Busy mums on a budget or first-time meal planners
              </p>
            </div>
          )}

          {subscription.plan.toLowerCase().includes("premium") && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                For families who want more variety & added convenience.
              </p>
              <div>
                <p className="font-medium mb-2">
                  Includes everything in Basic, plus:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🌟</span>
                    <span>
                      Expanded weekly meal plans (Breakfast, Snack, Lunch,
                      Bites, Dinner, and Side Dish )
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🌟</span>
                    <span>Downloadable recipe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🌟</span>
                    <span>Shopping list export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-500">🌟</span>
                    <span>Email Support</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Best for: Families wanting more variety & structure
              </p>
            </div>
          )}

          {subscription.plan.toLowerCase().includes("vip") && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The full Effidelicious experience — tailored and stress-free.
              </p>
              <div>
                <p className="font-medium mb-2">
                  Includes everything in Premium, plus:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>
                      Expanded weekly meal plans (Breakfast, Snack, Lunch,
                      Bites, Dinner, Side Dish, Snack & Desserts)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>Downloadable recipe</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>Shopping list export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>Monthly live Q&A with Effideli</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✨</span>
                    <span>Seasonal & festive menus</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Best for: Families who want the ultimate meal planning
                experience
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
