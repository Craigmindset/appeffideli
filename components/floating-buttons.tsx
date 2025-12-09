"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openWhatsApp = () => {
    // Replace with your actual WhatsApp number
    window.open("https://wa.me/+2348034567305", "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 md:hidden">
      <Button
        onClick={openWhatsApp}
        size="icon"
        className="h-12 w-12 rounded-full bg-[#174969] hover:bg-[#0f3349] text-white shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

