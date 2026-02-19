/*
  # Profiles tablosuna is_admin kolonu ekleme

  ## Değişiklikler
  - profiles tablosuna is_admin boolean kolonu eklendi (default: false)
  - Admin kullanıcılar bu flag ile tanımlanır
  - RLS: Sadece admin kullanıcılar diğer profilleri görebilir
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );
