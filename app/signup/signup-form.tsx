"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/app/actions/auth";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const togglePassword = () => setShowPassword((v) => !v);

  const prefillFirstName = searchParams.get("firstName") || "";
  const prefillLastName = searchParams.get("lastName") || "";
  const prefillEmail = searchParams.get("email") || "";
  const prefillReference = searchParams.get("reference") || "";
  const hasPrefilledProfile =
    Boolean(prefillReference) &&
    Boolean(prefillFirstName) &&
    Boolean(prefillLastName) &&
    Boolean(prefillEmail);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const truncated = value.slice(0, 11);
    e.target.value = truncated;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const purchaseReference = formData.get("purchaseReference") as string;

    if (phone && phone.replace(/\D/g, "").length !== 11) {
      setError("Phone number must be 11 digits");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(
        email,
        password,
        firstName,
        lastName,
        phone,
        purchaseReference || undefined,
      );

      if (!result.success) {
        setError(result.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      router.push("/success");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded shadow">
        <div className="flex flex-col items-center gap-2">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Effideli Logo"
              width={60}
              height={60}
              className="h-14 w-auto cursor-pointer"
            />
          </Link>
          <h2 className="mt-2 text-center text-2xl md:text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm flex flex-col gap-4">
            {hasPrefilledProfile ? (
              <>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                  Completing account for <strong>{prefillFirstName} {prefillLastName}</strong> ({prefillEmail}).
                </div>
                <input name="firstName" type="hidden" value={prefillFirstName} />
                <input name="lastName" type="hidden" value={prefillLastName} />
                <input name="email" type="hidden" value={prefillEmail} />
                <input name="phone" type="hidden" value="" />
                <input name="purchaseReference" type="hidden" value={prefillReference} />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="sr-only">
                      First Name
                    </label>
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      defaultValue={prefillFirstName}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="sr-only">
                      Last Name
                    </label>
                    <input
                      id="last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      defaultValue={prefillLastName}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
                      +234
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      onInput={handlePhoneInput}
                      maxLength={11}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={prefillEmail}
                    className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </>
            )}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={22}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePassword}
                tabIndex={-1}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none p-2 mb-2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters.
              </p>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
