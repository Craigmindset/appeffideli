import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PaymentSuccessClient from "./payment-success-client";

function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Loading...
        </h2>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
