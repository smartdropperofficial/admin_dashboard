import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Crea il client Supabase
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  const { data: pendingOrders, error } = await supabase
    .from("orders")
    .select("id, order_id, products, shipping_info")
    .eq("status", "TAX_PENDING");

  if (error || !pendingOrders?.length) {
    console.log("✅ Nessun ordine da processare.");
    return new Response("No orders to process", { status: 200 });
  }

  for (const order of pendingOrders) {
    try {
      if (!isValidOrder(order)) {
        console.warn(`⚠️ Ordine ${order.order_id} incompleto, saltato.`);
        await supabase
          .from("orders")
          .update({
            status: "TAX_FAILED",
            custom_error: "Shipping info incompleta o prodotti mancanti",
            modified_at: new Date().toISOString(),
          })
          .eq("id", order.id);
        continue;
      }

      const zincOrderObject = generateTaxOrderObject(order);

      const headers = new Headers();
      headers.append(
        "Authorization",
        `Basic ${btoa(`${Deno.env.get("ZINC_API_KEY")!}:`)}`
      );
      headers.append("Content-Type", "application/json");

      const zincRes = await fetch(`${Deno.env.get("ZINC_API_URL")}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(zincOrderObject),
      });

      const zincData = await zincRes.json();

      if (zincData._type === "error") {
        console.warn(
          `❌ Zinc error per ordine ${order.order_id}: ${zincData.message}`
        );
        await supabase
          .from("orders")
          .update({
            status: "TAX_FAILED",
            custom_error: zincData.message || "Errore Zinc",
            modified_at: new Date().toISOString(),
          })
          .eq("id", order.id);
        continue;
      }

      console.log(
        `✅ Ordine ${order.order_id} inviato a Zinc. Request ID: ${zincData.request_id}`
      );
      await supabase
        .from("orders")
        .update({
          status: "AWAITING_TAX",
          tax_order_creation_tx: zincData.request_id,
          tax_request_id: zincData.request_id,
          modified_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    } catch (err) {
      console.error("❌ Errore nell'ordine ID", order.order_id, err);
      await supabase
        .from("orders")
        .update({
          status: "TAX_FAILED",
          custom_error: String(err),
          modified_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }
  }

  return new Response("Zinc orders processed", { status: 200 });
});

function isValidOrder(order: any): boolean {
  const s = order.shipping_info;
  return (
    order.products?.length &&
    s?.first_name &&
    s?.last_name &&
    s?.address_line1 &&
    s?.zip_code &&
    s?.city &&
    s?.state &&
    s?.country &&
    s?.phone_number
  );
}

function generateTaxOrderObject(order: {
  order_id: string;
  products: any[];
  shipping_info: any;
}) {
  return {
    idempotency_key: order.order_id,
    retailer: "amazon",
    addax: true,
    products: order.products,
    max_price: 0,
    shipping_address: {
      first_name: order.shipping_info.first_name,
      last_name: order.shipping_info.last_name,
      address_line1: order.shipping_info.address_line1,
      address_line2: order.shipping_info.address_line2,
      zip_code: order.shipping_info.zip_code,
      city: order.shipping_info.city,
      state: order.shipping_info.state,
      country: order.shipping_info.country,
      phone_number: order.shipping_info.phone_number,
    },
    webhooks: {
      request_succeeded: `${Deno.env.get("MAILER_WEBHOOK")}/request-succeeded`,
      request_failed: `${Deno.env.get("MAILER_WEBHOOK")}/request-failed`,
      tracking_obtained: `${Deno.env.get("MAILER_WEBHOOK")}/tracking`,
    },
    shipping: {
      order_by: "price",
      max_days: 10,
      max_price: 1000,
    },
    is_gift: false,
  };
}
