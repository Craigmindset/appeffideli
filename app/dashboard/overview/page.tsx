"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CreditCard, Calendar, FileText } from "lucide-react";

export default function OverviewPage() {
  // Mock data - replace with actual data from your database
  const stats = [
    {
      title: "Total Downloads",
      value: "12",
      description: "PDFs downloaded this month",
      icon: Download,
      trend: "+2 from last month",
    },
    {
      title: "Active Subscription",
      value: "Premium",
      description: "Your current plan",
      icon: CreditCard,
      trend: "Renews in 15 days",
    },
    {
      title: "Meal Plans",
      value: "4",
      description: "Active meal schedules",
      icon: Calendar,
      trend: "Updated weekly",
    },
    {
      title: "Articles Read",
      value: "24",
      description: "Educational content",
      icon: FileText,
      trend: "+8 this week",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's a summary of your account activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-2">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
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
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="/dashboard/my-downloads"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Download className="h-5 w-5" />
                <span className="text-sm font-medium">View Downloads</span>
              </a>
              <a
                href="/dashboard/meal-timetable"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Manage Meal Plans</span>
              </a>
              <a
                href="/dashboard/my-subscription"
                className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">Subscription Details</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
