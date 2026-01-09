// A simple utility to test Paystack integration

export function testPaystackConfig() {
  // This function can be called from the browser console to test Paystack configuration
  if (typeof window === "undefined") return null;

  try {
    if (!window.PaystackPop) {
      console.error("PaystackPop is not available. Script may not be loaded.");
      return false;
    }

    // Test minimal configuration
    const testConfig = {
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      email: "test@example.com",
      amount: 5000, // 50 Naira in kobo
      currency: "NGN",
      ref: `test_${Date.now()}`,
      firstname: "Test",
      lastname: "User",
      phone: "08012345678",
      metadata: {
        custom_fields: [],
      },
      callback: (response: any) => {
        console.log("Test payment callback:", response);
      },
      onClose: () => {
        console.log("Test payment closed");
      },
    };

    console.log("Testing Paystack with minimal config");
    const handler = window.PaystackPop.setup(testConfig);

    // Don't actually open the iframe for this test
    return {
      success: true,
      message: "Paystack configuration is valid. Handler created successfully.",
    };
  } catch (error) {
    console.error("Paystack test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Add a global function to test from browser console
if (typeof window !== "undefined") {
  (window as any).testPaystack = testPaystackConfig;
}
