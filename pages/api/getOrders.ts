// /pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("[API] /api/orders called");

  // Only allow GET requests
  if (req.method !== "GET") {
    console.warn("[API] Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    console.log("[API] Supabase client initialized");

    const { data, error } = await supabase.from("orders").select("*");
    console.log("[API] Query executed: SELECT * FROM orders");
    console.log("[API] Query  data:", data);

    if (error) {
      console.error("[API] Error fetching orders:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch orders", details: error.message });
    }

    console.log(`[API] Orders fetched successfully. Count: ${data.length}`);
    return res.status(200).json({ orders: data });
  } catch (err: any) {
    console.error("[API] Unexpected server error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
}
