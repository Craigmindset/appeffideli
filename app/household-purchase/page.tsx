"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  FileText,
  Volume2,
  ArrowRight,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type HomeTypeKey =
  | "studio"
  | "apartment"
  | "bungalow"
  | "duplex-terrace"
  | "duplex-balcony";

type HouseholdPriceRate = {
  id: number;
  apartment_type: HomeTypeKey;
  home_type: string;
  pdf_rate: number;
  audio_rate: number;
  vat: number | null;
};

const HOME_TYPE_ORDER: HomeTypeKey[] = [
  "studio",
  "apartment",
  "bungalow",
  "duplex-terrace",
  "duplex-balcony",
];

const DEFAULT_HOME_TYPE_LABELS: Record<HomeTypeKey, string> = {
  studio: "Studio",
  apartment: "Apartment",
  bungalow: "Bungalow",
  "duplex-terrace": "Duplex/Terrace",
  "duplex-balcony": "Duplex with Balcony",
};

const isHomeTypeKey = (value: string): value is HomeTypeKey => {
  return HOME_TYPE_ORDER.includes(value as HomeTypeKey);
};

const normalizeApartmentType = (value: string): HomeTypeKey | null => {
  const normalized = value.trim().toLowerCase();
  return isHomeTypeKey(normalized) ? normalized : null;
};

