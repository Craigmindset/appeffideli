"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function HireMaidHero() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Column - Image */}
          <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-square order-2 lg:order-1">
            <Image
              src="/placeholder.svg?height=800&width=800"
              alt="Professional maid service"
              width={800}
              height={800}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-4 order-1 lg:order-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">You need a Maid?</h1>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our professional maid service provides thorough cleaning for your home. We handle everything from regular
              maintenance to deep cleaning, giving you more time to focus on what matters most. Our team of experienced
              and vetted cleaners ensures your home is spotless every time.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>Experienced and vetted professional cleaners</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>Flexible scheduling to fit your lifestyle</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>100% satisfaction guarantee</div>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-4 bg-[#174969] hover:bg-[#0f3349] text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              Request
            </Button>
          </div>
        </div>
      </div>

      {/* Request Dialog/Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Confirmation</DialogTitle>
            <DialogDescription>
              Thank you for your request. Please note, a non-refundable fee of ₦5000 will be required from you to
              process your request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // Here you can add additional logic for proceeding
                // For now, we'll just close the dialog
                setIsDialogOpen(false)
              }}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

