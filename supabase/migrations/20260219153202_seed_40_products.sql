/*
  # Seed 40 Products (matching lib/data.ts)

  1. Clears existing products and related data
  2. Inserts 40 products cycling through 3 types:
     - type 1 (id % 3 == 1): Sunset Orange, €28
     - type 2 (id % 3 == 2): Midnight Black, €30
     - type 0 (id % 3 == 0): Essential White, €26
  3. Inserts product_images and product_variants for each
*/

DELETE FROM product_variants;
DELETE FROM product_images;
DELETE FROM products;

DO $$
DECLARE
  i INT;
  t INT;
  prod_id UUID;
  badge_val TEXT;
  name_val TEXT;
  slug_val TEXT;
  price_val NUMERIC;
  desc_val TEXT;
  img_cream TEXT := 'https://images.pexels.com/photos/4495705/pexels-photo-4495705.jpeg?auto=compress&cs=tinysrgb&w=800';
  img_black TEXT := 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800';
  img_orange TEXT := 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
  img_teal TEXT := 'https://images.pexels.com/photos/11220213/pexels-photo-11220213.jpeg?auto=compress&cs=tinysrgb&w=800';
  desc0 TEXT := 'Speciaal ontworpen voor comfort de hele dag. Dit stuk weerspiegelt Scandinavisch minimalisme en biedt zowel elegantie als duurzaamheid met zijn ademende biologische katoenstructuur en versterkte hiel.';
  desc1 TEXT := 'Maak bij elke stap het verschil met levendige kleuren en een zachte textuur. Dankzij speciale garentechnologie behouden de kleuren langdurig hun helderheid.';
  desc2 TEXT := 'Een moderne interpretatie van de klassieke stijl. Gemaakt van de hoogste kwaliteit katoengarens, omhult dit model je voet zonder te knellen.';
  heren_id UUID := 'cf1f4b8a-7857-4947-8aeb-f0c0d1034472';
  dames_id UUID := 'c07e0bfd-32ae-4690-bf57-82a5107e0145';
BEGIN
  FOR i IN 1..40 LOOP
    t := i % 3;
    badge_val := '';

    IF t = 1 THEN
      name_val := 'Sunset Orange ' || LPAD(i::TEXT, 2, '0');
      slug_val := 'sunset-orange-' || LPAD(i::TEXT, 2, '0');
      price_val := 28;
      desc_val := desc1;
      IF i % 5 = 0 THEN badge_val := 'Best Seller'; END IF;
    ELSIF t = 2 THEN
      name_val := 'Midnight Black ' || LPAD(i::TEXT, 2, '0');
      slug_val := 'midnight-black-' || LPAD(i::TEXT, 2, '0');
      price_val := 30;
      desc_val := desc2;
      IF i % 7 = 0 THEN badge_val := 'Nieuw'; END IF;
    ELSE
      name_val := 'Essential White ' || LPAD(i::TEXT, 2, '0');
      slug_val := 'essential-white-' || LPAD(i::TEXT, 2, '0');
      price_val := 26;
      desc_val := desc0;
    END IF;

    INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
    VALUES (
      'ENS-' || LPAD(i::TEXT, 3, '0'),
      name_val,
      slug_val,
      desc_val,
      price_val,
      badge_val,
      CASE WHEN i % 2 = 0 THEN dames_id ELSE heren_id END,
      true
    )
    RETURNING id INTO prod_id;

    IF t = 1 THEN
      INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
        (prod_id, img_orange, true, 0),
        (prod_id, img_cream, false, 1),
        (prod_id, img_black, false, 2);
      INSERT INTO product_variants (product_id, color_hex, color_name, size, stock_quantity) VALUES
        (prod_id, '#f24f13', 'Oranje', '36-39', 15),
        (prod_id, '#f24f13', 'Oranje', '40-43', 20),
        (prod_id, '#f24f13', 'Oranje', '44-46', 10),
        (prod_id, '#f0f0f0', 'Crème', '36-39', 12),
        (prod_id, '#f0f0f0', 'Crème', '40-43', 18),
        (prod_id, '#f0f0f0', 'Crème', '44-46', 8);
    ELSIF t = 2 THEN
      INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
        (prod_id, img_black, true, 0),
        (prod_id, img_teal, false, 1),
        (prod_id, img_cream, false, 2);
      INSERT INTO product_variants (product_id, color_hex, color_name, size, stock_quantity) VALUES
        (prod_id, '#1a1a1a', 'Zwart', '36-39', 10),
        (prod_id, '#1a1a1a', 'Zwart', '40-43', 15),
        (prod_id, '#1a1a1a', 'Zwart', '44-46', 5),
        (prod_id, '#17a6a6', 'Turkoois', '36-39', 8),
        (prod_id, '#17a6a6', 'Turkoois', '40-43', 12),
        (prod_id, '#17a6a6', 'Turkoois', '44-46', 6);
    ELSE
      INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES
        (prod_id, img_cream, true, 0),
        (prod_id, img_black, false, 1),
        (prod_id, img_orange, false, 2);
      INSERT INTO product_variants (product_id, color_hex, color_name, size, stock_quantity) VALUES
        (prod_id, '#f0f0f0', 'Crème', '36-39', 20),
        (prod_id, '#f0f0f0', 'Crème', '40-43', 25),
        (prod_id, '#f0f0f0', 'Crème', '44-46', 15),
        (prod_id, '#1a1a1a', 'Zwart', '36-39', 18),
        (prod_id, '#1a1a1a', 'Zwart', '40-43', 22),
        (prod_id, '#1a1a1a', 'Zwart', '44-46', 12),
        (prod_id, '#f24f13', 'Oranje', '36-39', 10),
        (prod_id, '#f24f13', 'Oranje', '40-43', 14),
        (prod_id, '#f24f13', 'Oranje', '44-46', 7);
    END IF;
  END LOOP;
END $$;
