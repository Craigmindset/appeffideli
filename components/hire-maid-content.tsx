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

interface HireMaidContentProps {
  onProceed: () => void
}

export function HireMaidContent({ onProceed }: HireMaidContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleProceed = () => {
    setIsDialogOpen(false)
    onProceed()
  }

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Image */}
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2148789712.jpg-iMqejF5pyUPUtxn63xaEGOOzDbftXg.jpeg"
              alt="Professional house help in elegant attire"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Column - Content */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">You need a Maid?</h1>
            <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our professional maid service provides reliable, trustworthy, and experienced house help for your home. We
              carefully screen and train all our staff to ensure they meet the highest standards of cleanliness,
              professionalism, and reliability. Whether you need daily, weekly, or monthly help, we have flexible
              options to suit your needs.
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
                <div>Thoroughly vetted and background-checked staff</div>
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
            <Button type="button" className="mt-2 bg-[#174969] hover:bg-[#0f3349] text-white" onClick={handleProceed}>
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

