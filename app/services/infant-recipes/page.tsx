"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, X, Loader2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  createInfantRecipePurchase,
  type InfantRecipePackType,
} from "@/app/actions/infant-recipes";
import { usePaystack } from "@/hooks/use-paystack";

export default function InfantRecipesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [purchaseReference, setPurchaseReference] = useState<string>("");
  const router = useRouter();

  const plans = [
    {
      id: "starter",
      name: "Starter Pack (Basic)",
      price: "₦14,000",
      period: "one-time",
      description: "Great for first-time buyers and impulse purchases",
      features: ["12 recipes", "Age guidance", "Storage Tips"],
      color: "border-blue-500",
      amount: 14000,
      planCode: "PLN_STARTER_INFANT", // Update with actual plan code if needed
    },
    {
      id: "standard",
      name: "Standard Pack",
      price: "₦25,000",
      period: "one-time",
      description:
        "Everything you need to get started. Best balance of value and accessibility.",
      popular: true,
      features: [
        "20 recipes",
        "Age guidance",
        "Storage Tips",
        "Feeding tips",
        "Benefits for baby & Overall Benefits",
      ],
      color: "border-primary",
      amount: 25000,
      planCode: "PLN_STANDARD_INFANT", // Update with actual plan code if needed
    },
  ];

  const handleGetStarted = async (plan: (typeof plans)[0]) => {
    setLoadingPlans((prev) => ({ ...prev, [plan.id]: true }));
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
        setUserProfile(profile);
        setSelectedPlan(plan);

        // Create purchase record
        const result = await createInfantRecipePurchase(
          plan.id as InfantRecipePackType,
          plan.amount,
        );

        if (result.success && result.reference) {
          setPurchaseReference(result.reference);
          setIsModalOpen(true);
        } else {
          alert(result.error || "Failed to create purchase record");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoadingPlans((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  const {
    initializePayment,
    isLoading: isPaystackLoading,
    isReady,
  } = usePaystack({
    email: userProfile?.email || "",
    firstName: userProfile?.full_name?.split(" ")[0] || "",
    lastName: userProfile?.full_name?.split(" ").slice(1).join(" ") || "",
    phone: userProfile?.phone || "",
    apartmentType: "infant-recipe",
    orderType: "download",
    amount: selectedPlan?.amount || 0,
    reference: purchaseReference,
    onSuccess: async (response) => {
      console.log("Payment successful:", response);
      setIsModalOpen(false);
      try {
        const res = await fetch(
          `/api/verify-payment?reference=${purchaseReference}`,
        );
        const data = await res.json();
        if (data.success) {
          router.push("/dashboard/onetime-infant-toddler");
        } else {
          alert(data.error || "Payment verification failed");
        }
      } catch (e) {
        console.error("Verification error", e);
        alert("An error occurred during verification");
      }
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
      ref: purchaseReference,
      firstname: userProfile.full_name?.split(" ")[0] || "",
      lastname: userProfile.full_name?.split(" ").slice(1).join(" ") || "",
      phone: userProfile.phone || "",
      metadata: {
        pack_type: selectedPlan.id,
        pack_name: selectedPlan.name,
        user_id: userProfile.id,
        purchase_reference: purchaseReference,
        order_type: "infant-recipe",
        custom_fields: [
          {
            display_name: "Pack Type",
            variable_name: "pack_type",
            value: selectedPlan.name,
          },
          {
            display_name: "Purchase Reference",
            variable_name: "purchase_reference",
            value: purchaseReference,
          },
        ],
      },
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative -mx-6 -mt-6 mb-12 bg-[#305c7c] pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Onetime Infant & Toddler Recipe Pack
          </h1>
          <p className="text-lg text-orange-50 max-w-2xl mx-auto">
            The Effideli Infant & Toddler Recipe Pack is a thoughtfully created
            guide designed to support parents in preparing simple, nutritious,
            and age-appropriate meals for babies and toddlers.
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
          {/* Removed description paragraph from here */}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto justify-center">
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
                    Recommended
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

                {/* Best For Note - Basic Plan */}
                {plan.id === "basic" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Best for: Busy mums on a budget or first-time meal planners
                  </p>
                )}

                {/* Best For Note - Premium Plan */}
                {plan.id === "premium" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Best for: Families wanting more variety & structure
                  </p>
                )}

                {/* Best For Note - VIP Plan */}
                {plan.id === "vip" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Best for: Private Chef, Catering, Patient food services, and
                    families who want personal guidance & highest value.
                  </p>
                )}

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
                  disabled={loadingPlans[plan.id]}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {loadingPlans[plan.id] ? (
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This pack includes easy-to-follow recipes using everyday
            ingredients, balanced meals that support growth and development,
            gentle flavors suitable for little taste buds, practical tips for
            busy parents and caregivers. Perfect for parents who want to build
            healthy eating habits early while keeping mealtimes stress-free and
            enjoyable 💚
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
                Confirm Purchase
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Review your purchase details
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

            {/* Purchase Details */}
            <div className="space-y-3 border border-primary rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pack
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPlan.name}
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
                You are about to purchase the{" "}
                <strong>{selectedPlan.name}</strong>.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isPaystackLoading || !isReady}
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
