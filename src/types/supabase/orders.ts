import { OrderStatus } from "../enums/enums";

export type OrdersSB = {
  id: number;
  created_at: string | null;
  wallet_address: string;
  status: OrderStatus;
  order_id: string;
  shipping_info: ShippingInfoSB;
  request_id: string | null;
  pre_order_payment_tx: string | null;
  tax_request_id: string | null;
  tax_amount: number | null;
  total_amount: number | null;
  subtotal_amount: number | null;
  amount_paid: number | null;
  shipping_amount: number | null;
  products: ProductSB[];
  tracking: string | null;
  retailer: "AMAZON" | string | null;
  total_items: number | null;
  zone: string | null;
  currency: string | null;
  custom_error: string | null;
  commission: number | null;
  email: string | null;
  read: boolean | null;
  pre_order_amount: number;
  tax_order_creation_tx: string | null;
  tax_order_amount: number | null;
  tax_order_payment_tx: string | null;
  modified_at: string | null;
  wrapper_id: string | null;
  country: string | null;
  crypto_type: "BTC" | "ETH" | "XMR" | string | null; // aggiusta con i valori reali di enum se necessario
  preorder_payment_timestamp: string | null;
  tax_payment_timestamp: string | null;
};

export interface ShippingInfoSB {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  zip_code: string;
  city: string;
  state: string;
  phone_number: string;
  email: string;
}

export interface ProductSB {
  asin: string;
  image: string;
  price: number;
  symbol: string;
  title: string;
  url: string;
  quantity: number;
  isReturned?: number;
}

export interface RefundSB {
  asin: string;
  transaction: string;
}
