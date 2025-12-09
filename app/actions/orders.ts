"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: "pending" | "success" | "failed") {
  try {
    if (!orderId) {
      return { success: false, error: "Order ID is required" }
    }

    // Check if order exists first
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .single()

    if (checkError) {
      console.error("Error checking order existence:", checkError)
      return {
        success: false,
        error: checkError.message || "Failed to find order",
      }
    }

    if (!existingOrder) {
      return { success: false, error: "Order not found" }
    }

    // Update the order status
    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return {
        success: false,
        error: error.message || "Failed to update order status",
      }
    }

    // Revalidate the orders pages
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating order status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getOrderStats() {
  try {
    // Get all orders
    const { data: orders, error } = await supabaseAdmin.from("orders").select("status, amount")

    if (error) {
      console.error("Error fetching orders for stats:", error)
      return { success: false, error: error.message }
    }

    // Calculate stats
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      success: orders.filter((o) => o.status === "success").length,
      failed: orders.filter((o) => o.status === "failed").length,
      total_revenue: orders.filter((o) => o.status === "success").reduce((sum, order) => sum + (order.amount || 0), 0),
    }

    return { success: true, stats }
  } catch (error) {
    console.error("Error calculating order stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

