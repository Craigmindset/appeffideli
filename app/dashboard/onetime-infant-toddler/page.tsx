"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import InfantRecipeForm from "@/components/infant-recipe-form";

export default function OnetimeInfantToddlerPage() {
  const [showForm, setShowForm] = useState(true);

  const onBack = () => {
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 mb-4">
                One-time Infant & Toddler Recipe Pack
              </h1>
              <p className="text-lg text-gray-600">
                Purchase a specialized baby food meal plan for your little one.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-900"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to form
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container px-4 md:px-6 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-blue-900 p-0 h-auto"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 mb-4">
              One-time Infant & Toddler Recipe Pack
            </h1>
            <p className="text-lg text-gray-600">
              Specialized baby food meal planning and nutritional guidance for
              infants aged 6 months to 1 year.
            </p>
          </div>

          <InfantRecipeForm onBack={onBack} />
        </div>
      </div>
    </main>
  );
}
