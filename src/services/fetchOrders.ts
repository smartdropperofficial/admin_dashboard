// lib/fetchOrders.ts
import { OrdersSB } from "@/types/supabase/orders";

export async function fetchOrders(): Promise<OrdersSB[]> {
  console.log("🌐 fetchOrders: Making API call to /api/getOrders");

  try {
    const res = await fetch("/api/getOrders");
    console.log("📡 API Response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API Error response:", errorText);

      try {
        const { error } = JSON.parse(errorText);
        throw new Error(error || `HTTP ${res.status}: ${res.statusText}`);
      } catch (parseError) {
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
    }

    const responseData = await res.json();
    console.log("📦 API Success response:", responseData);

    const orders = responseData.orders || [];
    console.log("📋 Extracted orders:", {
      count: orders.length,
      sample: orders[0],
      statuses: orders.map((o: any) => o.status),
    });

    return orders;
  } catch (networkError) {
    console.error("🚫 Network/Parse error:", networkError);
    throw networkError;
  }
}
