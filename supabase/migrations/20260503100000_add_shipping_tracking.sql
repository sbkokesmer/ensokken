/*
  # Kargo & Sipariş Yönetimi Genişletmesi

  ## Eklenen Alanlar (orders)
  - tracking_number: Kargo takip numarası
  - tracking_url: Kargo takip linki (otomatik üretilebilir)
  - carrier: Kargo şirketi (PostNL, DHL, DPD, GLS, vb.)
  - admin_notes: Admin iç notu (müşteriye görünmez)
  - customer_note: Müşteriye gösterilen mesaj (kargoya verildi mailinde vb.)
  - confirmed_at, shipped_at, delivered_at, cancelled_at: durum zaman damgaları

  ## Yeni Tablo
  - order_status_history: tüm durum geçişlerinin timeline'ı

  ## Trigger
  - orders güncellendiğinde otomatik history kaydı + zaman damgası
*/

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tracking_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS carrier text DEFAULT '',
  ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_note text DEFAULT '',
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_session_id text DEFAULT NULL;

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text DEFAULT '',
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and admins can view order history" ON public.order_status_history;
CREATE POLICY "Users and admins can view order history"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = (select auth.uid()) OR public.is_admin_safe())
    )
  );

DROP POLICY IF EXISTS "Admins can insert order history" ON public.order_status_history;
CREATE POLICY "Admins can insert order history"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_safe());

CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(order_id);

CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    ELSIF NEW.status = 'shipped' AND NEW.shipped_at IS NULL THEN
      NEW.shipped_at := now();
    ELSIF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
      NEW.delivered_at := now();
    ELSIF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;

    INSERT INTO public.order_status_history (order_id, status, note, changed_by)
    VALUES (NEW.id, NEW.status::text, COALESCE(NEW.customer_note, ''), (SELECT auth.uid()));
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_change ON public.orders;
CREATE TRIGGER trg_order_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

DROP POLICY IF EXISTS "Anon users can view own guest order" ON public.orders;
CREATE POLICY "Anon users can view own guest order"
  ON public.orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

DROP POLICY IF EXISTS "Anon users can view own guest order items" ON public.order_items;
CREATE POLICY "Anon users can view own guest order items"
  ON public.order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );
