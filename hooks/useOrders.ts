// hooks/useOrders.ts
import { useQuery } from "@tanstack/react-query";
import { fetchOrders } from "@/services/fetchOrders";
import { OrderSB, OrderStatus } from "@/types/supabase/orders";
export function useOrders() {
  return useQuery<OrderSB[], Error>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

export function categorizeOrders(orders: OrderSB[]) {
  return {
    preOrders: orders.filter((o) => o.status === OrderStatus.CREATED),
    waitingTaxOrders: orders.filter(
      (o) => o.status === OrderStatus.WAITING_TAX
    ),
    waitingPaymentOrders: orders.filter(
      (o) => o.status === OrderStatus.WAITING_CONFIRMATION
    ),
    confirmedOrders: orders.filter(
      (o) => o.status === OrderStatus.ORDER_CONFIRMED
    ),
    sentToAmazonOrders: orders.filter(
      (o) => o.status === OrderStatus.SENT_TO_AMAZON
    ),
    errorOrders: orders.filter((o) =>
      [
        OrderStatus.SHIPPING_ADDRESS_REFUSED,
        OrderStatus.PRODUCT_UNAVAILABLE,
        OrderStatus.INSUFFICIENT_ZMA_BALANCE,
        "ERROR",
      ].includes(o.status!)
    ),
  };
}