const buildPriceRateMap = (rates: HouseholdPriceRate[]) => {
  const mapped: Partial<Record<HomeTypeKey, HouseholdPriceRate>> = {};

  for (const rate of rates) {
    const normalizedApartmentType = normalizeApartmentType(
      String(rate.apartment_type || ""),
    );

    if (normalizedApartmentType) {
      mapped[normalizedApartmentType] = {
        ...rate,
        apartment_type: normalizedApartmentType,
        home_type:
          rate.home_type || DEFAULT_HOME_TYPE_LABELS[normalizedApartmentType],
      };
    }
  }

  return mapped as Record<HomeTypeKey, HouseholdPriceRate>;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const HOME_TYPE_DESCRIPTION: Record<HomeTypeKey, string> = {
  studio:
    "A simple and efficient cleaning routine tailored for studio living. This format covers the sitting room, bedroom, kitchen, and laundry area, making it easy to maintain a tidy and functional space.",
  apartment:
    "A comprehensive cleaning routine designed for apartment living. This format includes structured cleaning schedules and checklists for the sitting room, adult bedroom, baby bedroom, toddler & teen bedroom, playroom, kitchen, and laundry area to help keep your home clean, organized, and stress-free.",
  bungalow:
    "A family-friendly cleaning routine designed for bungalow homes. This format includes the sitting room, adult bedroom, baby bedroom, toddler & teen bedroom, playroom, kitchen, laundry room, and garden, helping you maintain a clean, comfortable, and welcoming environment indoors and outdoors.",
  "duplex-balcony":
    "A practical cleaning routine for duplex homes. The format covers the sitting room, adult bedroom, dressing room, baby bedroom, toddler & teen bedroom, playroom, kitchen, laundry room, and balcony, providing a complete home maintenance guide.",
  "duplex-terrace":
    "A detailed cleaning routine created for larger family homes. This format includes the sitting room, adult bedroom, dressing room, baby bedroom, toddler & teen bedroom, playroom, laundry room, balcony, and terrace, ensuring every area of your home remains fresh and well-maintained.",
};

const HOME_TYPE_IMAGES: Partial<Record<HomeTypeKey, string>> = {
  studio: "/images/studio.jpg",
  apartment: "/images/apartment.jpg",
  bungalow: "/images/bungalow.jpg",
  "duplex-balcony": "/images/Duplex with Balcony.jpg",
  "duplex-terrace": "/images/DuplexTerrace.jpg",
};

export default function HouseholdPurchasePage() {
  const [isProceeding, setIsProceeding] = useState(false);
  const [selectedHomeType, setSelectedHomeType] = useState<HomeTypeKey | null>(
    null,
  );
  const [selectedRate, setSelectedRate] = useState<HouseholdPriceRate | null>(
    null,
  );
  const [addPdf, setAddPdf] = useState(false);
  const [addAudio, setAddAudio] = useState(false);
  const [priceRates, setPriceRates] = useState<
    Record<HomeTypeKey, HouseholdPriceRate>
  >({} as Record<HomeTypeKey, HouseholdPriceRate>);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const totalAmount = selectedRate
    ? (addPdf ? selectedRate.pdf_rate : 0) +
      (addAudio ? selectedRate.audio_rate : 0)
    : 0;

  useEffect(() => {
    const loadUserProfile = async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!selectedHomeType) {
      setSelectedRate(null);
      setAddPdf(false);
      setAddAudio(false);
      return;
    }

    const rate = priceRates[selectedHomeType];
    setSelectedRate(rate || null);
  }, [selectedHomeType, priceRates]);

  useEffect(() => {
    const loadPriceRates = async () => {
      const cacheKey = "household_pricing_rates_v1";
      const cacheTtlMs = 1000 * 60 * 60 * 24;
      let isMounted = true;
      const supabase = createBrowserSupabaseClient();

      const cacheRates = (rates: HouseholdPriceRate[]) => {
        const mappedRates = buildPriceRateMap(rates);

        if (!isMounted) {
          return;
        }

        setPriceRates(mappedRates);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            rates: mappedRates,
          }),
        );
      };

      const fetchLatestRates = async () => {
        const { data, error } = await supabase
          .schema("public")
          .from("price_rate_household")
          .select("id, apartment_type, home_type, pdf_rate, audio_rate, vat")
          .order("id", { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          cacheRates(data as HouseholdPriceRate[]);
          return;
        }

        const response = await fetch("/api/household-pricing", {
          cache: "no-store",
        });

        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.rates)) {
          throw error || new Error("Unable to fetch household pricing rates");
        }

        cacheRates(result.rates as HouseholdPriceRate[]);
      };

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached) as {
            timestamp: number;
            rates:
              | HouseholdPriceRate[]
              | Record<HomeTypeKey, HouseholdPriceRate>;
          };

          const isFresh = Date.now() - parsedCache.timestamp < cacheTtlMs;
          if (isFresh) {
            const cachedRates = Array.isArray(parsedCache.rates)
              ? buildPriceRateMap(parsedCache.rates)
              : parsedCache.rates;

            if (Object.keys(cachedRates).length > 0) {
              setPriceRates(
                cachedRates as Record<HomeTypeKey, HouseholdPriceRate>,
              );
              setIsPriceLoading(false);
            }
          }
        }

        await fetchLatestRates();
      } catch (error) {
        console.error("Failed to load household pricing rates:", error);
      } finally {
        if (isMounted) {
          setIsPriceLoading(false);
        }
      }

      const channel = supabase
        .channel("price_rate_household_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "price_rate_household",
          },
          async () => {
            try {
              await fetchLatestRates();
            } catch (error) {
              console.error("Realtime pricing refresh failed:", error);
            }
          },
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    };

    let cleanup: (() => void) | undefined;

    loadPriceRates().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const handleContinueToPayment = () => {
    if (!selectedHomeType || !selectedRate) {
      alert("Please select a home type.");
      return;
    }

    if (!addPdf && !addAudio) {
      alert("Please select at least one order type.");
      return;
    }

    setIsProceeding(true);

    const payload = {
      apartmentType: selectedHomeType,
      addPdf,
      addAudio,
      totalAmount,
      isAuthenticated,
    };

    sessionStorage.setItem("householdPurchaseDraft", JSON.stringify(payload));
    router.push("/household-purchase/payment");
  };

  const renderHomeTypeCard = (homeType: HomeTypeKey) => {
    const option = priceRates[homeType];
    const isActive = selectedHomeType === homeType;
    const homeTypeImage = HOME_TYPE_IMAGES[homeType];

    return (
      <div
        key={homeType}
        className={`w-full rounded-2xl border transition-all duration-300 p-4 sm:p-5 bg-white ${
          isActive
            ? "border-[#174969] shadow-lg shadow-[#174969]/10"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 h-36 sm:h-40 w-full flex items-center justify-center mb-4 overflow-hidden relative">
          {homeTypeImage ? (
            <Image
              src={homeTypeImage}
              alt={`${DEFAULT_HOME_TYPE_LABELS[homeType]} image`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <>
              <Home className="h-10 w-10 text-slate-500" />
              <span className="sr-only">Image Placeholder</span>
            </>
          )}
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {DEFAULT_HOME_TYPE_LABELS[homeType]}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {HOME_TYPE_DESCRIPTION[homeType]}
        </p>

        <div className="space-y-2 rounded-xl bg-slate-50 border border-slate-200 p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-slate-700">
              <FileText className="h-4 w-4 text-[#174969]" />
              PDF
            </span>
            <strong className="text-slate-900">
              {option ? formatCurrency(option.pdf_rate) : "Loading..."}
            </strong>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-slate-700">
              <Volume2 className="h-4 w-4 text-[#174969]" />
              Audio
            </span>
            <strong className="text-slate-900">
              {option ? formatCurrency(option.audio_rate) : "Loading..."}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedHomeType(homeType)}
          className={`w-full rounded-xl border px-3 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            isActive
              ? "bg-[#174969] border-[#174969] text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {isActive ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
          {isActive ? "Selected" : "Select Home Type"}
        </button>

        {isActive && (
          <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Order Type</h4>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={addPdf}
                onCheckedChange={(checked) => setAddPdf(Boolean(checked))}
              />
              <span className="inline-flex items-center gap-2 text-slate-700 text-sm">
                <FileText className="h-4 w-4 text-[#174969]" />
                Download PDF (Printable)
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
              <Checkbox
                checked={addAudio}
                onCheckedChange={(checked) => setAddAudio(Boolean(checked))}
              />
              <span className="inline-flex items-center gap-2 text-slate-700 text-sm">
                <Volume2 className="h-4 w-4 text-[#174969]" />
                Download Audio Version
              </span>
            </label>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleContinueToPayment}
                disabled={
                  isProceeding ||
                  isPriceLoading ||
                  !selectedRate ||
                  (!addPdf && !addAudio) ||
                  totalAmount <= 0
                }
                className="bg-[#174969] hover:bg-[#123a54] text-white"
              >
                {isProceeding ? (
                  "Preparing..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Pay Now <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="text-center rounded-2xl bg-gradient-to-br from-[#174969] to-[#2d6d96] px-4 py-10 sm:py-12 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Request Form
        </h1>
        <p className="mt-3 text-sm sm:text-base text-blue-50 max-w-2xl mx-auto">
          Household Cleaning Routine - Customized cleaning guide for your home
        </p>
      </div>

      <section className="space-y-5">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 text-center">
          Home Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
          {renderHomeTypeCard("studio")}
          {renderHomeTypeCard("apartment")}
          {renderHomeTypeCard("bungalow")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
          {renderHomeTypeCard("duplex-balcony")}
          {renderHomeTypeCard("duplex-terrace")}
          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
