/*
  # Profiles RLS Sonsuz Döngü Düzeltmesi

  ## Sorun
  "Admins can view all profiles" politikası, admin kontrolü için yine profiles
  tablosunu sorguluyordu. Bu sonsuz bir recursive döngüye yol açıyordu.

  ## Çözüm
  - Hatalı recursive politika kaldırılıyor
  - Admin kontrolü için SECURITY DEFINER fonksiyon kullanılıyor
  - Bu fonksiyon RLS bypass ederek güvenli şekilde is_admin değerini okur
*/

-- Recursive olan politikayı kaldır
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Güvenli admin kontrol fonksiyonu (RLS bypass eder, sonsuz döngü olmaz)
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

-- Admins için yeni politika: is_admin_safe() fonksiyonunu kullan
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin_safe());
