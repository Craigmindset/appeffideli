import type React from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  )
}

