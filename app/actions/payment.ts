"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createSubscriptionAccess } from "./subscription";
import { updateInfantRecipePurchaseStatus } from "./infant-recipes";

type ResolvedOrderUser = {
  userId: string | null;
  profileCreated: boolean;
  verificationEmailSent: boolean;
};

function generateTemporaryPassword() {
  const suffix = Math.random().toString(36).slice(2);
  return `Tmp!${suffix}A1`;
}

async function findAuthUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    const matchedUser =
      data.users.find((user) => (user.email || "").toLowerCase() === normalizedEmail) ||
      null;

    if (matchedUser) {
      return { user: matchedUser, error: null };
    }

    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return { user: null, error: null };
}

async function ensureUserProfile(params: {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
}) {
  const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
    .from("users_profile")
    .select("id")
    .eq("id", params.userId)
    .maybeSingle();

  if (profileLookupError) {
    return {
      success: false,
      profileCreated: false,
      error: "Failed to check existing user profile",
    };
  }

  if (existingProfile?.id) {
    return { success: true, profileCreated: false };
  }

  const { error: insertProfileError } = await supabaseAdmin
    .from("users_profile")
    .insert({
      id: params.userId,
      email: params.email,
      full_name: params.fullName || null,
      phone: params.phone || null,
    });

  if (insertProfileError) {
    return {
      success: false,
      profileCreated: false,
      error: insertProfileError.message,
    };
  }

  return { success: true, profileCreated: true };
}

