/*
  # Seed New Sock Products from ondergoedenzo.nl and bol.com

  ## Summary
  Adds 10 new sock products to the store with images:
  - Heren Thermo Sokken, Sneakersokken, Koelmax Thermo/Werk, Pierre Cardin,
    Diabeten Sokken, Sportsokken, Trekking Sokken, Marco Rossi Alpaca
  All assigned to the Heren category.
*/

DO $$
DECLARE
  heren_cat_id uuid := 'cf1f4b8a-7857-4947-8aeb-f0c0d1034472';
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
BEGIN

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'THERMO-3PAAR-ZW',
    'Heren Thermo Sokken - 3 Paar - Zwart',
    'heren-thermo-sokken-3-paar-zwart',
    '3 çift siyah termal çorap seti. Yüksek pamuk içeriği sayesinde ayakları sıcak ve kuru tutar. İç astar tam havlu kumaştan yapılmıştır, ekstra konfor sağlar. Terlemeye karşı pamuk bazlı.',
    10.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p1;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p1, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/trapzwartthermosokken3paar.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'ENKELSOK-10PAAR-ZW',
    'Enkelsokken - Sneakersokken - 10 Paar - Zwart',
    'enkelsokken-sneakersokken-10-paar-zwart',
    '10 çift siyah bilek/sneaker çorap seti. Dikişsiz yapısı tahriş olmayı önler. Sıkmayan, düzgün işlenmiş manşet. Elastan içeriği sayesinde mükemmel uyum. Terlemeye karşı yüksek pamuk içeriği.',
    15.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p2;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p2, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/Enkelsokken-Sneakersokken-10Paar-zwart_1.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'KOELMAX-THERMO-WS-10',
    'Koelmax - Thermo Werksokken - 10 Paar',
    'koelmax-thermo-werksokken-10-paar',
    'Koelmax marka 10 çift termal iş çorabı seti. Ayakları işte sıcak ve kuru tutar. Dikişsiz parmak ucu tahrişi önler. Sürtünmeye ve uzun süreli kullanıma dayanıklı. S3 endüstriyel premium kalite standardı.',
    24.99, 'Yeni', heren_cat_id, true
  ) RETURNING id INTO p3;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p3, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/werksokkenthermokubus.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'KOELMAX-WS-9PAAR-ZW',
    'Koelmax - Werksokken - 9 Paar - Zwart',
    'koelmax-werksokken-9-paar-zwart',
    'İnşaat, sanayi veya güvenlik botu gerektiren sektörler için iş çorabı. Topuk ve tabanda ekstra güçlendirilmiş. Ayakları sıcak ve kuru tutar, nefes alabilir yapı. Aşınmaya karşı son derece dayanıklı.',
    19.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p4;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p4, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/werksokkenzwartkubus.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'KOELMAX-NAADLOOS-9PAAR',
    'Koelmax - Naadloze Herensokken - 100% Katoen - 9 Paar - Zwart',
    'koelmax-naadloze-herensokken-100-katoen-9-paar',
    '9 çift dikişsiz erkek çorap seti. %100 pamuk sayesinde nefes alabilir ve terlemeye karşı etkili. El bağlantılı bitişle parmak ucunda fark edilmez dikiş. Sıkmayan manşet.',
    18.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p5;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p5, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/Koelmax100_herensokkenmetlabelzwart.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'PIERRE-CARDIN-9PAAR-ZW',
    'Pierre Cardin - Herensokken - 9 Paar - Zwart',
    'pierre-cardin-herensokken-9-paar-zwart',
    'Pierre Cardin markası 9 çift erkek çorap seti. Köklü markadan iyi fiyata yüksek kalite. Sıkmayan düzgün işlenmiş manşet. Ayak önünde düz dikişler — tahriş yok.',
    19.99, 'Pierre Cardin', heren_cat_id, true
  ) RETURNING id INTO p6;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p6, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/PierreCardin-Herensokken-9PaarZL.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'DIABET-SOKKEN-4PAAR-ZW',
    'Sokken Voor Diabeten - 4 Paar - Zwart',
    'sokken-voor-diabeten-4-paar-zwart',
    '4 çift siyah diyabet çorabı seti. Antibakteriyel. Diyabet veya damar darlığı yaşayan kişiler için ideal. Manşette lastik yok, hiçbir zaman sıkmaz. %100 pamuk ile terlemeye karşı etkili. Avrupa''da üretilmiş.',
    11.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p7;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p7, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/loszwart.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'SPORT-SOK-10PAAR-ZW',
    'Sportsokken - 10 Paar - Zwart',
    'sportsokken-10-paar-zwart',
    '10 çift spor çorap uygun fiyata. Yüksek pamuk içeriği ve havlu tabanıyla terlemeye karşı etkili. İyi fiyat-kalite oranı. İş ve/veya boş zaman için uygun. AB''de üretilmiş.',
    14.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p8;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p8, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/sportsokken10paarzwart.jpg', true, 0);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'TREKKING-SOK-6PAAR-ZW',
    'Antibacteriele Trekking Sokken - 6 Paar - Zwart',
    'antibacteriele-trekking-sokken-6-paar-zwart',
    '6 çift trekking/yürüyüş çorabı. Antibakteriyel özellikler ayakları taze ve koku yapmadan tutar. Ayakların fazla ısınmaması için özel tasarım. Ter problemi yaşayan kişiler için ideal.',
    19.99, NULL, heren_cat_id, true
  ) RETURNING id INTO p9;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p9, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/0002_zwartv2.jpg', true, 0);

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p9, 'https://cdn.shopify.com/s/files/1/0620/2703/8898/products/trapzwartanti.jpg', false, 1);

  INSERT INTO products (sku, name, slug, description, price, badge, category_id, is_active)
  VALUES (
    'MR-ALPACA-THERMO-3PAAR',
    'Marco Rossi - Alpaca Thermosokken - 3 Paar - Zwart',
    'marco-rossi-alpaca-thermosokken-3-paar-zwart',
    '3 çift lüks alpaka yünü termal çorap. Alpaka yünü mükemmel yalıtım sağlar ve nefes alır — ayaklar bunalmadan sıcak kalır. Süper yumuşak ve cilt dostu — normal yün gibi kaşımaz, hassas ayaklar için idealdir. Dayanıklı ve aşınmaya karşı dirençli.',
    19.99, 'Premium', heren_cat_id, true
  ) RETURNING id INTO p10;

  INSERT INTO product_images (product_id, url, is_primary, sort_order)
  VALUES (p10, 'https://images.pexels.com/photos/6311681/pexels-photo-6311681.jpeg', true, 0);

END $$;
