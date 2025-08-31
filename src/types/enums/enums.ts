export enum OrderStatus {
  BASKET = "BASKET",
  PREORDER_PLACED = "PREORDER_PLACED",
  AWAITING_TAX = "AWAITING_TAX",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  SENT_TO_AMAZON = "SENT_TO_AMAZON",
  COMPLETED = "COMPLETED",
  SHIPPING_ADDRESS_REFUSED = "SHIPPING_ADDRESS_REFUSED",
  PRODUCT_UNAVAILABLE = "PRODUCT_UNAVAILABLE",
  ERROR = "ERROR",
  INSUFFICIENT_ZMA_BALANCE = "INSUFFICIENT_ZMA_BALANCE",
  RETURNED_TO_AMAZON = "RETURNED_TO_AMAZON",
  TAX_PAYMENT_CONFIRMING = "TAX_PAYMENT_CONFIRMING",
  PREORDER_PAYMENT_CONFIRMING = "PREORDER_PAYMENT_CONFIRMING",
  TAX_PENDING = "TAX_PENDING",
  TAX_FAILED = "TAX_FAILED",
}
export const OrderTableStatus = {
  //  BASKET: { value: 'BASKET', description: 'Basket' },
  PREORDER_PLACED: {
    value: "PREORDER_PLACED",
    description: "Pre-Order Placed",
    tooltip_text:
      "Your Pre Order has arrived in our systems and we are processing it. ",
  },
  //  AWAITING_TAX: { value: 'AWAITING_TAX', description: 'Waiting Tax', tooltip_text: 'Pre Order placed' },
  ORDER_CONFIRMED: {
    value: "ORDER_CONFIRMED",
    description: "Order Confirmed",
    tooltip_text:
      "Your Order has been successfully confirmed and is being sent to Amazon",
  },
  SENT_TO_AMAZON: {
    value: "SENT_TO_AMAZON",
    description: "Sent to Amazon",
    tooltip_text: "Your Order is sent to Amazon",
  },
  SHIPPING_ADDRESS_REFUSED: {
    value: "SHIPPING_ADDRESS_REFUSED",
    description: "Shipping Address Refused",
    tooltip_text:
      "Your Pre Order has been rejected because the address you specified does not appear to be correct.",
  },
  PRODUCT_UNAVAILABLE: {
    value: "PRODUCT_UNAVAILABLE",
    description: "Product Unavailable",
    tooltip_text:
      "Your Pre Order has been rejected because the product is no longer available on the store",
  },
  ERROR: {
    value: "ERROR",
    description: "Error",
    tooltip_text: "Pre Order placed",
  },
  //INSUFFICIENT_ZMA_BALANCE: { value: 'INSUFFICIENT_ZMA_BALANCE', description: 'Insufficient ZMA Balance', tooltip_text: 'Pre Order placed' },
  //RETURNED_TO_AMAZON: { value: 'RETURNED_TO_AMAZON', description: 'Returned to Amazon' },
  TAX_PAYMENT_CONFIRMING: {
    value: "TAX_PAYMENT_CONFIRMING",
    description: "Tax Payment Confirming",
    tooltip_text: "Pre Order placed",
  },
  PREORDER_PAYMENT_CONFIRMING: {
    value: "PREORDER_PAYMENT_CONFIRMING",
    description: "Pre-order Payment Confirming",
    tooltip_text: "Your Pre Order is being confirmed in the blockchain",
  },
};

export const CheckOutTableStatus = {
  AWAITING_PAYMENT: { value: "AWAITING_PAYMENT", description: "Pay order" },
  AWAITING_TAX: {
    value: "AWAITING_TAX",
    description: "Submitted for Bid",
    tooltip_text: "waiting for a trusted Dropper in your area to accept it",
  },
  PLACING_PREORDER: {
    value: "PLACING_PREORDER",
    description: "Placing pre-order...",
    tooltip_text:
      "We are waiting for the first dropper to take charge of your order",
  },
};
export enum OrderStatusSteps {
  PLACING_ORDER = "PLACING_ORDER",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  ORDER_RECEIVED = "ORDER_RECEIVED",
  ERROR = "ERROR",
}
export enum OrderSteps {
  WAITING_PAYMENT = "WAITING_PAYMENT",
  UPDATING_LAST_DATA = "UPDATING_LAST_DATA",
  OPERATION_COMPLETED = "OPERATION_COMPLETED",
}
export enum ReturnStatus {
  CREATED = "CREATED",
  SENT_TO_AMAZON = "SENT_TO_AMAZON",
  RETURNED = "RETURNED",
  CANCELED = "CANCELED",
}
export enum ReturnSteps {
  WAITING_PAYMENT = "WAITING_PAYMENT",
  CREATING_RETURN = "CREATING_RETURN",
  PLACING_RETURN_ON_AMAZON = "PLACING_RETURN_ON_AMAZON",
  UPDATING_LAST_DATA = "UPDATING_LAST_DATA",
  OPERATION_COMPLETED = "OPERATION_COMPLETED",
}
export enum ReturnStatusSteps {
  PLACING_RETURN = "PLACING_RETURN",
  RETURN_PLACED = "RETURN_PLACED",
  RETURNED = "RETURNED",
  ERROR = "ERROR",
}
export enum PaymentEndPoint {
  SINLGE_PRE_ORDER = "/api/payment/payBasket",
  MULTI_PRE_ORDER = "/api/payment/payMultiBasket",
  SUBSCRIPTION = "/api/payment/paySubscription",
  TAX_PAYMENT = "/api/payment/payTaxes",
}
export enum ScraperParser {
  OXYLABS = "OXYLABS",
  RAINFOREST = "RAINFOREST",
}
export enum CustomerType {
  CONSUMER = "CONSUMER",
  BUSINESS = "BUSINESS",
}
