// lib/fetchOrders.ts
import { OrderSB } from "@/types/supabase/orders";

export async function fetchOrders(): Promise<OrderSB[]> {
  const res = await fetch("/api/orders");

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch orders");
  }

  const { orders } = await res.json();
  return orders;
}
