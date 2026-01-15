"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCheck, DollarSign, TrendingUp } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FinancesPage() {
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [planData, setPlanData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // Fetch total subscribers
      const { count: subscribersCount } = await supabase
        .from("users_profile")
        .select("*", { count: "exact", head: true })
        .eq("meal_subscription_status", "active");

      setTotalSubscribers(subscribersCount || 0);

      // Fetch subscription plan distribution
      const { data: basicCount } = await supabase
        .from("users_profile")
        .select("*", { count: "exact", head: true })
        .eq("meal_subscription", "meal_basic")
        .eq("meal_subscription_status", "active");

      const { data: premiumCount } = await supabase
        .from("users_profile")
        .select("*", { count: "exact", head: true })
        .eq("meal_subscription", "meal_premium")
        .eq("meal_subscription_status", "active");

      const { data: vipCount } = await supabase
        .from("users_profile")
        .select("*", { count: "exact", head: true })
        .eq("meal_subscription", "meal_vip")
        .eq("meal_subscription_status", "active");

      setPlanData([
        { name: "Basic", subscribers: basicCount?.length || 0 },
        { name: "Premium", subscribers: premiumCount?.length || 0 },
        { name: "VIP", subscribers: vipCount?.length || 0 },
      ]);

      // Fetch revenue data from subscription costs
      const { data: subscriptions } = await supabase
        .from("users_profile")
        .select("sub_cost, meal_subscription")
        .eq("meal_subscription_status", "active")
        .not("sub_cost", "is", null);

      const revenue = subscriptions?.reduce((sum, sub) => sum + (sub.sub_cost || 0), 0) || 0;
      setTotalRevenue(revenue);

      // Calculate profit (assuming 30% profit margin)
      setTotalProfit(revenue * 0.3);

      // Group revenue by subscription plan
      const revenueByPlan: { [key: string]: number } = {};
      subscriptions?.forEach((sub) => {
        const plan = sub.meal_subscription || "Other";
        if (!revenueByPlan[plan]) {
          revenueByPlan[plan] = 0;
        }
        revenueByPlan[plan] += sub.sub_cost || 0;
      });

      setRevenueData(
        Object.entries(revenueByPlan).map(([name, amount]) => ({
          name: name.replace("meal_", "").charAt(0).toUpperCase() + name.slice(6),
          revenue: amount,
        }))
      );
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Subscribers",
      value: isLoading ? "Loading..." : totalSubscribers.toLocaleString(),
      icon: UserCheck,
      color:
        "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Revenue",
      value: isLoading
        ? "Loading..."
        : `₦${totalRevenue.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`,
      icon: DollarSign,
      color:
        "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Profit",
      value: isLoading
        ? "Loading..."
        : `₦${totalProfit.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`,
      icon: TrendingUp,
      color:
        "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Finances
        </h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          Financial overview and revenue analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={stat.color}>
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

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Plans Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              Subscription Plans
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Distribution of active subscribers by plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:stroke-gray-700"
                />
                <XAxis dataKey="name" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                />
                <Legend />
                <Bar dataKey="subscribers" fill="#3b82f6" name="Subscribers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Revenue by Type</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Revenue breakdown by order type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="dark:stroke-gray-700"
                />
                <XAxis dataKey="name" className="dark:fill-gray-300" />
                <YAxis className="dark:fill-gray-300" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₦)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
