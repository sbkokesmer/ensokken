/*
  # Başlangıç Veri Yüklemesi (Seed)

  ## İçerik

  1. Kategoriler: Heren, Dames
  2. Ürünler: 3 temel ürün (Essential White, Sunset Orange, Midnight Black)
  3. Ürün görselleri: Her ürün için çoklu görsel
  4. Varyantlar: Renk ve beden kombinasyonları

  ## Notlar
  - Fiyatlar: Essential White €26, Sunset Orange €28, Midnight Black €30
  - Bedenler: 36-39, 40-43, 44-46
  - Renkler: Crème (#f0f0f0), Zwart (#1a1a1a), Oranje (#f24f13), Turkoois (#17a6a6)
*/

INSERT INTO categories (name, slug) VALUES
  ('Heren', 'heren'),
  ('Dames', 'dames')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  heren_id uuid;
  dames_id uuid;
  white_id uuid;
  orange_id uuid;
  black_id uuid;
BEGIN
  SELECT id INTO heren_id FROM categories WHERE slug = 'heren';
  SELECT id INTO dames_id FROM categories WHERE slug = 'dames';

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'ENS-WHITE-001',
    'Essential White',
    'essential-white',
    'Tijdloze elegantie in zuiver wit. Vervaardigd van 100% organisch GOTS-gecertificeerd katoen voor het beste draagcomfort. De ergonomische pasvorm voorkomt schuiven en zorgt voor perfecte ondersteuning gedurende de hele dag.',
    26.00,
    '',
    heren_id,
    true
  )
  ON CONFLICT (sku) DO NOTHING
  RETURNING id INTO white_id;

  IF white_id IS NULL THEN
    SELECT id INTO white_id FROM products WHERE sku = 'ENS-WHITE-001';
  END IF;

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'ENS-ORANGE-001',
    'Sunset Orange',
    'sunset-orange',
    'Een levendige kleur die je dag opfleurt. Gemaakt van premium organisch katoen met een unieke compressietechnologie die de bloedsomloop stimuleert. Ideaal voor actieve mensen die stijl en functionaliteit combineren.',
    28.00,
    'Best Seller',
    dames_id,
    true
  )
  ON CONFLICT (sku) DO NOTHING
  RETURNING id INTO orange_id;

  IF orange_id IS NULL THEN
    SELECT id INTO orange_id FROM products WHERE sku = 'ENS-ORANGE-001';
  END IF;

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'ENS-BLACK-001',
    'Midnight Black',
    'midnight-black',
    'De ultieme expressie van Scandinavisch minimalisme. Diepzwart met een subtiele luxe textuur die zowel formeel als casual draagbaar is. Versterkte hiel en teen voor extra duurzaamheid.',
    30.00,
    'Nieuw',
    heren_id,
    true
  )
  ON CONFLICT (sku) DO NOTHING
  RETURNING id INTO black_id;

  IF black_id IS NULL THEN
    SELECT id INTO black_id FROM products WHERE sku = 'ENS-BLACK-001';
  END IF;

  INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
    (white_id, 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg', true, 0),
    (white_id, 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg', false, 1),
    (white_id, 'https://images.pexels.com/photos/6311383/pexels-photo-6311383.jpeg', false, 2),
    (orange_id, 'https://images.pexels.com/photos/6311479/pexels-photo-6311479.jpeg', true, 0),
    (orange_id, 'https://images.pexels.com/photos/6311476/pexels-photo-6311476.jpeg', false, 1),
    (orange_id, 'https://images.pexels.com/photos/6311474/pexels-photo-6311474.jpeg', false, 2),
    (black_id, 'https://images.pexels.com/photos/6311481/pexels-photo-6311481.jpeg', true, 0),
    (black_id, 'https://images.pexels.com/photos/6311478/pexels-photo-6311478.jpeg', false, 1),
    (black_id, 'https://images.pexels.com/photos/6311473/pexels-photo-6311473.jpeg', false, 2)
  ON CONFLICT DO NOTHING;

  INSERT INTO product_variants (product_id, color_hex, color_name, size, stock_quantity) VALUES
    (white_id, '#f0f0f0', 'Crème',   '36-39', 50),
    (white_id, '#f0f0f0', 'Crème',   '40-43', 75),
    (white_id, '#f0f0f0', 'Crème',   '44-46', 40),
    (white_id, '#1a1a1a', 'Zwart',   '36-39', 60),
    (white_id, '#1a1a1a', 'Zwart',   '40-43', 80),
    (white_id, '#1a1a1a', 'Zwart',   '44-46', 35),
    (white_id, '#f24f13', 'Oranje',  '36-39', 45),
    (white_id, '#f24f13', 'Oranje',  '40-43', 55),
    (white_id, '#f24f13', 'Oranje',  '44-46', 30),
    (orange_id, '#f24f13', 'Oranje', '36-39', 90),
    (orange_id, '#f24f13', 'Oranje', '40-43', 120),
    (orange_id, '#f24f13', 'Oranje', '44-46', 60),
    (orange_id, '#f0f0f0', 'Crème',  '36-39', 70),
    (orange_id, '#f0f0f0', 'Crème',  '40-43', 90),
    (orange_id, '#f0f0f0', 'Crème',  '44-46', 50),
    (black_id, '#1a1a1a', 'Zwart',    '36-39', 80),
    (black_id, '#1a1a1a', 'Zwart',    '40-43', 100),
    (black_id, '#1a1a1a', 'Zwart',    '44-46', 55),
    (black_id, '#17a6a6', 'Turkoois', '36-39', 40),
    (black_id, '#17a6a6', 'Turkoois', '40-43', 65),
    (black_id, '#17a6a6', 'Turkoois', '44-46', 25)
  ON CONFLICT (product_id, color_hex, size) DO NOTHING;

END $$;
