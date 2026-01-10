"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("there");

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
            setUserName(firstName || "there");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 text-center space-y-4">
          {/* Animated Welcome Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-primary rounded-full">
                <span className="text-3xl">👋</span>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Hi {userName}, Welcome to Effideli! 🎉
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              We're thrilled to have you here! Effideli is your perfect home
              management board and routine services platform.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl mb-1">📊</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                Dashboard
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Track your activities
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl mb-1">🍽️</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                Meal Plans
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Access meal timetables
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl mb-1">📥</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                Downloads
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get your recipes
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <Button onClick={handleClose} size="default" className="px-6">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
