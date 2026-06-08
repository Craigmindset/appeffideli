"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MailCheck, ShieldCheck } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf3,_#eff6ff_45%,_#ffffff_80%)] px-4 py-10 sm:py-14 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white/95 border border-slate-200 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.35)] p-6 sm:p-10">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Account Created Successfully
          </h1>
          <p className="text-slate-600">
            Check your email and click the verification link before signing in.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <MailCheck className="h-5 w-5 text-slate-700 mt-0.5" />
            <div className="space-y-1.5 text-sm text-slate-700">
              <p>We sent a verification email to your registered address.</p>
              <p>If you cannot find it, check Promotions or Spam.</p>
              <p>You can only log in after verification is complete.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-500">
          Redirecting to login in 10 seconds...
        </div>

        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
