"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [purchaseReference, setPurchaseReference] = useState<string>("");
  const [isGuestFlow, setIsGuestFlow] = useState(false);
  const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);
  const [guestSuccessData, setGuestSuccessData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    reference: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const guestSuccess = searchParams.get("guestSuccess");
    const reference = searchParams.get("reference");
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const email = searchParams.get("email");

    if (guestSuccess === "1" && reference && firstName && lastName && email) {
      setGuestSuccessData({
        firstName,
        lastName,
        email,
        reference,
      });
      setShowGuestSuccessModal(true);
    }
  }, [searchParams]);

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
        setIsModalOpen(true);
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

  const handleGuestPurchaseStart = async () => {
    if (!selectedPlan) return;
    if (!guestForm.firstName || !guestForm.lastName || !guestForm.email) {
      alert("Please provide first name, last name, and email.");
      return;
    }

    try {
      const result = await createInfantRecipeGuestPurchase(
        selectedPlan.id as InfantRecipePackType,
        selectedPlan.amount,
        guestForm.firstName,
        guestForm.lastName,
        guestForm.email,
      );

      if (result.success && result.reference) {
        setPurchaseReference(result.reference);
      } else {
        alert(result.error || "Failed to start purchase");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to start purchase. Please try again.");
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
    onSuccess: async () => {
      setIsModalOpen(false);
      try {
        const res = await fetch(
          `/api/verify-payment?reference=${purchaseReference}`,
        );
        const data = await res.json();
        if (data.success && isGuestFlow) {
          const query = new URLSearchParams({
            guestSuccess: "1",
            reference: purchaseReference,
            firstName: guestForm.firstName,
            lastName: guestForm.lastName,
            email: guestForm.email,
          });
          router.replace(`/services/infant-recipes?${query.toString()}`);
        } else if (data.success) {
          router.push("/dashboard/onetime-infant-toddler");
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

  const handlePay = () => {
    if (!selectedPlan) return;

    const checkoutProfile = isGuestFlow
      ? {
          email: guestForm.email,
          full_name: `${guestForm.firstName} ${guestForm.lastName}`,
          phone: "",
          id: "guest",
        }
      : userProfile;

    if (!checkoutProfile?.email) {
      alert("Missing buyer information");
      return;
    }

    initializePayment({
      email: checkoutProfile.email,
      amount: selectedPlan.amount,
      ref: purchaseReference,
      firstname: checkoutProfile.full_name?.split(" ")[0] || guestForm.firstName,
      lastname:
        checkoutProfile.full_name?.split(" ").slice(1).join(" ") ||
        guestForm.lastName,
      phone: checkoutProfile.phone || "",
      metadata: {
        pack_type: selectedPlan.id,
        pack_name: selectedPlan.name,
        user_id: checkoutProfile.id,
        purchase_reference: purchaseReference,
        order_type: "infant-recipe",
        is_guest_checkout: isGuestFlow,
      },
    });
  };

  const handleDownloadNow = () => {
    if (!guestSuccessData) return;
    window.location.href = `/download/${guestSuccessData.reference}`;
  };

  const handleGoToDashboardSignup = () => {
    if (!guestSuccessData) return;
    const query = new URLSearchParams({
      firstName: guestSuccessData.firstName,
      lastName: guestSuccessData.lastName,
      email: guestSuccessData.email,
    });
    router.push(`/signup?${query.toString()}`);
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
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

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

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Preview
                  </p>
                  <button
                    onClick={() => openPreviewModal(plan.previews, 0)}
                    className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <img
                      src={plan.previews[0]}
                      alt={`${plan.name} preview`}
                      className="w-full h-44 object-cover hover:scale-[1.02] transition-transform duration-300"
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
                          className="w-full h-16 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

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
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm Purchase
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Review your purchase details
              </p>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              {isGuestFlow ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-3 border border-primary rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pack</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-lg font-bold text-primary">{selectedPlan.price}</span>
              </div>
            </div>

            <button
              onClick={async () => {
                if (isGuestFlow && !purchaseReference) {
                  await handleGuestPurchaseStart();
                }
                setTimeout(() => {
                  handlePay();
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

      {showGuestSuccessModal && guestSuccessData && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setShowGuestSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Payment Successful</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your pack is ready. Choose what you want to do next.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadNow}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold"
              >
                Download Now
              </button>
              <button
                onClick={handleGoToDashboardSignup}
                className="w-full border border-gray-300 py-2.5 rounded-lg font-semibold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