async function resolveOrderUser(params: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  authUserId?: string;
}) : Promise<{ success: boolean; data?: ResolvedOrderUser; error?: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const fullName = `${params.firstName} ${params.lastName}`.trim();

  if (params.authUserId) {
    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(params.authUserId);

    if (authUserError || !authUserData.user) {
      return {
        success: false,
        error: "Could not validate the authenticated user.",
      };
    }

    if ((authUserData.user.email || "").toLowerCase() !== normalizedEmail) {
      return {
        success: false,
        error: "The email entered does not match your signed-in account.",
      };
    }

    const profileResult = await ensureUserProfile({
      userId: authUserData.user.id,
      email: normalizedEmail,
      fullName,
      phone: params.phone,
    });

    if (!profileResult.success) {
      return { success: false, error: profileResult.error };
    }

    return {
      success: true,
      data: {
        userId: authUserData.user.id,
        profileCreated: profileResult.profileCreated,
        verificationEmailSent: false,
      },
    };
  }

  const { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("users_profile")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (profileError) {
    return { success: false, error: "Failed to check existing profile by email." };
  }

  if (existingProfile?.id) {
    const { data: authUserData, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(existingProfile.id);

    if (authUserError || !authUserData.user) {
      return {
        success: false,
        error: "Profile exists but linked auth account could not be verified.",
      };
    }

    return {
      success: true,
      data: {
        userId: existingProfile.id,
        profileCreated: false,
        verificationEmailSent: false,
      },
    };
  }

  const existingAuthLookup = await findAuthUserByEmail(normalizedEmail);
  if (existingAuthLookup.error) {
    return { success: false, error: "Failed to validate auth user by email." };
  }

  if (existingAuthLookup.user?.id) {
    const profileResult = await ensureUserProfile({
      userId: existingAuthLookup.user.id,
      email: normalizedEmail,
      fullName,
      phone: params.phone,
    });

    if (!profileResult.success) {
      return { success: false, error: profileResult.error };
    }

    return {
      success: true,
      data: {
        userId: existingAuthLookup.user.id,
        profileCreated: profileResult.profileCreated,
        verificationEmailSent: false,
      },
    };
  }

  const signUpResult = await supabaseAdmin.auth.signUp({
    email: normalizedEmail,
    password: generateTemporaryPassword(),
    options: {
      data: {
        full_name: fullName || null,
        phone: params.phone || null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm?next=/create-password`,
    },
  });

  if (signUpResult.error || !signUpResult.data.user?.id) {
    return {
      success: false,
      error: signUpResult.error?.message || "Failed to create auth user for this order.",
    };
  }

  const createdUserId = signUpResult.data.user.id;
  const profileResult = await ensureUserProfile({
    userId: createdUserId,
    email: normalizedEmail,
    fullName,
    phone: params.phone,
  });

  if (!profileResult.success) {
    return { success: false, error: profileResult.error };
  }

  return {
    success: true,
    data: {
      userId: createdUserId,
      profileCreated: true,
      verificationEmailSent: true,
    },
  };
}

function getDownloadTitle(apartmentType?: string) {
  const titleMap: Record<string, string> = {
    studio: "Studio Household Cleaning Routine",
    apartment: "Apartment Household Cleaning Routine",
    bungalow: "Bungalow Household Cleaning Routine",
    "duplex-terrace": "Duplex/Terrace Household Cleaning Routine",
    "duplex-balcony": "Duplex with Balcony Household Cleaning Routine",
    "infant-recipe": "Infant Recipe Plan",
  };

  return apartmentType ? titleMap[apartmentType] || "Purchased Package" : "Purchased Package";
}

async function upsertPurchasedDownload(params: {
  reference: string;
  email: string;
  apartmentType?: string;
  paymentVerified: boolean;
  amount?: number;
}) {
  try {
    const { data: profile } = await supabaseAdmin
      .from("users_profile")
      .select("id")
      .eq("email", params.email)
      .maybeSingle();

    const packageUrl = `/download/${params.reference}`;
    const payload = {
      user_id: profile?.id || null,
      email: params.email,
      reference: params.reference,
      title: getDownloadTitle(params.apartmentType),
      package_url: packageUrl,
      payment_verified: params.paymentVerified,
      amount: params.amount ?? 0,
    };

    const { error } = await supabaseAdmin
      .from("purchased_downloads")
      .upsert(payload, { onConflict: "reference" });

    if (error) {
      console.error("Failed to upsert purchased download:", error);
    }
  } catch (error) {
    console.error("Unexpected error upserting purchased download:", error);
  }
}

export async function createOrder(orderData: {
  reference: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  apartmentType: string;
  orderType: string;
  deliveryAddress: string;
  landmark: string;
  amount: number;
  authUserId?: string;
}) {
  try {
    const resolvedUser = await resolveOrderUser({
      email: orderData.email,
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      phone: orderData.phone,
      authUserId: orderData.authUserId,
    });

    if (!resolvedUser.success) {
      return {
        success: false,
        error: resolvedUser.error || "Unable to prepare user profile for this order.",
      };
    }

    // Map camelCase properties to snake_case column names
    const dbOrderData: Record<string, unknown> = {
      reference: orderData.reference,
      email: orderData.email.trim().toLowerCase(),
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      phone: orderData.phone,
      state: orderData.state,
      apartment_type: orderData.apartmentType,
      order_type: orderData.orderType,
      delivery_address: orderData.deliveryAddress,
      landmark: orderData.landmark,
      amount: orderData.amount,
      status: "pending", // Default status
    };

    if (resolvedUser.data?.userId) {
      dbOrderData.user_id = resolvedUser.data.userId;
    }

    let { error } = await supabaseAdmin.from("orders").insert([dbOrderData]);

    // If orders.user_id is not yet present in this environment, fallback gracefully.
    if (error && /(user_id|column.*user_id|schema cache)/i.test(error.message)) {
      const { user_id, ...orderWithoutUserId } = dbOrderData;
      const fallbackResult = await supabaseAdmin
        .from("orders")
        .insert([orderWithoutUserId]);
      error = fallbackResult.error;
    }

    if (error) {
      console.error("Error creating order:", error);

      if (error.code === "PGRST205") {
        return {
          success: false,
          error:
            "Orders table is missing in Supabase (public.orders). Run database/create-orders-table.sql in your Supabase SQL editor, then retry.",
        };
      }

      return { success: false, error: error.message };
    }

    return {
      success: true,
      profileCreated: Boolean(resolvedUser.data?.profileCreated),
      verificationEmailSent: Boolean(resolvedUser.data?.verificationEmailSent),
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

// Update the verifyPayment function to handle infant recipe plans
export async function verifyPayment(reference: string) {
  try {
    console.log("Verifying payment for reference:", reference);

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Paystack API error:", errorData);
      throw new Error(errorData.message || "Failed to verify payment");
    }

    const data = await response.json();
    console.log("Paystack verification response:", data);

    // Update order status in database
    if (data.status === true) {
      const status = data.data.status === "success" ? "success" : "failed";
      console.log(`Updating order status to ${status}`);

      // Get order details to check if it's a download order
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("order_type, email, apartment_type, landmark, amount")
        .eq("reference", reference)
        .maybeSingle(); // Use maybeSingle instead of single to handle case where no order is found

      if (orderError) {
        console.error("Error fetching order details:", orderError);
        // Continue with the process even if we can't determine the order type
      }

      // Update the order status if an order was found
      if (orderData) {
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ status })
          .eq("reference", reference);

        if (error) {
          console.error("Error updating order status:", error);
          return { success: false, error: error.message };
        }

        // Revalidate the orders page if it exists
        revalidatePath("/orders");
      }

      // For subscription orders, create access token immediately
      if (orderData?.order_type === "subscription" && status === "success") {
        const email = orderData.email || data.data.customer.email;
        const accessResult = await createSubscriptionAccess(email, reference);

        if (accessResult.success) {
          return {
            success: true,
            data,
            orderData,
            redirectUrl: `/subscription/dashboard?token=${accessResult.token}`,
          };
        }
      }

      // If this reference belongs to an infant recipe purchase (no order record), update its status and redirect to dashboard
      const { data: infantPurchase } = await supabaseAdmin
        .from("infant_recipes_purchases")
        .select("pack_type")
        .eq("purchase_reference", reference)
        .maybeSingle();

      const isGuestCheckout = Boolean(data?.data?.metadata?.is_guest_checkout);

      if (status === "success" && infantPurchase) {
        await updateInfantRecipePurchaseStatus(
          reference,
          reference,
          "completed",
        );
        const redirectUrl = isGuestCheckout
          ? `/services/infant-recipes?guestSuccess=1&reference=${reference}`
          : "/dashboard/onetime-infant-toddler";
        console.log(
          "Infant recipe purchase verified. Redirecting to:",
          redirectUrl,
        );
        return {
          success: true,
          data,
          orderData,
          redirectUrl,
        };
      }

      // For download orders, redirect to download page instead of success page
      const isDownloadOrder = orderData?.order_type === "download";
      const isSubscriptionOrder = orderData?.order_type === "subscription";
      const isInfantRecipeOrder = orderData?.apartment_type === "infant-recipe";

      if (orderData?.order_type === "download" && orderData?.email) {
        await upsertPurchasedDownload({
          reference,
          email: orderData.email,
          apartmentType: orderData.apartment_type,
          paymentVerified: status === "success",
          amount: orderData.amount ?? 0,
        });
      }

      // Determine the appropriate redirect URL
      let redirectUrl = `/payment/failed?reference=${reference}`;
      if (status === "success") {
        if (isDownloadOrder) {
          // Always include preferences for infant recipe plans
          const preferencesParam = isInfantRecipeOrder
            ? `?preferences=${orderData.landmark || ""}`
            : "";
          redirectUrl = `/download/${reference}${preferencesParam}`;

          // Add extra logging for infant recipe plans
          if (isInfantRecipeOrder) {
            console.log(
              "Infant recipe plan detected, redirecting to:",
              redirectUrl,
            );
            console.log("Order details:", {
              reference,
              email: orderData.email,
              preferences: orderData.landmark,
              apartmentType: orderData.apartment_type,
            });
          }
        } else if (isSubscriptionOrder) {
          redirectUrl = `/subscription?email=${orderData?.email || data.data.customer.email}&reference=${reference}`;
        } else {
          redirectUrl = `/payment/success?reference=${reference}`;
        }
      }

      // Log the redirect URL for debugging
      console.log(
        "Payment verification successful. Redirecting to:",
        redirectUrl,
      );

      // Return success with redirect URL
      return {
        success: true,
        data,
        orderData,
        redirectUrl,
      };
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Error verifying payment:", error);
    return { success: false, error: errorMessage };
  }
}

// Create a new function to handle subscription payments directly
export async function handleSubscriptionPayment(
  reference: string,
  email: string,
) {
  try {
    // First, verify the payment
    const paymentResult = await verifyPayment(reference);

    if (!paymentResult.success) {
      return { success: false, error: paymentResult.error };
    }

    if (paymentResult.data?.data?.status !== "success") {
      return { success: false, error: "Payment was not successful" };
    }

    // Check if an order exists for this reference
    const { data: existingOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    // If no order exists, create one
    if (!existingOrder && !orderError) {
      // Extract customer data from Paystack response
      const customer = paymentResult.data.data.customer;
      const amount = paymentResult.data.data.amount / 100; // Convert from kobo to naira

      // Create a new order
      const orderData = {
        reference,
        email: email || customer.email,
        firstName: customer.first_name || "Subscriber",
        lastName: customer.last_name || "User",
        phone: customer.phone || "",
        state: "",
        apartmentType: "apartment",
        orderType: "subscription",
        deliveryAddress: "",
        landmark: "",
        amount,
        status: "success",
      };

      // Insert the order directly with success status
      const { error } = await supabaseAdmin.from("orders").insert([
        {
          reference: orderData.reference,
          email: orderData.email,
          first_name: orderData.firstName,
          last_name: orderData.lastName,
          phone: orderData.phone,
          state: orderData.state,
          apartment_type: orderData.apartmentType,
          order_type: orderData.orderType,
          delivery_address: orderData.deliveryAddress,
          landmark: orderData.landmark,
          amount: orderData.amount,
          status: orderData.status,
        },
      ]);

      if (error) {
        console.error("Error creating subscription order:", error);
        return {
          success: false,
          error: "Failed to create subscription record",
        };
      }
    }

    // Create subscription access token
    const accessResult = await createSubscriptionAccess(email, reference);

    if (!accessResult.success) {
      return { success: false, error: accessResult.error };
    }

    return {
      success: true,
      token: accessResult.token,
      redirectUrl: `/subscription/dashboard?token=${accessResult.token}`,
    };
  } catch (error) {
    console.error("Error handling subscription payment:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
