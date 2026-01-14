// Utility functions for Paystack integration

/**
 * Verifies a Paystack transaction
 * @param reference The transaction reference
 * @returns The transaction details
 */
export async function verifyPaystackTransaction(reference: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify transaction");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    throw error;
  }
}

/**
 * Cancels/disables a Paystack subscription
 * @param subscriptionCode The Paystack subscription code (SUB_xxx)
 * @param emailToken The email token for the subscription
 * @returns Success status
 */
export async function cancelPaystackSubscription(
  subscriptionCode: string,
  emailToken: string
) {
  try {
    const response = await fetch(
      "https://api.paystack.co/subscription/disable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: subscriptionCode,
          token: emailToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to cancel subscription on Paystack"
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error cancelling Paystack subscription:", error);
    throw error;
  }
}

/**
 * Fetches subscription details from Paystack
 * @param subscriptionIdOrCode The subscription ID or code
 * @returns Subscription details including email_token
 */
export async function getPaystackSubscription(subscriptionIdOrCode: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/subscription/${subscriptionIdOrCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch subscription details");
    }

    return data;
  } catch (error) {
    console.error("Error fetching Paystack subscription:", error);
    throw error;
  }
}

/**
 * Generates a unique reference for Paystack transactions
 * @returns A unique reference string
 */
export function generatePaystackReference() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  return `EFFIDELI_${random}_${timestamp}`;
}

// Add this function to calculate meal plan amounts
export function calculateMealPlanAmount(mealPlanType: string): number {
  const mealPlanPrices = {
    general: 25000,
    healthy: 35000,
    both: 50000,
  };

  return mealPlanPrices[mealPlanType as keyof typeof mealPlanPrices] || 25000;
}

// Update the calculateServiceAmount function to handle infant-recipe type

export function calculateServiceAmount(
  apartmentType:
    | "studio"
    | "apartment"
    | "bungalow"
    | "duplex-terrace"
    | "duplex-balcony"
    | "infant-recipe",
  orderType: "download" | "print-deliver" | "subscription"
) {
  // For subscription orders, the apartment type field is used to store the meal plan type
  if (orderType === "subscription") {
    return calculateMealPlanAmount(apartmentType);
  }

  // For infant recipe plans
  if (apartmentType === "infant-recipe") {
    return 50000; // ₦50,000 for infant recipe plans
  }

  const baseAmounts = {
    studio: 15000,
    apartment: 20000,
    bungalow: 25000,
    "duplex-terrace": 35000,
    "duplex-balcony": 30000,
  };

  const deliveryFee = orderType === "print-deliver" ? 9000 : 0;
  return baseAmounts[apartmentType as keyof typeof baseAmounts] + deliveryFee;
}
