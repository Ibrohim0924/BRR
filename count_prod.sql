SELECT COUNT(*) FROM public."production_items" WHERE "productId" IN (SELECT id FROM public."products" WHERE "type" = 'raw_material');
