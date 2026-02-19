/*
  # Ürünler ve Kategoriler Tabloları

  ## Yeni Tablolar

  ### categories
  - id: UUID primary key
  - name: Kategori adı (Heren, Dames, All)
  - slug: URL-friendly ad
  - created_at: Oluşturulma tarihi

  ### products
  - id: UUID primary key
  - sku: Stok kodu (unique)
  - name: Ürün adı
  - slug: URL-friendly ad
  - description: Ürün açıklaması
  - price: Fiyat (numeric)
  - badge: Rozet (Best Seller, Nieuw, vb.)
  - category_id: Kategori referansı
  - is_active: Aktiflik durumu
  - created_at / updated_at

  ### product_images
  - id: UUID primary key
  - product_id: Ürün referansı
  - url: Görsel URL
  - is_primary: Ana görsel mi?
  - sort_order: Sıralama

  ### product_variants
  - id: UUID primary key
  - product_id: Ürün referansı
  - color_hex: Renk hex kodu
  - color_name: Renk adı (Crème, Zwart, Oranje, Turkoois)
  - size: Beden (36-39, 40-43, 44-46)
  - stock_quantity: Stok miktarı

  ## Güvenlik
  - RLS tüm tablolarda etkin
  - Ürünler herkese açık (public okuma)
  - Varyantlar ve görseller herkese açık (public okuma)
  - Yazma işlemleri sadece authenticated + admin
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL DEFAULT 0,
  badge text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_hex text NOT NULL,
  color_name text NOT NULL,
  size text NOT NULL,
  stock_quantity int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, color_hex, size)
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product variants"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
