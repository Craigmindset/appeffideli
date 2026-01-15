"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Upload,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useSidebar } from "../dashboard/sidebar-context";

const navItems = [
  {
    title: "Overview",
    href: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Uploads",
    href: "/admin/uploads",
    icon: Upload,
  },
  {
    title: "Meal Table",
    href: "/admin/meal-table",
    icon: Calendar,
  },
  {
    title: "Finances",
    href: "/admin/finances",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminDashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:hidden dark:border-gray-700 dark:bg-gray-800/95">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="dark:text-gray-200"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h2>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-[55] h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 md:top-0 md:h-screen md:translate-x-0 dark:border-gray-700 dark:bg-gray-800",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-16" : "md:w-64",
          "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b px-6 dark:border-gray-700 justify-between">
            <Link
              href="/admin/overview"
              className={cn(
                "flex items-center gap-2",
                isCollapsed && "md:hidden"
              )}
            >
              <img
                src="/logo.png"
                alt="AppEffideli Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-bold text-gray-900 dark:text-white">
                Admin
              </span>
            </Link>
            {/* Collapse Toggle (Desktop Only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex dark:text-gray-200"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-3 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground dark:bg-blue-600"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-gray-300 dark:hover:bg-gray-700",
                    isCollapsed && "md:justify-center md:px-2"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn(isCollapsed && "md:hidden")}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t p-4 dark:border-gray-700">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20",
                isCollapsed && "md:justify-center md:px-2"
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut
                className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")}
              />
              <span className={cn(isCollapsed && "md:hidden")}>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[50] bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
