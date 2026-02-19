import { supabase } from "@/lib/supabase";
import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true);
  return (data ?? []).map((p) => ({ id: p.id }));
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)")
    .eq("id", params.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
