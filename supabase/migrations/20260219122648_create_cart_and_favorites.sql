/*
  # Sepet ve Favoriler Tabloları

  ## Yeni Tablolar

  ### cart_items
  - id: UUID primary key
  - user_id: Kullanıcı referansı (opsiyonel - misafir sepet desteği için session_id kullanılır)
  - session_id: Misafir kullanıcı için tarayıcı oturumu kimliği
  - product_id: Ürün referansı
  - variant_id: Varyant referansı
  - quantity: Miktar
  - created_at / updated_at
  - UNIQUE(user_id, variant_id) - aynı kullanıcı aynı varyantı bir kez ekleyebilir
  - UNIQUE(session_id, variant_id) - misafir sepet de aynı şekilde

  ### favorites
  - id: UUID primary key
  - user_id: Kullanıcı referansı
  - product_id: Ürün referansı
  - created_at
  - UNIQUE(user_id, product_id) - bir ürün bir kez favoriye eklenebilir

  ## Güvenlik
  - RLS etkin
  - Kullanıcılar sadece kendi sepet ve favorilerini yönetebilir
  - Misafir kullanıcılar session_id ile sepet erişebilir

  ## Notlar
  - Sepet sunucu tarafında tutularak localStorage bağımlılığı ortadan kalkar
  - Oturum açıldığında misafir sepeti kullanıcı sepetine birleştirilebilir
*/

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text DEFAULT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_user_variant_unique UNIQUE NULLS NOT DISTINCT (user_id, variant_id),
  CONSTRAINT cart_session_variant_unique UNIQUE NULLS NOT DISTINCT (session_id, variant_id),
  CONSTRAINT cart_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon users can manage guest cart by session"
  ON cart_items FOR SELECT
  TO anon
  USING (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anon users can insert guest cart"
  ON cart_items FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anon users can update guest cart"
  ON cart_items FOR UPDATE
  TO anon
  USING (user_id IS NULL AND session_id IS NOT NULL)
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anon users can delete guest cart items"
  ON cart_items FOR DELETE
  TO anon
  USING (user_id IS NULL AND session_id IS NOT NULL);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_variant ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);
