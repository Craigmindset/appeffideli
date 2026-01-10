"use client";

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
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { DashboardThemeToggle } from "./dashboard-theme-toggle";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function DashboardHeader() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email || "");

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
    try {
      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear server-side session and sign out from Supabase
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server signout fails, redirect to login
      router.push("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-700 hidden md:block">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hi {firstName}! 👋
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <DashboardThemeToggle />

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/images/avatar.png" alt={firstName} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(firstName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 dark:bg-gray-800 dark:border-gray-700"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none dark:text-white">
                    {firstName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-gray-700" />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
                className="dark:hover:bg-gray-700 dark:text-gray-200"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
              >
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
