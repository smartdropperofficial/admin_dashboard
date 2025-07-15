// hooks/useOrdersNoQuery.ts
import { useEffect, useState } from "react";
import { fetchOrders } from "@/services/fetchOrders";
import type { OrderSB } from "@/types/supabase/orders";

export function useOrdersNoQuery() {
  const [orders, setOrders] = useState<OrderSB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchOrders(); // ⬅️ tua funzione già esistente
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true; // evita setState dopo unmount
    };
  }, []);

  return { orders, loading, error };
}
