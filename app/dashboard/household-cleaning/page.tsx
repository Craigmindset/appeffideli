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

const serviceCharges = {
  studio: 15000,
  apartment: 20000,
  bungalow: 25000,
  "duplex-terrace": 35000,
  "duplex-balcony": 30000,
} as const;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formSchema = z.object({
  state: z.string().min(1, "Please select a state"),
  apartmentType: z.enum(
    ["studio", "apartment", "bungalow", "duplex-terrace", "duplex-balcony"],
    {
      required_error: "Please select a home type",
    },
  ),
  orderType: z.enum(["download", "print-deliver"], {
    required_error: "Please select an order type",
  }),
});

export default function HouseholdCleaningPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      apartmentType: undefined,
      orderType: undefined,
    },
  });

  const selectedApartmentType = form.watch("apartmentType");
  const selectedOrderType = form.watch("orderType");

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const charge = serviceCharges[values.apartmentType];
      const reference = generatePaystackReference();

      const result = await createOrder({
        reference,
        email: userEmail,
        firstName: userName.split(" ")[0] || "",
        lastName: userName.split(" ")[1] || "",
        phone: userPhone,
        state: values.state,
        apartmentType: values.apartmentType,
        orderType: values.orderType,
        deliveryAddress: "",
        landmark: "",
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
              value: values.orderType,
            },
            {
              display_name: "State",
              variable_name: "state",
              value: values.state,
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
                          {[
                            { value: "studio", label: "Studio" },
                            { value: "apartment", label: "Apartment" },
                            {
                              value: "bungalow",
                              label: "Bungalow",
                            },
                            {
                              value: "duplex-terrace",
                              label: "Duplex/Terrace",
                            },
                            {
                              value: "duplex-balcony",
                              label: "Duplex with Balcony",
                            },
                          ].map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                              <label
                                htmlFor={option.value}
                                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {option.label} -{" "}
                                {formatCurrency(
                                  serviceCharges[
                                    option.value as keyof typeof serviceCharges
                                  ],
                                )}
                              </label>
                            </div>
                          ))}
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
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Order Type
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="download" id="download" />
                            <label
                              htmlFor="download"
                              className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Download (Get instant PDF)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="print-deliver"
                              id="print-deliver"
                            />
                            <label
                              htmlFor="print-deliver"
                              className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              Print & Deliver (Physical copy)
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pay Now Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedApartmentType || !selectedOrderType}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Processing..." : "Pay Now"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
