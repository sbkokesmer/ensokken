/*
  # Admin RLS Politikaları

  ## Değişiklikler
  - Adminler tüm siparişleri ve sipariş kalemlerini görebilir ve güncelleyebilir
  - Adminler tüm sepet kalemlerini görebilir
  - Adminler tüm favorileri görebilir
  - Adminler ürün ekleme/güncelleme/silme yapabilir
  - Kategoriler admin tarafından yönetilebilir

  ## Güvenlik
  - Admin kontrolü: profiles tablosundaki is_admin alanı
  - Tüm admin politikaları is_admin = true kontrolü yapar
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins can view all cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can view all favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());
