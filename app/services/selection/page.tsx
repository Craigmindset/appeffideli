"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { UtensilsCrossed, Baby, Sparkles } from "lucide-react";

export default function SelectionPage() {
  const [firstName, setFirstName] = useState("User");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createBrowserSupabaseClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("users_profile")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profile && profile.full_name) {
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

  const cards = [
    {
      id: 1,
      title: "Monthly Meal Plan Subscription",
      description: "Get personalized meal plans delivered weekly",
      icon: UtensilsCrossed,
      color: "bg-blue-500",
      href: "/services/meal-plan-subscription",
    },
    {
      id: 2,
      title: "One-Time Infant / Toddler Recipe Plan",
      description: "Specialized recipes for your little ones",
      icon: Baby,
      color: "bg-pink-500",
      href: "/services/infant-recipes",
    },
    {
      id: 3,
      title: "Household Cleaning Routine",
      description: "Organized cleaning schedules for your home",
      icon: Sparkles,
      color: "bg-purple-500",
      href: "/services/cleaning-routine",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Hi {firstName}, it's good to have you here! 👋
        </h1>
      </div>

      {/* Action Prompt */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200">
          What will you like to do today?
        </h2>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => router.push(card.href)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
            >
              {/* Icon Background */}
              <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div
                  className={`${card.color} opacity-10 rounded-full w-full h-full`}
                ></div>
              </div>

              <div className="relative p-6 space-y-4">
                {/* Icon */}
                <div
                  className={`${card.color} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {card.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                  <span className="text-sm font-medium">Get Started</span>
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
