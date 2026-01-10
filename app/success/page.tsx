"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import lottie from "lottie-web";

export default function SuccessPage() {
  const router = useRouter();
  const animationContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Lottie animation
    if (animationContainer.current) {
      const animation = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/Cooking.json",
      });

      return () => animation.destroy();
    }
  }, []);

  useEffect(() => {
    // Redirect to login page after 10 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-xl p-6 text-center space-y-4 mt-18">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900">
              Account Created Successfully! 🎉
            </h2>

            <p className="p-4 text-center text-gray-600">
              {" "}
              A verification link has been sent to your email address.
            </p>
          </div>

          {/* Lottie Animation */}
          <div
            ref={animationContainer}
            className="w-full h-80 mx-auto -mt-2"
          ></div>

          {/* Verification Message */}

          {/* Redirect Notice - COMMENTED OUT */}
          {/* Redirect Notice */}
          <div className="text-sm text-gray-500">
            <p>Redirecting to login page in 10 seconds...</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full animate-progress"
                style={{
                  animation: "progress 10s linear forwards",
                }}
              ></div>
            </div>
          </div>

          {/* Manual Login Link */}
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center  px-8 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 180s linear forwards;
        }
      `}</style>
    </div>
  );
}
