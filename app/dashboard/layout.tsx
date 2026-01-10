import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardThemeProvider } from "@/components/dashboard/dashboard-theme-provider";
import { WelcomeModal } from "@/components/dashboard/welcome-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  // This provides an additional layer of security on top of middleware
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return (
    <DashboardThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <DashboardSidebar />
        <div className="md:pl-64">
          <DashboardHeader />
          <main className="container mx-auto p-6">
            <WelcomeModal />
            {children}
          </main>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}
