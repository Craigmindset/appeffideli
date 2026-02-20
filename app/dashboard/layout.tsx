import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { DashboardThemeProvider } from "@/components/dashboard/dashboard-theme-provider";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return (
    <DashboardThemeProvider>
      <SidebarProvider>
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
        <Toaster />
      </SidebarProvider>
    </DashboardThemeProvider>
  );
}
