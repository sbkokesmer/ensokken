import { products } from "@/lib/data";
import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";

// 1. Bu satır Netlify ve Static Export için KRİTİK
export const dynamic = 'force-static';

// 2. Build zamanında hangi ID'lerin oluşturulacağını belirler
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

interface PageProps {
  params: {
    id: string;
  };
}

// 3. Server Component (Veriyi bulur ve Client Component'e paslar)
export default function ProductPage({ params }: PageProps) {
  const id = Number(params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
