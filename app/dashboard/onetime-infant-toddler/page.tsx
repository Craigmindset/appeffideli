"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaystack } from "@/hooks/use-paystack";
import { useRouter } from "next/navigation";
import { createOrder, verifyPayment } from "@/app/actions/payment";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SERVICE_CHARGE = 50000;

const recipePreferences = [
  { id: "allergies", label: "Allergies Conscious" },
  { id: "sweet", label: "Sweet Tooth Preferences" },
  { id: "nutrition", label: "Nutrition Goals" },
];

const formSchema = z.object({
  childFirstName: z.string().min(2, "First name must be at least 2 characters"),
  childLastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["male", "female"], {
    required_error: "Please select gender",
  }),
  age: z.string().min(1, "Age is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  hasAllergies: z.enum(["yes", "no"], {
    required_error: "Please indicate if there are any allergies",
  }),
  allergiesDetails: z.string().optional(),
  recipePreferences: z
    .array(z.string())
    .min(1, "Please select at least one preference"),
});

export default function OnetimeInfantToddlerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childFirstName: "",
      childLastName: "",
      gender: undefined,
      age: "",
      dateOfBirth: "",
      hasAllergies: undefined,
      allergiesDetails: "",
      recipePreferences: [],
    },
  });

  const watchHasAllergies = form.watch("hasAllergies");

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
      const verified = await verifyPayment(response.reference);
      if (verified) {
        router.push(`/payment-success?reference=${response.reference}`);
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  };

  const { initializePayment } = usePaystack({
    email: userEmail || "user@example.com",
    firstName: userName.split(" ")[0] || "User",
    lastName: userName.split(" ")[1] || "",
    phone: userPhone || "0000000000",
    apartmentType: "infant-recipe",
    orderType: "download",
    onSuccess: handlePaymentCallback,
    onClose: () => setIsSubmitting(false),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const reference = `IR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const preferencesString = values.recipePreferences.join(",");

      const result = await createOrder({
        reference: reference,
        email: userEmail,
        firstName: userName.split(" ")[0] || "",
        lastName: userName.split(" ")[1] || "",
        phone: userPhone,
        state: "N/A",
        apartmentType: "infant-recipe",
        orderType: "download",
        deliveryAddress: "",
        landmark: "",
        amount: SERVICE_CHARGE,
      });

      if (result.success) {
        // Initialize payment
        initializePayment({
          amount: SERVICE_CHARGE,
          metadata: {
            service: "infant-recipe",
            preferences: preferencesString,
            details: values,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Child Details Form
        </h1>
        <p className="text-muted-foreground mt-2">
          One-time Infant & Toddler Recipe Pack - Specialized meal plans for
          your little one
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            Child Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Child Details Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="childFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Child's first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="childLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Last Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Child's last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Gender
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Age (in months)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="6"
                            max="12"
                            placeholder="Enter age in months"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hasAllergies"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">
                        Does your child have any allergies?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchHasAllergies === "yes" && (
                  <FormField
                    control={form.control}
                    name="allergiesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Please indicate allergies
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please list all known allergies..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="recipePreferences"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base font-semibold">
                          Recipe Tailored Options
                        </FormLabel>
                      </div>
                      <div className="space-y-2">
                        {recipePreferences.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="recipePreferences"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Summary */}

              {/* Download Recipe Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Download Recipe - ${formatCurrency(SERVICE_CHARGE)}`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
