"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, User, Home, Headphones, Menu } from "lucide-react";

import { DashboardThemeToggle } from "./dashboard-theme-toggle";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { signOut } from "@/app/actions/auth";
import { useSidebar } from "./sidebar-context";

export function DashboardHeader() {
  const router = useRouter();
  const { setIsMobileMenuOpen } = useSidebar();
  const [firstName, setFirstName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");

          const { data: profile } = await supabase
            .from("users_profile")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profile?.full_name) {
            setFirstName(profile.full_name.split(" ")[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      await signOut();

      router.push("/");
    } catch (error) {
      router.push("/");
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <header className="sticky top-0 z-80 w-full border-b bg-background/95 backdrop-blur md:supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-3 md:px-4 gap-2 md:gap-4">
        {/* LEFT: Hamburger (Mobile Only) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen?.(true)}
          className="md:hidden text-foreground hover:bg-accent/50"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* CENTER: Home and Support Icons (Mobile Only) */}
        <nav className="flex md:hidden items-center gap-2 flex-1 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-2 py-2 rounded-md text-foreground hover:bg-accent/50 transition-colors"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-2 py-2 rounded-md text-foreground hover:bg-accent/50 transition-colors"
            title="Support"
          >
            <Headphones className="h-4 w-4" />
          </Link>
        </nav>

        {/* CENTER-RIGHT: Desktop Full Section */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <Headphones className="h-4 w-4" />
              Support
            </Link>
          </nav>
        </div>

        {/* RIGHT: Mobile Greeting + All Shared Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Greeting Only */}
          <h2 className="md:hidden text-sm font-semibold text-foreground whitespace-nowrap">
            Hi {firstName}! 👋
          </h2>

          {/* Desktop Greeting */}
          <h2 className="hidden md:block text-lg font-semibold text-foreground whitespace-nowrap">
            Hi {firstName}! 👋
          </h2>

          {/* Theme Toggle */}
          <DashboardThemeToggle />

          {/* Logout Icon (Desktop Only) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="hidden md:inline-flex text-foreground hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>

          {/* User Dropdown (Desktop Only) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden md:inline-flex h-10 w-10 rounded-full"
              >
                <Avatar>
                  <AvatarImage src="/images/avatar.png" />
                  <AvatarFallback>{getInitials(firstName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {firstName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
