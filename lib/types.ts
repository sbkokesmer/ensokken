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
  category_id: string | null;
  is_active: boolean;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  categories?: { name: string } | null;
}

export interface CartItem {
  product: Product;
  variantId: string;
  selectedSize: string;
  selectedColor: string;
  selectedColorName: string;
  quantity: number;
}
