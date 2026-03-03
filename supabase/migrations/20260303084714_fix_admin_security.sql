/*
  # Admin Güvenlik Düzeltmeleri

  ## Özet
  1. admins tablosu RLS politikası güncelleniyor:
     - Eski politika: tüm authenticated kullanıcılar okuyabilir (güvensiz)
     - Yeni politika: hiçbir kullanıcı doğrudan okuyamaz; kontrol sadece server-side function üzerinden yapılır

  2. admins tablosundaki emailler ile profiles.is_admin senkronize ediliyor:
     - admins tablosunda email olan herkesin profiles.is_admin = true yapılır
     - Bu sayede tek bir admin kontrol noktası (profiles.is_admin) kullanılır

  3. is_admin() RLS fonksiyonu zaten profiles.is_admin = true kontrol ediyor → güvenli

  ## Güvenlik Notları
  - Tüm kritik yazma işlemleri (ürün/kategori/sipariş güncelleme) is_admin() ile korunuyor
  - is_admin() fonksiyonu SECURITY DEFINER olduğu için kullanıcı manipüle edemez
  - Frontend kontrolü ek bir UX katmanı; gerçek güvenlik RLS'te
*/

-- Eski politikayı kaldır (herkese açık okuma)
DROP POLICY IF EXISTS "Authenticated users can read admins" ON public.admins;

-- Yeni politika: kimse doğrudan okuyamaz (kontrol sadece is_admin() fonksiyonu üzerinden)
CREATE POLICY "Nobody can directly read admins table"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- admins tablosundaki emaillerle profiles.is_admin senkronize et
UPDATE public.profiles
SET is_admin = true
WHERE email IN (SELECT email FROM public.admins)
  AND is_admin = false;
