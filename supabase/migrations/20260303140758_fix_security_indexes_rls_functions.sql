/*
  # Fix All Security Issues

  ## Summary
  This migration resolves all security advisor warnings:

  1. **Unindexed Foreign Keys**
     - Add index on cart_items.product_id
     - Add index on order_items.variant_id

  2. **RLS auth() Performance (auth initialization plan)**
     - Replace auth.uid() with (select auth.uid()) in all policies
     - Replace auth.email() with (select auth.email()) in admins policy
     - Affects: profiles, addresses, orders, order_items, cart_items, favorites, admins

  3. **Multiple Permissive Policies**
     - Merge duplicate SELECT policies on cart_items, favorites, order_items, orders, profiles
     - Admin access is already included in existing "Admins can view all X" policies via is_admin()
     - Remove the overlapping "Users can view own X" duplicates since the admin policies already include the user condition

  4. **Function Search Path Mutable**
     - Fix is_admin, is_admin_safe, handle_new_user with SET search_path = ''

  5. **Unused Indexes**
     - Drop all unused indexes to reduce write overhead
*/

-- ============================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items (variant_id);

-- ============================================================
-- 2. FIX FUNCTIONS - SET search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND is_admin = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = (SELECT auth.uid()) LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- ============================================================
-- 3. FIX RLS POLICIES - PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Single SELECT policy covering both users and admins
CREATE POLICY "Users and admins can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id OR is_admin_safe());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================
-- 4. FIX RLS POLICIES - ADDRESSES
-- ============================================================
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.addresses;

CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. FIX RLS POLICIES - ORDERS (merge user + admin SELECT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Single SELECT policy covering both
CREATE POLICY "Users and admins can view orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR is_admin());

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- 6. FIX RLS POLICIES - ORDER_ITEMS (merge user + admin SELECT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Single SELECT policy covering both
CREATE POLICY "Users and admins can view order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = (select auth.uid()) OR is_admin())
    )
  );

CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- 7. FIX RLS POLICIES - CART_ITEMS (merge user + admin SELECT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert to own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete from own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Admins can view all cart items" ON public.cart_items;

-- Single SELECT policy covering both
CREATE POLICY "Users and admins can view cart items"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR is_admin());

CREATE POLICY "Users can insert to own cart"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 8. FIX RLS POLICIES - FAVORITES (merge user + admin SELECT)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;

-- Single SELECT policy covering both
CREATE POLICY "Users and admins can view favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR is_admin());

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 9. FIX RLS POLICIES - ADMINS
-- ============================================================
DROP POLICY IF EXISTS "Nobody can directly read admins table" ON public.admins;

CREATE POLICY "Nobody can directly read admins table"
  ON public.admins FOR SELECT
  TO authenticated
  USING ((select auth.email()) = email);

-- ============================================================
-- 10. REMOVE UNUSED INDEXES
-- ============================================================
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_is_active;
DROP INDEX IF EXISTS public.idx_addresses_user;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_order_items_product;
DROP INDEX IF EXISTS public.idx_cart_user;
DROP INDEX IF EXISTS public.idx_cart_session;
DROP INDEX IF EXISTS public.idx_cart_variant;
DROP INDEX IF EXISTS public.idx_favorites_user;
DROP INDEX IF EXISTS public.idx_favorites_product;
