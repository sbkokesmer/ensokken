import ProductPageClient from "./ProductPageClient";
import { createClient } from "@supabase/supabase-js";

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY at build time. " +
      "Add them to Netlify Site Settings → Environment Variables."
    );
  }

  const client = createClient(url, key);
  const { data, error } = await client
    .from("products")
    .select("id")
    .eq("is_active", true);

  if (error) throw new Error(`generateStaticParams products fetch failed: ${error.message}`);
  return (data ?? []).map((p: { id: string }) => ({ id: p.id }));
}

export default function ProductPage() {
  return <ProductPageClient />;
}
