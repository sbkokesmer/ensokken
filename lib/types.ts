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
  created_at?: string;
  categories?: { name: string } | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export interface OrderItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string> | null;
  notes: string;
  customer_note: string;
  admin_notes: string;
  tracking_number: string;
  tracking_url: string;
  carrier: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_status_history?: OrderHistoryEntry[];
}

export interface OrderHistoryEntry {
  id: string;
  order_id: string;
  status: string;
  note: string;
  created_at: string;
}

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 4.95;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  processing: "Verwerking",
  shipped: "Verzonden",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
  refunded: "Terugbetaald",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "In afwachting",
  paid: "Betaald",
  failed: "Mislukt",
  refunded: "Terugbetaald",
};

export const CARRIERS = [
  { value: "PostNL", label: "PostNL", trackingUrl: (n: string) => `https://jouw.postnl.nl/track-and-trace/${n}` },
  { value: "DHL", label: "DHL", trackingUrl: (n: string) => `https://www.dhl.com/nl-nl/home/tracking.html?tracking-id=${n}` },
  { value: "DPD", label: "DPD", trackingUrl: (n: string) => `https://www.dpd.com/nl/nl/ontvangen/volg-uw-pakket/?parcelNumber=${n}` },
  { value: "GLS", label: "GLS", trackingUrl: (n: string) => `https://gls-group.com/track/${n}` },
  { value: "UPS", label: "UPS", trackingUrl: (n: string) => `https://www.ups.com/track?tracknum=${n}` },
] as const;

export function buildTrackingUrl(carrier: string, trackingNumber: string): string {
  const c = CARRIERS.find((x) => x.value === carrier);
  if (!c || !trackingNumber) return "";
  return c.trackingUrl(trackingNumber);
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

export function getVariantId(product: Product, colorHex: string, size: string): string | null {
  if (!product.product_variants) return null;
  const v = product.product_variants.find((x) => x.color_hex === colorHex && x.size === size);
  return v?.id ?? null;
}

export function formatPrice(price: number): string {
  return `€${Number(price).toFixed(2)}`;
}

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
