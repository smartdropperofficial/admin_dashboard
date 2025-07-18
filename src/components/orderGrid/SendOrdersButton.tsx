import * as React from "react";
import { OrdersSB } from "@/types/supabase/orders";
import { useSendTaxRequests } from "@/hooks/useSendTaxRequests";

export function SendOrdersButton({
  selectedOrders,
}: {
  selectedOrders: Record<string, GridRowSelectionModel>;
}) {
  const { send } = useSendTaxRequests();

  if (selectedOrders.length === 0) return null;

  return (
    <button
      onClick={() => send(selectedOrders)}
      style={{
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "4px 10px",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        marginLeft: "auto",
      }}
    >
      ➤ Send
    </button>
  );
}
