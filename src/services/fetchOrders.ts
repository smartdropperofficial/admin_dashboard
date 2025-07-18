// lib/fetchOrders.ts
import { OrdersSB } from "@/types/supabase/orders";

export async function fetchOrders(): Promise<OrdersSB[]> {
  const res = await fetch("/api/getOrders");

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch orders");
  }

  const { orders } = await res.json();
  return orders;
}
