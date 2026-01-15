"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminDashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-700 dark:bg-gray-800/95">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="relative dark:text-gray-200"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
