import { supabaseAdmin } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function OrdersAdminPage() {
  try {
    // Simple data fetch without complex queries
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, reference, email, first_name, last_name, status, amount, created_at")
      .order("created_at", { ascending: false })

    // Handle database error
    if (error) {
      console.error("Database error:", error)
      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container py-10">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Orders Management</h1>
              <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Back to Admin
              </a>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Error Loading Orders</h2>
              <p>There was a problem loading orders. Please try again later.</p>
              <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
            </div>
          </main>
          <Footer />
        </div>
      )
    }

    // Calculate basic stats
    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter((o) => o.status === "pending").length || 0,
      success: orders?.filter((o) => o.status === "success").length || 0,
      failed: orders?.filter((o) => o.status === "failed").length || 0,
      total_revenue:
        orders?.filter((o) => o.status === "success").reduce((sum, order) => sum + (order.amount || 0), 0) || 0,
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Admin
            </a>
          </div>

          {/* Basic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Successful Orders</h3>
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <div className="text-2xl font-bold">₦{stats.total_revenue.toLocaleString()}</div>
            </div>
          </div>

          {/* Simple Orders Table */}
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Orders</h2>
            </div>
            <div className="p-4">
              {orders && orders.length === 0 ? (
                <p className="text-center py-4">No orders found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Reference</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{order.reference}</td>
                          <td className="p-2">
                            <div>{`${order.first_name} ${order.last_name}`}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </td>
                          <td className="p-2">₦{order.amount?.toLocaleString() || 0}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-2">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            <a
                              href={`/admin/orders/${order.id}`}
                              className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded border hover:bg-gray-200"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error:", error)

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Admin
            </a>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Something Went Wrong</h2>
            <p>An unexpected error occurred while loading orders.</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later or contact support.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
}

