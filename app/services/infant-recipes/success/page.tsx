"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Download, UserRoundPlus, LayoutDashboard, X } from "lucide-react";

export default function InfantRecipeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  const payload = useMemo(() => {
    const reference = searchParams.get("reference") || "";
    const firstName = searchParams.get("firstName") || "";
    const lastName = searchParams.get("lastName") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const isGuest = searchParams.get("isGuest") === "1";

    return { reference, firstName, lastName, email, phone, isGuest };
  }, [searchParams]);

  useEffect(() => {
    if (!payload.reference) {
      router.replace("/services/infant-recipes");
      return;
    }

    const timer = setTimeout(() => {
      setShowModal(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [payload.reference, router]);

  const handleDownload = () => {
    if (!payload.reference) return;
    window.open(
      `/api/download-pdf?reference=${encodeURIComponent(payload.reference)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCreateAccount = () => {
    const query = new URLSearchParams({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      reference: payload.reference,
    });
    router.push(`/signup?${query.toString()}`);
  };

  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f7f4,_#f5f7ff_40%,_#ffffff_75%)] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur shadow-[0_20px_60px_-20px_rgba(16,24,40,0.25)] overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f766e] via-[#0b7f6f] to-[#0b5e7a] px-6 py-8 sm:px-10 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/90">Payment Confirmed</p>
                <h1 className="text-2xl sm:text-3xl font-bold">Infant Recipe Purchase Successful</h1>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 space-y-6">
            <p className="text-slate-700 text-sm sm:text-base">
              Your purchase has been recorded in your account history. You can download now and re-download anytime from your dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Reference</p>
                <p className="font-semibold text-slate-900 break-all">{payload.reference}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                <p className="font-semibold text-slate-900">{fullName || "Effideli Customer"}</p>
                <p className="text-sm text-slate-600">{payload.email || ""}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0b645d]"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={() => router.push("/dashboard/onetime-infant-toddler")}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </button>
              {payload.isGuest && (
                <button
                  onClick={handleCreateAccount}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <UserRoundPlus className="h-4 w-4" />
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900">Your purchase is ready</h2>
            <p className="text-sm text-slate-600">Download your purchased file now, and access it later in your download history.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="w-full rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b645d]"
              >
                Download
              </button>
              {payload.isGuest ? (
                <button
                  onClick={handleCreateAccount}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Create Account
                </button>
              ) : (
                <button
                  onClick={() => router.push("/dashboard/onetime-infant-toddler")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
