"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Download,
  CreditCard,
  Calendar,
  Settings,
  LogOut,
  Menu,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Home,
  Baby,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useSidebar } from "./sidebar-context";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    title: "My Downloads",
    href: "/dashboard/my-downloads",
    icon: Download,
  },
  {
    title: "Shop List",
    href: "/dashboard/shop-list",
    icon: ShoppingCart,
  },
  {
    title: "Meal Timetable",
    href: "/dashboard/meal-timetable",
    icon: Calendar,
  },

  {
    title: "Infant & Toddler Pack",
    href: "/dashboard/onetime-infant-toddler",
    icon: Baby,
  },
  {
    title: "Household Cleaning",
    href: "/dashboard/household-cleaning",
    icon: Home,
  },
  {
    title: "My Subscription",
    href: "/dashboard/my-subscription",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();
  const [firstName, setFirstName] = useState("User");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch user profile from database
          const { data: profile, error } = await supabase
            .from("users_profile")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (!error && profile && profile.full_name) {
            // Extract first name from full name
            const firstName = profile.full_name.split(" ")[0];
            setFirstName(firstName || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear server-side session and sign out from Supabase
      await signOut();

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server signout fails, redirect to home page
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Header - Hidden, using DashboardHeader instead */}
      <div className="hidden">
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
            Hi {firstName}! 👋
          </h2>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[55] h-screen border-r bg-background transition-all duration-300 md:translate-x-0 dark:border-gray-700 dark:bg-gray-800",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-16" : "md:w-64",
          "w-64",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b px-6 dark:border-gray-700 justify-between">
            <Link
              href="/dashboard/overview"
              className={cn(
                "flex items-center gap-2",
                isCollapsed && "md:hidden",
              )}
            >
              <img
                src="/logo.png"
                alt="AppEffideli Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
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
          <nav className="flex-1 space-y-2 p-4">
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
                    isCollapsed && "md:justify-center md:px-2",
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
                isCollapsed && "md:justify-center md:px-2",
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : undefined}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2
                  className={cn(
                    "h-5 w-5 flex-shrink-0 animate-spin",
                    !isCollapsed && "mr-3",
                  )}
                />
              ) : (
                <LogOut
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    !isCollapsed && "mr-3",
                  )}
                />
              )}
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
