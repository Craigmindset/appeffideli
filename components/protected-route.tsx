"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side route protection component
 * Use this in addition to server-side checks for enhanced security
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Prevent inspection bypass: continuously verify authentication
    const interval = setInterval(async () => {
      if (!loading && !user) {
        router.push("/login?session_expired=true");
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Prevent flash of content during loading
  if (loading) {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      )
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
