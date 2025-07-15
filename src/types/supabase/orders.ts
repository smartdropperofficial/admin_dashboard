import { OrderStatus } from "../enums/enums";

export interface OrderSB {
  order_id?: string;
  created_at?: string;
  wallet_address?: string;
  country?: string;
  status?: OrderStatus;
  shipping_info?: ShippingInfoSB;
  products?: ProductSB[];
  request_id?: string;
  payment_tx?: string;
  unlock_tx?: string;
  return_tx?: string;
  creation_tx?: string;
  tax_request_id?: string;
  tax_amount?: number;
  subtotal_amount?: number;
  total_amount?: number;
  total_amount_paid?: number;
  pre_order_payment_tx?: string;
  pre_order_amount_paid_tx?: string;
  tax_payment_tx?: string;
  previous_status?: string[];
  shipping_amount?: number;
  refund?: RefundSB[];
  user_id?: number | null | undefined;
  commission?: number;
  email?: string;
  currency?: string;
  retailer?: string;
  ticket_id?: string; // Aggiunta dei ticket di supporto
  pre_order_amount?: number;
  preorder_withdrawn_tx?: string;
  order_taxes_withdrawn_tx?: string;
  pre_order_amount_paid?: number;
  error?: string;
  modified_at?: string;
}

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
