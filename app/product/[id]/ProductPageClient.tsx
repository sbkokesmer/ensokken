"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import ProductClient from "@/components/ProductClient";
import { Loader2 } from "lucide-react";

export default function ProductPageClient() {
  const params = useParams();
  const routeId = params?.id as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let id = routeId;
    if (!id || id === "_fallback") {
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const match = path.match(/\/product\/([^\/]+)/);
      id = match?.[1];
    }
    if (!id) {
      setLoading(false);
      return;
    }
    supabase
      .from("products")
      .select("*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data ?? null);
        setLoading(false);
      });
  }, [routeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" width={32} height={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Product niet gevonden.
      </div>
    );
  }

  return <ProductClient product={product} />;
}
