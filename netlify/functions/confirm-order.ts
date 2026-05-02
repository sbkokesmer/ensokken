import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: "Method not allowed" };
  }

  try {
    const { session_id } = JSON.parse(event.body || "{}") as { session_id?: string };
    if (!session_id) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "session_id required" }) };
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return { statusCode: 404, headers: cors, body: JSON.stringify({ error: "order_id not found in session metadata" }) };
    }

    const isPaid = session.payment_status === "paid";
    const pi = session.payment_intent as Stripe.PaymentIntent | null;

    const updates: Record<string, any> = {
      payment_status: isPaid ? "paid" : session.payment_status === "unpaid" ? "pending" : "failed",
      stripe_payment_intent_id: typeof pi === "string" ? pi : pi?.id ?? null,
    };

    if (isPaid) {
      updates.status = "confirmed";
    }

    await supabase.from("orders").update(updates).eq("id", orderId);

    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ order, paid: isPaid }),
    };
  } catch (err: any) {
    console.error("confirm-order error:", err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err?.message ?? "Internal error" }),
    };
  }
};
