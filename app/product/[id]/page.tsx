import ProductPageClient from "./ProductPageClient";
import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true);
  return (data ?? []).map((p: { id: string }) => ({ id: p.id }));
}

export default function ProductPage() {
  return <ProductPageClient />;
}
