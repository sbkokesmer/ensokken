import ProductPageClient from "./ProductPageClient";
import { createClient } from "@supabase/supabase-js";

export const dynamicParams = true;

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[product] Missing Supabase env at build time, skipping static params.");
    return [];
  }

  try {
    const client = createClient(url, key);
    const { data } = await client
      .from("products")
      .select("id")
      .eq("is_active", true);
    return (data ?? []).map((p: { id: string }) => ({ id: p.id }));
  } catch (e) {
    console.warn("[product] generateStaticParams failed:", e);
    return [];
  }
}

export default function ProductPage() {
  return <ProductPageClient />;
}
