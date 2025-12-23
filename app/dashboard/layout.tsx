import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <div className="md:pl-64">
        <DashboardHeader />
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
