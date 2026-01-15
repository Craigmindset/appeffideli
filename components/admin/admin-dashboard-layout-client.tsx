"use client";

import { AdminDashboardHeader } from "@/components/admin/admin-dashboard-header";
import { AdminDashboardSidebar } from "@/components/admin/admin-dashboard-sidebar";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

export function AdminDashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <AdminDashboardSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <AdminDashboardHeader />
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
