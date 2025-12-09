import { SubscriptionLoginForm } from "@/components/subscription-login-form"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function SubscriptionLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container max-w-md mx-auto px-4">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Access Your Subscription</h1>
              <p className="text-muted-foreground">Enter your email to access your meal plan subscription</p>
            </div>

            <SubscriptionLoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

