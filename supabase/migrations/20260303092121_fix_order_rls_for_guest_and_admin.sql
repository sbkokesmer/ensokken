/*
  # Sipariş RLS Politikası Düzeltmeleri

  ## Sorun
  - Misafir (anonim) kullanıcılar order_items ekleyemiyor
  - Adminler tüm siparişleri göremiyor

  ## Değişiklikler
  - Admin SELECT ve UPDATE politikası ekleniyor (orders ve order_items)
  - Anon kullanıcılar için order_items INSERT politikası ekleniyor
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can view all orders'
  ) THEN
    CREATE POLICY "Admins can view all orders"
      ON orders FOR SELECT
      TO authenticated
      USING (public.is_admin_safe());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    CREATE POLICY "Admins can update all orders"
      ON orders FOR UPDATE
      TO authenticated
      USING (public.is_admin_safe())
      WITH CHECK (public.is_admin_safe());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admins can view all order items'
  ) THEN
    CREATE POLICY "Admins can view all order items"
      ON order_items FOR SELECT
      TO authenticated
      USING (public.is_admin_safe());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Anon users can insert guest order items'
  ) THEN
    CREATE POLICY "Anon users can insert guest order items"
      ON order_items FOR INSERT
      TO anon
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = order_items.order_id
          AND orders.user_id IS NULL
        )
      );
  END IF;
END $$;
