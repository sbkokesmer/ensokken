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

export const handler: Handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.warn("Webhook: missing signature or secret");
    return { statusCode: 400, body: "missing signature/secret" };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body || "", sig, secret);
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return { statusCode: 400, body: `Invalid signature: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        const isPaid = session.payment_status === "paid";
        await supabase
          .from("orders")
          .update({
            payment_status: isPaid ? "paid" : "pending",
            status: isPaid ? "confirmed" : "pending",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          })
          .eq("id", orderId);
        break;
      }

      case "checkout.session.expired": {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) break;
        await supabase
          .from("orders")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("id", orderId);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = stripeEvent.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;
        if (!orderId) break;
        await supabase
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", orderId);
        break;
      }

      case "charge.refunded": {
        const charge = stripeEvent.data.object as Stripe.Charge;
        const orderId = charge.metadata?.order_id;
        if (!orderId) break;
        await supabase
          .from("orders")
          .update({ payment_status: "refunded", status: "refunded" })
          .eq("id", orderId);
        break;
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return { statusCode: 500, body: err?.message ?? "Internal error" };
  }
};
