"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaystack } from "@/hooks/use-paystack";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/payment";
import { generatePaystackReference } from "@/lib/paystack";
import { Checkbox } from "@/components/ui/checkbox";
import { createBrowserSupabaseClient } from "@/lib/supabase";

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

const formSchema = z
  .object({
    state: z.string().min(1, "Please select a state"),
    apartmentType: z.enum(
      ["studio", "apartment", "bungalow", "duplex-terrace", "duplex-balcony"],
      {
        required_error: "Please select a home type",
      },
    ),
    addPdf: z.boolean(),
    addAudio: z.boolean(),
  })
  .refine((values) => values.addPdf || values.addAudio, {
    message: "Please select at least one order type",
    path: ["addPdf"],
  });

export default function HouseholdCleaningPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [priceRates, setPriceRates] = useState<
    Record<HomeTypeKey, HouseholdPriceRate>
  >({} as Record<HomeTypeKey, HouseholdPriceRate>);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const router = useRouter();

  const form = useForm<
    z.input<typeof formSchema>,
    any,
    z.output<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      apartmentType: undefined,
      addPdf: false,
      addAudio: false,
    },
  });

  const selectedApartmentType = form.watch("apartmentType");
  const addPdf = form.watch("addPdf");
  const addAudio = form.watch("addAudio");
  const selectedRate = selectedApartmentType
    ? priceRates[selectedApartmentType]
    : null;
  const totalAmount = selectedRate
    ? (addPdf ? selectedRate.pdf_rate : 0) +
      (addAudio ? selectedRate.audio_rate : 0)
    : 0;

  useEffect(() => {
    // Get user data from session/localStorage
    const userData = localStorage.getItem("userDetails");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserEmail(parsed.email);
      setUserName(parsed.name || `${parsed.firstName} ${parsed.lastName}`);
      setUserPhone(parsed.phone);
    }
  }, []);

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

  const handlePaymentCallback = async (response: any) => {
    try {
      const verificationResult = await fetch(
        `/api/verify-payment?reference=${response.reference}`,
      );
      const data = await verificationResult.json();

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/payment-success?reference=${response.reference}`);
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      setIsSubmitting(false);
    }
  };

  const { initializePayment } = usePaystack({
    email: userEmail || "user@example.com",
    firstName: userName.split(" ")[0] || "User",
    lastName: userName.split(" ")[1] || "",
    phone: userPhone || "0000000000",
    apartmentType: "studio",
    orderType: "download",
    onSuccess: handlePaymentCallback,
    onClose: () => setIsSubmitting(false),
  });

  async function onSubmit(values: z.output<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const selectedPricing = priceRates[values.apartmentType];

      if (!selectedPricing) {
        throw new Error("Selected home type pricing is unavailable");
      }

      const charge =
        (values.addPdf ? selectedPricing.pdf_rate : 0) +
        (values.addAudio ? selectedPricing.audio_rate : 0);

      if (!charge || charge <= 0) {
        throw new Error("Invalid amount calculated for this order");
      }

      const reference = generatePaystackReference();

      const result = await createOrder({
        reference,
        email: userEmail,
        firstName: userName.split(" ")[0] || "",
        lastName: userName.split(" ")[1] || "",
        phone: userPhone,
        state: values.state,
        apartmentType: values.apartmentType,
        orderType: "download",
        deliveryAddress: "",
        landmark:
          values.addPdf && values.addAudio
            ? "download-pdf-and-audio"
            : values.addPdf
              ? "download-pdf-only"
              : "download-audio-only",
        amount: charge,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      const paymentInitialized = initializePayment({
        email: userEmail,
        amount: charge,
        ref: reference,
        firstname: userName.split(" ")[0] || "",
        lastname: userName.split(" ")[1] || "",
        phone: userPhone,
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
              value: values.apartmentType,
            },
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value:
                values.addPdf && values.addAudio
                  ? "Download PDF (Printable) + Download Audio Version"
                  : values.addPdf
                    ? "Download PDF (Printable)"
                    : "Download Audio Version",
            },
            {
              display_name: "State",
              variable_name: "state",
              value: values.state,
            },
            {
              display_name: "PDF Selected",
              variable_name: "pdf_selected",
              value: values.addPdf ? "yes" : "no",
            },
            {
              display_name: "Audio Selected",
              variable_name: "audio_selected",
              value: values.addAudio ? "yes" : "no",
            },
          ],
        },
      });

      if (!paymentInitialized) {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Request Form</h1>
        <p className="text-muted-foreground mt-2">
          Household Cleaning Routine - Customized cleaning guide for your home
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Household Cleaning Request</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Home Type */}
              <FormField
                control={form.control}
                name="apartmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Home Type
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {HOME_TYPE_ORDER.map((homeType) => {
                            const option = priceRates[homeType];

                            return (
                              <div
                                key={homeType}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={homeType}
                                  id={homeType}
                                />
                                <label
                                  htmlFor={homeType}
                                  className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {option?.home_type ||
                                    DEFAULT_HOME_TYPE_LABELS[homeType]}{" "}
                                  ( PDF ={" "}
                                  {option
                                    ? formatCurrency(option.pdf_rate)
                                    : isPriceLoading
                                      ? "Loading..."
                                      : "N/A"}{" "}
                                  Audio ={" "}
                                  {option
                                    ? formatCurrency(option.audio_rate)
                                    : isPriceLoading
                                      ? "Loading..."
                                      : "N/A"}
                                  )
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      State
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Type your state"
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);

                            // Filter states based on input
                            if (value) {
                              const filtered = nigerianStates.filter((state) =>
                                state
                                  .toLowerCase()
                                  .includes(value.toLowerCase()),
                              );
                              setFilteredStates(filtered);
                              setShowStateSuggestions(true);
                            } else {
                              setFilteredStates([]);
                              setShowStateSuggestions(false);
                            }
                          }}
                          onFocus={() => {
                            if (field.value) {
                              setShowStateSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(
                              () => setShowStateSuggestions(false),
                              200,
                            );
                          }}
                          className="pr-10"
                        />

                        {/* Clear button */}
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setFilteredStates([]);
                              setShowStateSuggestions(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        {/* Autocomplete suggestions dropdown */}
                        {showStateSuggestions && filteredStates.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {filteredStates.map((state) => (
                              <div
                                key={state}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  field.onChange(state);
                                  setShowStateSuggestions(false);
                                  setFilteredStates([]);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              >
                                {state}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Type */}
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Order Type
                </FormLabel>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="addPdf"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                          />
                        </FormControl>
                        <FormLabel className="font-medium leading-none cursor-pointer">
                          Download PDF (Printable)
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addAudio"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(Boolean(checked))
                            }
                          />
                        </FormControl>
                        <FormLabel className="font-medium leading-none cursor-pointer">
                          Download Audio Version
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addPdf"
                    render={() => <FormMessage />}
                  />
                </div>
              </FormItem>

              {/* Pay Now Button */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isPriceLoading ||
                  !selectedApartmentType ||
                  (!addPdf && !addAudio) ||
                  !selectedRate ||
                  totalAmount <= 0
                }
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSubmitting
                  ? "Processing..."
                  : `Pay Now ${formatCurrency(totalAmount)}`}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
