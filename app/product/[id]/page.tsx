"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import ProductClient from "@/components/ProductClient";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();
      setProduct((data as Product) ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 width={32} height={32} className="animate-spin text-zinc-300" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-zinc-500">Product niet gevonden.</p>
        <Link href="/collection" className="text-sm text-black underline">Terug naar collectie</Link>
      </div>
    );
  }

  return <ProductClient product={product} />;
}
