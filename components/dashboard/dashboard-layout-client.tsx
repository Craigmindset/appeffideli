"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <DashboardSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <DashboardHeader />
        <main className="container mx-auto p-6">
          <WelcomeModal />
          {children}
        </main>
      </div>
    </div>
  );
}
