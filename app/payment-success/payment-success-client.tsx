"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import {
  updateMealSubscriptionStatus,
  type MealPlanType,
} from "@/app/actions/meal-subscription";

export default function PaymentSuccessClient() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      const plan = searchParams.get("plan");

      if (!reference || !plan) {
        setError("Invalid payment reference");
        setIsVerifying(false);
        return;
      }

      try {
        // Call API to verify payment with Paystack
        const response = await fetch(
          `/api/verify-payment?reference=${reference}`
        );
        const data = await response.json();

        if (data.success) {
          // Update subscription status
          const result = await updateMealSubscriptionStatus(
            reference,
            data.paymentReference,
            plan as MealPlanType
          );

          if (result.success) {
            setIsSuccess(true);
          } else {
            setError(result.error || "Failed to update subscription");
          }
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("An error occurred during verification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verifying Payment...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your subscription
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/services/meal-plan-subscription")}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Successful! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your meal plan subscription has been activated successfully.
          </p>
        </div>
        <div className="bg-primary/10 border border-primary rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You now have full access to your meal plan features. Check your
            email for confirmation details.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
