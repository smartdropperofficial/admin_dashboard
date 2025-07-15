import { useEffect, useState, useMemo } from "react";
import { fetchOrders } from "@/services/fetchOrders";
import type { OrderSB } from "@/types/supabase/orders";

type OrdersByStatus = Record<string, OrderSB[]>;

export function useOrdersNoQuery() {
  const [orders, setOrders] = useState<OrderSB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchOrders(); // tua funzione fetch esistente
        console.log("🚀 ~ data:", data);
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const ordersByStatus: OrdersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      const status = order.status || "unknown";
      if (!acc[status]) acc[status] = [];
      acc[status].push(order);
      return acc;
    }, {} as OrdersByStatus);
  }, [orders]);

  return { orders, ordersByStatus, loading, error };
}
