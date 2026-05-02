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

interface CartLine {
  id: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface Body {
  cart: CartLine[];
  user_id: string | null;
  email: string;
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postcode: string;
    phone: string;
  };
  notes?: string;
  origin: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    const body = JSON.parse(event.body || "{}") as Body;
    const { cart, user_id, email, shipping, notes, origin } = body;

    if (!cart?.length) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Cart is empty" }) };
    }

    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingCost = subtotal >= 50 ? 0 : 4.95;
    const total = subtotal + shippingCost;

    const shippingAddress = {
      name: `${shipping.firstName} ${shipping.lastName}`.trim(),
      address: shipping.address,
      city: shipping.city,
      postcode: shipping.postcode,
      phone: shipping.phone,
      email,
    };

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user_id ?? null,
        status: "pending",
        payment_status: "pending",
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: shippingAddress,
        payment_method: "stripe",
        notes: notes || "",
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) throw new Error(orderErr?.message ?? "Order creation failed");

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      color_name: item.selectedColor,
      size: item.selectedSize,
      quantity: item.quantity,
      unit_price: item.price,
      line_total: item.price * item.quantity,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) throw new Error(itemsErr.message);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((item) => ({
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: `${item.selectedSize} — ${item.selectedColor}`,
          images: item.image ? [item.image] : undefined,
        },
      },
      quantity: item.quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(shippingCost * 100),
          product_data: { name: "Verzending" },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal", "bancontact"],
      line_items: lineItems,
      customer_email: email,
      success_url: `${origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}&order=${order.order_number}`,
      cancel_url: `${origin}/checkout/?canceled=1`,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: user_id ?? "",
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      },
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: session.url,
        session_id: session.id,
        order_number: order.order_number,
      }),
    };
  } catch (err: any) {
    console.error("checkout error:", err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err?.message ?? "Internal error" }),
    };
  }
};
