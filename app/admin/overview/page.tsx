"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, DollarSign } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AdminOverviewPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Fetch total users
        const { count: usersCount } = await supabase
          .from("users_profile")
          .select("*", { count: "exact", head: true });

        setTotalUsers(usersCount || 0);

        // Fetch total subscribers (users with active subscriptions)
        const { count: subscribersCount } = await supabase
          .from("users_profile")
          .select("*", { count: "exact", head: true })
          .eq("meal_subscription_status", "active");

        setTotalSubscribers(subscribersCount || 0);

        // Fetch total revenue from subscription costs
        const { data: subscriptions } = await supabase
          .from("users_profile")
          .select("sub_cost")
          .eq("meal_subscription_status", "active")
          .not("sub_cost", "is", null);

        const revenue =
          subscriptions?.reduce((sum, sub) => sum + (sub.sub_cost || 0), 0) ||
          0;
        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "Loading..." : totalUsers.toLocaleString(),
      icon: Users,
      color:
        "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Subscribers",
      value: isLoading ? "Loading..." : totalSubscribers.toLocaleString(),
      icon: UserCheck,
      color:
        "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Revenue",
      value: isLoading ? "Loading..." : `₦${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color:
        "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          Admin dashboard overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.color}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
