"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { HireMaidContent } from "@/components/hire-maid-content"
import { HireMaidRequestForm } from "@/components/hire-maid-request-form"

export default function HireMaidPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        {showForm ? (
          <div className="container mx-auto px-4 py-8">
            <HireMaidRequestForm />
          </div>
        ) : (
          <HireMaidContent onProceed={() => setShowForm(true)} />
        )}
      </main>
      <Footer />
    </div>
  )
}

