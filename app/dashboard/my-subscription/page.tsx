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
  CheckCircle2,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

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

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Payment Method
              </p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <p className="font-medium">Card ending in ****1234</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Auto Renewal</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="font-medium">
                  {subscription.autoRenew ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline">Update Payment Method</Button>
            <Button variant="outline">Change Plan</Button>
            <Button variant="destructive">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefits</CardTitle>
          <CardDescription>What's included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Unlimited PDF downloads",
              "Access to all meal plans",
              "Weekly nutrition guides",
              "Priority customer support",
              "Exclusive content and recipes",
              "Personalized meal recommendations",
            ].map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
