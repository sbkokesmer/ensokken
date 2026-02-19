/*
  # Create admins table

  ## Summary
  Creates a separate `admins` table to manage admin access by email address.
  This approach does not touch the existing `profiles` table or any user data.

  ## New Tables
  - `admins`
    - `id` (uuid, primary key)
    - `email` (text, unique, not null) - email address of the admin user
    - `created_at` (timestamptz) - when this admin was added

  ## Security
  - RLS enabled on `admins` table
  - Only authenticated users can read the admins table (to check their own admin status)
  - No insert/update/delete policies for regular users (only via service role / migrations)

  ## Seed Data
  - Inserts admin2@ensokken.nl as the first admin
*/

CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admins"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.admins (email)
VALUES ('admin2@ensokken.nl')
ON CONFLICT (email) DO NOTHING;
