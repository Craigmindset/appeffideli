"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ArrowRight,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  createInfantRecipePurchase,
  createInfantRecipeGuestPurchase,
  type InfantRecipePackType,
} from "@/app/actions/infant-recipes";
import { usePaystack } from "@/hooks/use-paystack";

export default function InfantRecipesClient() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [purchaseReference, setPurchaseReference] = useState<string>("");
  const [isGuestFlow, setIsGuestFlow] = useState(false);
  const [guestProfileExists, setGuestProfileExists] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const latestPaymentReferenceRef = useRef<string>("");
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
      planCode: "PLN_STARTER_INFANT",
      previews: [
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20basic-preview1.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20basic-preview2.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20basic-preview3.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20basic-preview4.png",
      ],
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
      planCode: "PLN_STANDARD_INFANT",
      previews: [
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20standard-preview1.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20standard-preview2.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20standard-preview3.png",
        "https://dohdf572hojoyskk.public.blob.vercel-storage.com/infant%26toddler%20standard-preview4.png",
      ],
    },
  ];

  const handleGuestPhoneInput = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 11);
    setGuestForm((prev) => ({ ...prev, phone: sanitized }));
  };

  const openPreviewModal = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setIsPreviewModalOpen(true);
  };

  const handleNextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % previewImages.length);
  };

  const handlePrevPreview = () => {
    setPreviewIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    );
  };

  const handleGetStarted = async (plan: (typeof plans)[0]) => {
    setLoadingPlans((prev) => ({ ...prev, [plan.id]: true }));
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSelectedPlan(plan);
        setIsGuestFlow(true);
        setIsCheckoutOpen(true);
        return;
      }

      const { data: profile } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsGuestFlow(false);
        setUserProfile(profile);
        setSelectedPlan(plan);

        const result = await createInfantRecipePurchase(
          plan.id as InfantRecipePackType,
          plan.amount,
        );

        if (result.success && result.reference) {
          setPurchaseReference(result.reference);
          setIsCheckoutOpen(true);
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

  const handleGuestPurchaseStart = async (): Promise<string | null> => {
    if (!selectedPlan) return null;
    if (!guestForm.firstName || !guestForm.lastName || !guestForm.email) {
      alert("Please provide first name, last name, and email.");
      return null;
    }

    if (guestForm.phone && guestForm.phone.length !== 11) {
      alert("Phone number must be 11 digits.");
      return null;
    }

    try {
      const result = await createInfantRecipeGuestPurchase(
        selectedPlan.id as InfantRecipePackType,
        selectedPlan.amount,
        guestForm.firstName,
        guestForm.lastName,
        guestForm.email,
        guestForm.phone,
      );

      if (result.success && result.reference) {
        setPurchaseReference(result.reference);
        setGuestProfileExists(!!result.profileExists);
        latestPaymentReferenceRef.current = result.reference;
        return result.reference;
      } else {
        alert(result.error || "Failed to start purchase");
        return null;
      }
    } catch (error) {
      console.error(error);
      alert("Unable to start purchase. Please try again.");
      return null;
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
    onSuccess: async (response: { reference?: string }) => {
      setIsCheckoutOpen(false);
      try {
        const resolvedReference =
          response?.reference ||
          latestPaymentReferenceRef.current ||
          purchaseReference;

        if (!resolvedReference) {
          alert("Payment reference missing. Please contact support.");
          return;
        }

        const res = await fetch(
          `/api/verify-payment?reference=${encodeURIComponent(resolvedReference)}`,
        );
        const data = await res.json();
        const paymentStatus = data?.data?.data?.status;
        const paymentSucceeded = data.success && paymentStatus === "success";

        if (paymentSucceeded && isGuestFlow) {
          const query = new URLSearchParams({
            reference: resolvedReference,
            firstName: guestForm.firstName,
            lastName: guestForm.lastName,
            email: guestForm.email,
            phone: guestForm.phone,
            profileExists: guestProfileExists ? "1" : "0",
            isGuest: "1",
          });
          router.replace(`/services/infant-recipes/success?${query.toString()}`);
        } else if (paymentSucceeded) {
          const fullName = userProfile?.full_name || "";
          const [firstName = "", ...lastNameParts] = fullName.split(" ");
          const query = new URLSearchParams({
            reference: resolvedReference,
            firstName,
            lastName: lastNameParts.join(" "),
            email: userProfile?.email || "",
            phone: userProfile?.phone || "",
            isGuest: "0",
          });
          router.push(`/services/infant-recipes/success?${query.toString()}`);
        } else {
          alert(data.error || "Payment verification failed");
        }
      } catch (e) {
        console.error("Verification error", e);
        alert("An error occurred during verification");
      }
    },
    onClose: () => {},
  });

  const handlePay = (referenceOverride?: string) => {
    if (!selectedPlan) return;

    const checkoutProfile = isGuestFlow
      ? {
          email: guestForm.email,
          full_name: `${guestForm.firstName} ${guestForm.lastName}`,
          phone: guestForm.phone,
          id: "guest",
        }
      : userProfile;

    if (!checkoutProfile?.email) {
      alert("Missing buyer information");
      return;
    }

    const resolvedReference = referenceOverride || purchaseReference;
    if (!resolvedReference) {
      alert("Unable to start payment. Missing purchase reference.");
      return;
    }
    latestPaymentReferenceRef.current = resolvedReference;

    initializePayment({
      email: checkoutProfile.email,
      amount: selectedPlan.amount,
      ref: resolvedReference,
      firstname: checkoutProfile.full_name?.split(" ")[0] || guestForm.firstName,
      lastname:
        checkoutProfile.full_name?.split(" ").slice(1).join(" ") ||
        guestForm.lastName,
      phone: checkoutProfile.phone || "",
      metadata: {
        pack_type: selectedPlan.id,
        pack_name: selectedPlan.name,
        user_id: checkoutProfile.id,
        purchase_reference: resolvedReference,
        order_type: "infant-recipe",
        is_guest_checkout: isGuestFlow,
        profile_exists: guestProfileExists,
      },
    });
  };

  return (
    <>
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

      <div className="space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${
                plan.color
              } transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "md:scale-[1.01]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Recommended
                  </span>
                </div>
              )}

              <div
                className={`p-4 md:p-5 flex flex-col md:flex-row gap-4 h-full ${
                  plan.popular ? "pt-8" : ""
                }`}
              >
                <div className="md:w-1/2 flex flex-col gap-3 min-w-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3">
                    <div className="flex items-baseline">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs md:text-sm">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

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
                        Pay Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="md:w-1/2 space-y-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Preview
                  </p>
                  <button
                    onClick={() => openPreviewModal(plan.previews, 0)}
                    className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={plan.previews[0]}
                      alt={`${plan.name} preview`}
                      className="w-full h-36 md:h-40 object-cover hover:scale-[1.02] transition-transform duration-300"
                    />
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    {plan.previews.map((preview: string, index: number) => (
                      <button
                        key={preview}
                        onClick={() => openPreviewModal(plan.previews, index)}
                        className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        <img
                          src={preview}
                          alt={`${plan.name} thumbnail ${index + 1}`}
                          className="w-full h-14 md:h-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to plans
            </button>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Checkout
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review your details and complete payment.
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-5">
              {isGuestFlow ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="First Name"
                      value={guestForm.firstName}
                      onChange={(e) =>
                        setGuestForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Last Name"
                      value={guestForm.lastName}
                      onChange={(e) =>
                        setGuestForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={guestForm.email}
                    onChange={(e) =>
                      setGuestForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="Phone Number (11 digits)"
                    value={guestForm.phone}
                    onChange={(e) => handleGuestPhoneInput(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile?.full_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile?.email}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 border border-primary rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pack</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-lg font-bold text-primary">{selectedPlan.price}</span>
              </div>
            </div>

            <button
              onClick={async () => {
                let guestReference: string | null = null;
                if (isGuestFlow && !purchaseReference) {
                  guestReference = await handleGuestPurchaseStart();
                  if (!guestReference) {
                    return;
                  }
                }
                setTimeout(() => {
                  handlePay(guestReference || purchaseReference);
                }, 150);
              }}
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
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute -top-10 right-0 text-white"
            >
              <X className="w-7 h-7" />
            </button>
            <div className="bg-white rounded-xl overflow-hidden">
              <img
                src={previewImages[previewIndex]}
                alt={`Preview ${previewIndex + 1}`}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="flex items-center justify-between p-3">
                <button onClick={handlePrevPreview} className="px-3 py-2 rounded-md border">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {previewIndex + 1} / {previewImages.length}
                </span>
                <button onClick={handleNextPreview} className="px-3 py-2 rounded-md border">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
