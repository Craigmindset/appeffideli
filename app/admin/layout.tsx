import { redirect } from "next/navigation";
import { getCurrentUser, createServerSupabaseClient } from "@/lib/auth-server";
import { DashboardThemeProvider } from "@/components/dashboard/dashboard-theme-provider";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { AdminDashboardLayoutClient } from "@/components/admin/admin-dashboard-layout-client";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectedFrom=/admin");
  }

  // Check if user is admin
  const supabase = await createServerSupabaseClient();
  const { data: profile, error: profileError } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", user.id)
    .single();

  // Debug logging
  console.log("Admin Layout Check:", {
    userId: user.id,
    profile,
    profileError,
    role: profile?.role,
    roleType: typeof profile?.role,
    isAdmin: profile?.role === "admin",
  });

  if (!profile || profile.role !== "admin") {
    console.log("Redirecting to dashboard - not admin:", { profile });
    redirect("/dashboard/overview");
  }

  return (
    <DashboardThemeProvider>
      <SidebarProvider>
        <AdminDashboardLayoutClient>{children}</AdminDashboardLayoutClient>
      </SidebarProvider>
    </DashboardThemeProvider>
  );
}
