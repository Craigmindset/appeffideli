"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

type HireMaidContentProps = {
  onProceed: () => void;
};

export function HireMaidContent({ onProceed }: HireMaidContentProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-xl border bg-slate-100 aspect-[4/3]">
              <Image
                src="/placeholder.svg?height=720&width=960"
                alt="Professional maid service"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Need a Trusted Maid?
            </h1>
            <p className="text-slate-600 leading-relaxed">
              We help you find reliable, vetted home support tailored to your
              family needs. Share your preferences and we will match you with a
              suitable candidate.
            </p>

            <ul className="space-y-2 text-sm text-slate-700">
              <li>Screened and verified profiles</li>
              <li>Custom preference matching</li>
              <li>Fast onboarding support</li>
            </ul>

            <Button
              size="lg"
              onClick={onProceed}
              className="bg-[#174969] hover:bg-[#0f3349] text-white"
            >
              Proceed to Request Form
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
