import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import ProductClient from "@/components/ProductClient";
import Link from "next/link";

export async function generateStaticParams() {
  const { data } = await supabase.from('products').select('id').eq('is_active', true);
  return (data ?? []).map(p => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)')
    .eq('id', params.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-zinc-500">Product niet gevonden.</p>
        <Link href="/collection" className="text-sm text-black underline">Terug naar collectie</Link>
      </div>
    );
  }

  return <ProductClient product={data as Product} />;
}
