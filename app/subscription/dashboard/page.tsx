import { redirect } from "next/navigation"
import { SubscriptionDashboard } from "@/components/subscription-dashboard"
import { verifySubscriptionAccess, getSubscriptionStatus } from "@/app/actions/subscription"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const { token } = searchParams

  if (!token) {
    redirect("/subscription/login")
  }

  // Verify the token
  const accessResult = await verifySubscriptionAccess(token)
  if (!accessResult.success) {
    redirect("/subscription/login")
  }

  // Get subscription status
  const statusResult = await getSubscriptionStatus(token)
  if (!statusResult.success) {
    redirect("/subscription/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <SubscriptionDashboard
            token={token}
            email={statusResult.email}
            weeks={statusResult.weeks}
            images={statusResult.images}
            allDownloaded={statusResult.allDownloaded}
            subscriptionStatus={statusResult.subscriptionStatus}
            subscriptionEndDate={statusResult.subscriptionEndDate}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

