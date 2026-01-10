"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, CreditCard, Calendar, FileText } from "lucide-react";

export default function OverviewPage() {
  // Mock data - replace with actual data from your database
  const stats = [
    {
      title: "Total Downloads",
      value: "12",
      description: "PDFs downloaded this month",
      icon: Download,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Active Subscription",
      value: "Premium",
      description: "Your current plan",
      icon: CreditCard,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Meal Plans",
      value: "4",
      description: "Active meal schedules",
      icon: Calendar,
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "Articles Read",
      value: "24",
      description: "Educational content",
      icon: FileText,
      color: "bg-purple-50 border-purple-200",
      trend: "",
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`${stat.color} dark:bg-gray-800 dark:border-gray-700`}
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
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {stat.trend}
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
              {[
                {
                  action: "Downloaded Infant Recipe PDF",
                  time: "2 hours ago",
                },
                {
                  action: "Updated meal timetable",
                  time: "1 day ago",
                },
                {
                  action: "Read article: Healthy Eating Tips",
                  time: "3 days ago",
                },
                {
                  action: "Renewed subscription",
                  time: "1 week ago",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b dark:border-gray-700 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
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
