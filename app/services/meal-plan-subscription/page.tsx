"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, X, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  createMealSubscription,
  type MealPlanType,
} from "@/app/actions/meal-subscription";
import { usePaystack } from "@/hooks/use-paystack";

export default function MealPlanSubscriptionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionReference, setSubscriptionReference] =
    useState<string>("");
  const router = useRouter();

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "₦3,500",
      period: "month",
      description: "Perfect to get started",
      features: ["Weekly meal plans", "Simple shopping list", "Email support"],
      color: "border-blue-500",
      amount: 3500,
      planCode: "PLN_oourduufliagq4j",
    },
    {
      id: "premium",
      name: "Premium",
      price: "₦5,000",
      period: "month",
      description: "Most popular choice",
      popular: true,
      features: [
        "Expanded weekly meal plans",
        "Downloadable recipes",
        "Shopping list export",
        "Email support",
      ],
      color: "border-primary",
      amount: 5000,
      planCode: "PLN_kdhrvbtrriqeepi",
    },
    {
      id: "vip",
      name: "VIP",
      price: "₦7,999",
      period: "month",
      description: "Premium experience",
      features: [
        "All Premium features",
        "Priority support",
        "Monthly live Q&A",
        "Seasonal menus",
      ],
      color: "border-purple-500",
      amount: 7999,
      planCode: "PLN_vrjx5yv92szrl31",
    },
  ];

  const handleGetStarted = async (plan: (typeof plans)[0]) => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup if not logged in
        router.push("/signup");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        // Check if user already has an active subscription to the same plan
        if (
          profile.meal_subscription === `meal_${plan.id}` &&
          profile.meal_subscription_status === "active"
        ) {
          alert(
            `You already have an active ${plan.name} subscription. Please cancel your current subscription before subscribing again.`
          );
          setIsLoading(false);
          return;
        }

        setUserProfile(profile);
        setSelectedPlan(plan);

        // Create subscription record
        const result = await createMealSubscription(
          plan.id as MealPlanType,
          plan.amount
        );

        if (result.success && result.reference) {
          setSubscriptionReference(result.reference);
          setIsModalOpen(true);
        } else {
          alert(result.error || "Failed to create subscription");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { initializePayment, isLoading: isPaystackLoading } = usePaystack({
    email: userProfile?.email || "",
    firstName: userProfile?.full_name?.split(" ")[0] || "",
    lastName: userProfile?.full_name?.split(" ").slice(1).join(" ") || "",
    phone: userProfile?.phone || "",
    apartmentType: "studio", // Placeholder, not used for meal subscriptions
    orderType: "subscription",
    amount: selectedPlan?.amount || 0,
    planCode: selectedPlan?.planCode || "",
    reference: subscriptionReference,
    onSuccess: (response) => {
      console.log("Payment successful:", response);
      setIsModalOpen(false);
      router.push(
        `/payment-success?reference=${subscriptionReference}&plan=${selectedPlan?.id}`
      );
    },
    onClose: () => {
      console.log("Payment closed");
    },
  });

  const handlePay = () => {
    if (!userProfile || !selectedPlan) {
      alert("Missing user or plan information");
      return;
    }

    initializePayment({
      email: userProfile.email,
      amount: selectedPlan.amount,
      ref: subscriptionReference,
      plan: selectedPlan.planCode,
      firstname: userProfile.full_name?.split(" ")[0] || "",
      lastname: userProfile.full_name?.split(" ").slice(1).join(" ") || "",
      phone: userProfile.phone || "",
      metadata: {
        plan_type: selectedPlan.id,
        plan_code: selectedPlan.planCode,
        user_id: userProfile.id,
        subscription_reference: subscriptionReference,
        custom_fields: [
          {
            display_name: "Plan Type",
            variable_name: "plan_type",
            value: selectedPlan.name,
          },
          {
            display_name: "Plan Code",
            variable_name: "plan_code",
            value: selectedPlan.planCode,
          },
          {
            display_name: "Subscription Reference",
            variable_name: "subscription_reference",
            value: subscriptionReference,
          },
        ],
      },
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative -mx-6 -mt-6 mb-12 bg-gradient-to-r from-orange-500 via-pink-500 to-orange-400 dark:from-orange-600 dark:via-pink-600 dark:to-orange-500 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Effortless Meal Planning
          </h1>
          <p className="text-lg text-orange-50 max-w-2xl mx-auto">
            Stress-free weekly meal plans tailored for your family. Never worry
            about what's for dinner again.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-8 pb-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start your meal planning journey today
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${
                plan.color
              } transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "md:scale-105" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`p-6 space-y-4 flex flex-col h-full ${
                  plan.popular ? "pt-8" : ""
                }`}
              >
                {/* Plan Header */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleGetStarted(plan)}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💡 <strong>Tip:</strong> All plans include access to our recipe
            library and can be cancelled anytime.
          </p>
        </div>
      </div>

      {/* Subscription Confirmation Modal */}
      {isModalOpen && selectedPlan && userProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm Subscription
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Review your subscription details
              </p>
            </div>

            {/* User Details */}
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile.full_name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile.email}
                </p>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="space-y-3 border border-primary rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Plan
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Meal {selectedPlan.name} Plan
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Amount
                </span>
                <span className="text-lg font-bold text-primary">
                  {selectedPlan.price}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                You are now going to be subscribed to the{" "}
                <strong>Meal {selectedPlan.name} Plan</strong>.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isPaystackLoading}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPaystackLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {selectedPlan.price}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You will be redirected to Paystack to complete your payment
              securely.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
