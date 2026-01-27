"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, CreditCard, Calendar, Activity } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  getUserRecentActivities,
  type UserActivity,
} from "@/app/actions/user-activities";

export default function OverviewPage() {
  const [subscriptionPlan, setSubscriptionPlan] = useState("Not Subscribed");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const router = useRouter();

  // Function to format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  // Fetch recent activities
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    const result = await getUserRecentActivities(5);
    if (result.success && result.data) {
      setRecentActivities(result.data);
    }
    setActivitiesLoading(false);
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch user profile subscription info
          const { data: profile } = await supabase
            .from("users_profile")
            .select("meal_subscription, meal_subscription_status")
            .eq("id", user.id)
            .single();

          if (profile && profile.meal_subscription) {
            // Format plan name
            const planName =
              profile.meal_subscription
                .replace("meal_", "")
                .charAt(0)
                .toUpperCase() + profile.meal_subscription.slice(6);

            setSubscriptionPlan(planName);
            setSubscriptionStatus(
              profile.meal_subscription_status || "inactive",
            );
          } else {
            setSubscriptionPlan("Not Subscribed");
            setSubscriptionStatus("inactive");
          }
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        setSubscriptionPlan("Not Subscribed");
        setSubscriptionStatus("inactive");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
    fetchActivities();

    // Set up real-time updates for activities (poll every 30 seconds)
    const intervalId = setInterval(fetchActivities, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Mock data - replace with actual data from your database
  const stats = [
    {
      title: "Total Downloads",
      value: "0",
      description: "PDFs downloaded this month",
      icon: Download,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Active Subscription",
      value: isLoading ? "Loading..." : subscriptionPlan,
      description: "Your current plan",
      icon: CreditCard,
      color:
        subscriptionStatus === "active"
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200",
    },
    {
      title: "Meal Table",
      value: "1",
      description: "Active meal schedules",
      icon: Calendar,
      color: "bg-orange-50 border-orange-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          Welcome back! Here's a summary of your account activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const getRoute = (title: string) => {
            switch (title) {
              case "Total Downloads":
                return "/dashboard/my-downloads";
              case "Active Subscription":
                return "/dashboard/my-subscription";
              case "Meal Table":
                return "/dashboard/meal-timetable";
              default:
                return null;
            }
          };
          const route = getRoute(stat.title);
          const isClickable = !!route;
          return (
            <Card
              key={stat.title}
              className={`${stat.color} dark:bg-gray-800 dark:border-gray-700 ${
                isClickable
                  ? "cursor-pointer hover:shadow-md transition-shadow"
                  : ""
              }`}
              onClick={isClickable ? () => router.push(route!) : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-50 border-slate-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading activities...
                  </div>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between border-b dark:border-gray-700 pb-3 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <Activity className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.activity_description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent activities
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Your activities will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="/dashboard/my-downloads"
                className="flex items-center gap-2 rounded-lg border dark:border-gray-700 p-3 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Downloads
                </span>
              </a>
              <a
                href="/dashboard/meal-timetable"
                className="flex items-center gap-2 rounded-lg border dark:border-gray-700 p-3 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Meal Plans
                </span>
              </a>
              <a
                href="/dashboard/my-subscription"
                className="flex items-center gap-2 rounded-lg border dark:border-gray-700 p-3 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
              >
                <CreditCard className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Subscription Details
                </span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
