import {
  logUserActivity,
  type ActivityType,
} from "@/app/actions/user-activities";

/**
 * Helper functions to log common user activities
 */

export async function logDownloadActivity(fileName: string, packType?: string) {
  return await logUserActivity("download", `Downloaded ${fileName}`, {
    file_name: fileName,
    pack_type: packType,
  });
}

export async function logSubscriptionActivity(
  action: string,
  planType: string,
) {
  return await logUserActivity(
    "subscription",
    `${action} ${planType} subscription`,
    { action, plan_type: planType },
  );
}

export async function logPurchaseActivity(packType: string, amount: number) {
  return await logUserActivity("purchase", `Purchased ${packType} pack`, {
    pack_type: packType,
    amount,
  });
}

export async function logMealPlanActivity(action: string) {
  return await logUserActivity("meal_plan", action, {
    action_type: "meal_plan_interaction",
  });
}

export async function logPaymentActivity(
  status: string,
  amount: number,
  reference?: string,
) {
  return await logUserActivity("payment", `Payment ${status}`, {
    status,
    amount,
    reference,
  });
}

export async function logLoginActivity() {
  return await logUserActivity("login", "Signed in to dashboard", {
    login_time: new Date().toISOString(),
  });
}

export async function logProfileUpdate(field: string) {
  return await logUserActivity("profile_update", `Updated ${field}`, {
    updated_field: field,
  });
}
