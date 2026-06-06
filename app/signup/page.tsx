import { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-blue-100">
          <p className="text-sm text-gray-600">Loading signup form...</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
