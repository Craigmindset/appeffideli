import type React from "react"
import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  // Basic layout with error handling
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container py-10">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  )

  try {
    // Simple data fetch without complex queries
    const { data, error } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).maybeSingle()

    // Handle database error
    if (error) {
      console.error("Database error:", error)
      return (
        <PageWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p>There was a problem loading this order. Please try again later.</p>
              <p className="text-sm text-muted-foreground mt-2">Error: {error.message}</p>
            </CardContent>
          </Card>
        </PageWrapper>
      )
    }

    // Handle not found
    if (!data) {
      return (
        <PageWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Order Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The order you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </PageWrapper>
      )
    }

    // Render basic order information without complex formatting
    return (
      <PageWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Reference</h3>
                <p>{data.reference}</p>
              </div>

              <div>
                <h3 className="font-medium">Status</h3>
                <p>{data.status}</p>
              </div>

              <div>
                <h3 className="font-medium">Customer</h3>
                <p>
                  {data.first_name} {data.last_name}
                </p>
                <p>{data.email}</p>
                <p>{data.phone}</p>
              </div>

              <div>
                <h3 className="font-medium">Order Details</h3>
                <p>Type: {data.order_type}</p>
                <p>Apartment: {data.apartment_type}</p>
                <p>Amount: ₦{data.amount?.toLocaleString() || 0}</p>
              </div>

              {data.delivery_address && (
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <p>{data.delivery_address}</p>
                  {data.landmark && <p>Landmark: {data.landmark}</p>}
                </div>
              )}

              <div>
                <h3 className="font-medium">Date</h3>
                <p>{new Date(data.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    )
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error:", error)

    return (
      <PageWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Something Went Wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p>An unexpected error occurred while loading this order.</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </PageWrapper>
    )
  }
}

