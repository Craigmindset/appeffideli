"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  X,
  Loader2,
  Home,
  UserCheck,
  FileText,
  CreditCard,
  Zap,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  createMealSubscription,
  type MealPlanType,
} from "@/app/actions/meal-subscription";
import { usePaystack } from "@/hooks/use-paystack";

export default function CleaningRoutinePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionReference, setSubscriptionReference] =
    useState<string>("");
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
            `You already have an active ${plan.name} subscription. Please cancel your current subscription before subscribing again.`,
          );
          setIsLoading(false);
          return;
        }

        setUserProfile(profile);
        setSelectedPlan(plan);

        // Create subscription record
        const result = await createMealSubscription(
          plan.id as MealPlanType,
          plan.amount,
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
        `/payment-success?reference=${subscriptionReference}&plan=${selectedPlan?.id}`,
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
      <div
        className="relative -mx-6 -mt-6 mb-12 pt-20 pb-16 px-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(48,92,124,0.7),rgba(48,92,124,0.7)), url(/cleaning.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl md:text-5xl font-bold text-white">
            Household Cleaning Routine
          </h1>
          <p className="text-xs md:text-lg text-orange-50 max-w-2xl mx-auto">
            A one-time customized chore guide designed for maids, nannies, and
            house managers, providing detailed instructions on how, where, and
            what to clean in every area of the home—whether a flat, bungalow, or
            duplex—and covering a full Monday-to-Sunday cleaning schedule to
            ensure proper hygiene and maintenance.
          </p>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="space-y-8 pb-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-2 md:px-8 py-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <Zap className="w-7 h-7 text-primary" />
            How it Works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <UserCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold mb-2 text-primary">
              Enter Registered Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create an account to get started with household cleaning routine.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <Home className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold mb-2 text-primary">
              Choose Your Home Type
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select your type of home from our selection and proceed.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <FileText className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold mb-2 text-primary">Format</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select your desired format: PDF or JPEG.
            </p>
          </div>
          {/* Card 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <CreditCard className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-xl font-bold mb-2 text-primary">Payment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click the Pay Now button to receive your format.
            </p>
          </div>
        </div>
      </section>

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
