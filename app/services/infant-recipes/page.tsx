"use client";

import { useRouter } from "next/navigation";

export default function InfantRecipesPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          One-Time Infant / Toddler Recipe Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Specialized recipes designed for your little ones
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This feature is coming soon! We're working hard to bring you the best
          infant and toddler recipes.
        </p>
      </div>

      {/* Back Button */}
      <div className="text-center pt-8">
        <button
          onClick={() => router.push("/services/selection")}
          className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Selection
        </button>
      </div>
    </div>
  );
}
