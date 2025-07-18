import { useState } from "react";
import { OrdersSB as OrdersSB } from "@/types/supabase/orders";
// import { supabase } from "@/lib/supabaseClient";

type Status = "loading" | "success" | "error" | undefined;

export function useSendTaxRequests() {
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});

  const send = async (orders: OrdersSB[]) => {
    const updates: Record<string, Status> = {};
    orders.forEach((o) => (updates[o.order_id] = "loading"));
    setStatusMap((prev) => ({ ...prev, ...updates }));

    for (const order of orders) {
      try {
        const res = await fetch("/api/createTaxRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order }), // encrypt if needed
        });

        const data = await res.json();

        if (!data?.request_id) throw new Error("Missing request_id");

        // await supabase
        //   .from("orders")
        //   .update({ tax_request_id: data.request_id })
        //   .eq("order_id", order.order_id);

        setStatusMap((prev) => ({ ...prev, [order.order_id]: "success" }));
      } catch (err) {
        console.error("❌ Error for", order.order_id, err);
        setStatusMap((prev) => ({ ...prev, [order.order_id]: "error" }));
      }
    }
  };

  return { send, statusMap };
}
