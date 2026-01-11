"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();

      // Check if email exists in users_profile table
      const { data: profileCheck, error: checkError } = await supabase
        .from("users_profile")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        console.error("Database check error:", checkError);
        setError("An error occurred. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!profileCheck) {
        setError("No email match. Please signup to create an account.");
        setIsLoading(false);
        return;
      }

      // Email exists, store it and route to reset password page
      sessionStorage.setItem("reset_email", email);
      router.push("/reset-password");
    } catch (err) {
      console.error("Email check error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address to reset your password.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Checking..." : "Continue"}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
