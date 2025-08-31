import { useEffect, useState, useMemo } from "react";
import { fetchOrders } from "@/services/fetchOrders";
import type { OrdersSB } from "@/types/supabase/orders";

type OrdersByStatus = Record<string, OrdersSB[]>;

export function useOrdersNoQuery() {
  const [orders, setOrders] = useState<OrdersSB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log("🔄 Starting fetch orders...");

        const data = await fetchOrders();
        console.log("🚀 ~ fetchOrders result:", {
          isArray: Array.isArray(data),
          length: data?.length || 0,
          sampleData: data?.[0],
          allData: data,
        });

        if (!cancelled) {
          setOrders(data || []); // 👈 Fallback to empty array
          console.log("✅ Orders set in state:", data?.length || 0);
        }
      } catch (e) {
        console.error("❌ Error fetching orders:", e);
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log("🏁 Loading complete");
        }
      }
    })();

    return () => {
      cancelled = true;
      console.log("🧹 useOrdersNoQuery cleanup");
    };
  }, []);

  const ordersByStatus: OrdersByStatus = useMemo(() => {
    console.log("🔄 Computing ordersByStatus with", orders.length, "orders");

    const result = orders.reduce((acc, order) => {
      const status = order.status || "unknown";
      if (!acc[status]) acc[status] = [];
      acc[status].push(order);
      return acc;
    }, {} as OrdersByStatus);

    console.log("📊 Orders grouped by status:", result);
    return result;
  }, [orders]);

  return { orders, ordersByStatus, loading, error };
}
