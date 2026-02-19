/*
  # Siparişler ve Sipariş Kalemleri Tabloları

  ## Yeni Tablolar

  ### orders
  - id: UUID primary key
  - order_number: Okunabilir sipariş numarası (unique, ör: ENS-2024-0001)
  - user_id: Kullanıcı referansı (opsiyonel - misafir sipariş desteği)
  - status: Sipariş durumu (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
  - subtotal: Ara toplam
  - shipping_cost: Kargo ücreti
  - total: Genel toplam
  - shipping_address: JSON formatında teslimat adresi (snapshot)
  - billing_address: JSON formatında fatura adresi (snapshot)
  - payment_method: Ödeme yöntemi
  - payment_status: Ödeme durumu (pending, paid, failed, refunded)
  - notes: Sipariş notu
  - created_at / updated_at

  ### order_items
  - id: UUID primary key
  - order_id: Sipariş referansı
  - product_id: Ürün referansı (snapshot için product bilgileri de saklanır)
  - variant_id: Varyant referansı
  - product_name: Sipariş anındaki ürün adı (snapshot)
  - color_name: Renk adı (snapshot)
  - size: Beden (snapshot)
  - quantity: Miktar
  - unit_price: Birim fiyat (snapshot)
  - line_total: Satır toplamı

  ## Güvenlik
  - RLS etkin
  - Kullanıcılar sadece kendi siparişlerini görebilir
  - Siparişler oluşturulduktan sonra kullanıcı tarafından değiştirilemez (immutable)
*/

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'ENS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0'),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL DEFAULT '{}',
  billing_address jsonb DEFAULT NULL,
  payment_method text DEFAULT 'card',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users can insert guest orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  color_name text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL DEFAULT 0,
  line_total numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
