export interface ProductImage {
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  color_hex: string;
  color_name: string;
  size: string;
  stock_quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  badge: string;
  is_active: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export function getPrimaryImage(product: Product): string {
  return (
    product.product_images?.find((i) => i.is_primary)?.url ??
    product.product_images?.[0]?.url ??
    ""
  );
}

export function getProductColors(product: Product): string[] {
  if (!product.product_variants) return [];
  const seen = new Set<string>();
  const colors: string[] = [];
  for (const v of product.product_variants) {
    if (!seen.has(v.color_hex)) {
      seen.add(v.color_hex);
      colors.push(v.color_hex);
    }
  }
  return colors;
}

export function getColorImage(product: Product, colorHex: string): string {
  const colors = getProductColors(product);
  const idx = colors.indexOf(colorHex);
  if (idx !== -1 && product.product_images?.[idx]) {
    return product.product_images[idx].url;
  }
  return getPrimaryImage(product);
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}
