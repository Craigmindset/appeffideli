"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, ClipboardList, UtensilsCrossed, Baby, Home, ChevronLeft } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ServiceForm from "@/components/service-form"
import MealSubscriptionForm from "@/components/meal-subscription-form"
import InfantRecipeForm from "@/components/infant-recipe-form"
import { Button } from "@/components/ui/button"

export default function GetStarted() {
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const services = [
    {
      id: "household-chore",
      title: "Household Chore Routine Management",
      description: "Complete home management solutions including cleaning, maintenance, and organization.",
      icon: <ClipboardList className="h-6 w-6" />,
    },
    {
      id: "meal-planning",
      title: "Monthly Home Meal Subscription / Weekly Home Plan",
      description: "Customized meal planning services with weekly menu creation and grocery lists.",
      icon: <UtensilsCrossed className="h-6 w-6" />,
    },
    {
      id: "baby-menu",
      title: "6-Months to 1-Year Infant Recipe Plan",
      description: "Specialized baby food meal planning and nutritional guidance.",
      icon: <Baby className="h-6 w-6" />,
    },
  ]

  const onBack = () => {
    setSelectedService(null)
  }

  const renderForm = () => {
    switch (selectedService) {
      case "household-chore":
        return <ServiceForm onBack={onBack} />
      case "meal-planning":
        return <MealSubscriptionForm onBack={onBack} />
      case "baby-menu":
        return <InfantRecipeForm onBack={onBack} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container px-4 md:px-6 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          {selectedService && (
            <Button variant="ghost" className="text-gray-600 hover:text-blue-900 p-0 h-auto" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to services
            </Button>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 mb-4 whitespace-normal md:whitespace-nowrap">
              Get Started with Effideli
            </h1>
            <p className="text-lg text-gray-600">Choose a service to begin your journey to a better managed home.</p>
          </div>

          {!selectedService ? (
            <div className="grid gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    service.id === "household-chore"
                      ? "bg-blue-50/50 hover:bg-blue-50"
                      : service.id === "meal-planning"
                        ? "bg-green-50/50 hover:bg-green-50"
                        : "bg-purple-50/50 hover:bg-purple-50"
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{service.icon}</div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {service.title}
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            renderForm()
          )}
        </div>
      </div>
    </main>
  )
}

