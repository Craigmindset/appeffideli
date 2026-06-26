"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { createOrder } from "@/app/actions/payment";
import { generatePaystackReference } from "@/lib/paystack";
import { usePaystack } from "@/hooks/use-paystack";

type HomeTypeKey =
  | "studio"
  | "apartment"
  | "bungalow"
  | "duplex-terrace"
  | "duplex-balcony";

type CheckoutDraft = {
  apartmentType: HomeTypeKey;
  addPdf: boolean;
  addAudio: boolean;
  totalAmount: number;
  isAuthenticated: boolean;
};

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const HOME_TYPE_LABELS: Record<HomeTypeKey, string> = {
  studio: "Studio",
  apartment: "Apartment",
  bungalow: "Bungalow",
  "duplex-terrace": "Duplex/Terrace",
  "duplex-balcony": "Duplex with Balcony",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function HouseholdPurchasePaymentPage() {
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const draftRaw = sessionStorage.getItem("householdPurchaseDraft");
    if (!draftRaw) {
      router.replace("/household-purchase");
      return;
    }

    const parsed = JSON.parse(draftRaw) as CheckoutDraft;
    setDraft(parsed);

    const loadUser = async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthUserId(null);
        return;
      }

      setAuthUserId(user.id);

      const { data: profile } = await supabase
        .from("users_profile")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      const fullName =
        profile?.full_name || user.user_metadata?.full_name || "";
      const [initialFirstName = "", ...rest] = fullName.split(" ");

      setFirstName(initialFirstName);
      setLastName(rest.join(" "));
      setEmail(profile?.email || user.email || "");
      setPhone(profile?.phone || user.user_metadata?.phone || "");
    };

    loadUser();
  }, [router]);

  const orderTypeLabel = useMemo(() => {
    if (!draft) return "";
    if (draft.addPdf && draft.addAudio) {
      return "Download PDF (Printable) + Download Audio Version";
    }
    if (draft.addPdf) return "Download PDF (Printable)";
    return "Download Audio Version";
  }, [draft]);

  const { initializePayment } = usePaystack({
    email: email || "user@example.com",
    firstName: firstName || "User",
    lastName: lastName || "",
    phone: phone || "0000000000",
    apartmentType: draft?.apartmentType || "studio",
    orderType: "download",
    amount: draft?.totalAmount || 0,
    onSuccess: async (response: { reference: string }) => {
      try {
        const verificationResult = await fetch(
          `/api/verify-payment?reference=${response.reference}`,
        );
        const data = await verificationResult.json();

        sessionStorage.removeItem("householdPurchaseDraft");

        if (data.success && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(`/payment-success?reference=${response.reference}`);
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setIsSubmitting(false);
      }
    },
    onClose: () => setIsSubmitting(false),
  });

  const handleCompletePayment = async () => {
    if (!draft) {
      router.replace("/household-purchase");
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Please enter first name, last name, and email.");
      return;
    }

    if (!stateValue.trim()) {
      alert("Please select your state.");
      return;
    }

    if (phone.trim() && phone.trim().length !== 11) {
      alert("Phone number must be 11 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const reference = generatePaystackReference();

      const result = await createOrder({
        reference,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        state: stateValue.trim(),
        apartmentType: draft.apartmentType,
        orderType: "download",
        deliveryAddress: "",
        authUserId: authUserId || undefined,
        landmark:
          draft.addPdf && draft.addAudio
            ? "download-pdf-and-audio"
            : draft.addPdf
              ? "download-pdf-only"
              : "download-audio-only",
        amount: draft.totalAmount,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      if (result.verificationEmailSent) {
        alert(
          "We created your account profile and sent a verification email. Please verify your email after completing payment.",
        );
      }

      const paymentInitialized = initializePayment({
        email: email.trim(),
        amount: draft.totalAmount,
        ref: reference,
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        phone: phone.trim(),
        metadata: {
          custom_fields: [
            {
              display_name: "Service",
              variable_name: "service",
              value: "household-cleaning",
            },
            {
              display_name: "Apartment Type",
              variable_name: "apartment_type",
              value: draft.apartmentType,
            },
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: orderTypeLabel,
            },
            {
              display_name: "State",
              variable_name: "state",
              value: stateValue.trim(),
            },
            {
              display_name: "Checkout Flow",
              variable_name: "checkout_flow",
              value: draft.isAuthenticated ? "authenticated" : "guest",
            },
          ],
        },
      });

      if (!paymentInitialized) {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Unable to complete order",
      );
      setIsSubmitting(false);
    }
  };

  if (!draft) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm text-slate-600">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => router.push("/household-purchase")}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="rounded-2xl bg-gradient-to-br from-[#174969] to-[#2d6d96] px-4 py-8 text-white text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Payment Details</h1>
        <p className="mt-2 text-blue-50 text-sm sm:text-base">
          Enter your details to complete payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="Enter 11-digit phone number"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="state">State</Label>
              <div className="relative">
                <Input
                  id="state"
                  value={stateValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStateValue(value);

                    if (value) {
                      const filtered = nigerianStates.filter((state) =>
                        state.toLowerCase().includes(value.toLowerCase()),
                      );
                      setFilteredStates(filtered);
                      setShowStateSuggestions(true);
                    } else {
                      setFilteredStates([]);
                      setShowStateSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (stateValue) {
                      setShowStateSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowStateSuggestions(false), 200);
                  }}
                  placeholder="Type your state"
                />

                {showStateSuggestions && filteredStates.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filteredStates.map((state) => (
                      <button
                        type="button"
                        key={state}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setStateValue(state);
                          setShowStateSuggestions(false);
                          setFilteredStates([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 h-fit">
          <h3 className="text-lg font-semibold text-slate-900">
            Order Summary
          </h3>

          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Home Type:{" "}
              <strong>{HOME_TYPE_LABELS[draft.apartmentType]}</strong>
            </p>
            <p>
              State: <strong>{stateValue || "Not selected"}</strong>
            </p>
            <div className="pt-1">
              {draft.addPdf && (
                <p className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#174969]" /> PDF selected
                  {/* Added whitespace-nowrap here */}
                  <span className="text-[11px] font-normal text-red-900 whitespace-nowrap">
                    (we advise you print in A5 landscape)
                  </span>
                </p>
              )}
              {draft.addAudio && (
                <p className="inline-flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-[#174969]" /> Audio selected
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(draft.totalAmount)}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleCompletePayment}
            disabled={isSubmitting}
            className="w-full bg-[#174969] hover:bg-[#123a54] text-white"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              "Complete Payment"
            )}
          </Button>
        </aside>
      </div>
    </div>
  );
}
