-- ============================================================
-- SHOPIO - Demo Seed Data
-- Run this after schema.sql in the Supabase SQL Editor.
-- Prices are in BDT (৳).
-- Safe to run again: products that already exist (same name) are not
-- duplicated; untouched ones (still using the grey placeholder) get
-- the new demo image and keywords.
-- ============================================================

drop table if exists pg_temp.seed_products;

create temp table seed_products as
select * from (values
  ('Blue Ballpoint Pen', 'Smooth writing blue ballpoint pen, ideal for everyday use.', 15, 'Stationery',
    array['pen','ballpoint','writing','stationery','blue'], '/images/products/blue-ballpoint-pen.svg', 200),
  ('Black Gel Pen', 'Quick-drying black gel pen with a comfortable grip.', 25, 'Stationery',
    array['pen','gel','writing','stationery','black'], '/images/products/black-gel-pen.svg', 180),
  ('HB Pencil', 'Classic HB graphite pencil for writing and sketching.', 10, 'Stationery',
    array['pencil','hb','writing','graphite','stationery'], '/images/products/hb-pencil.svg', 300),
  ('Notebook', '120-page ruled notebook for school and office use.', 60, 'Stationery',
    array['notebook','pages','writing','ruled','stationery'], '/images/products/notebook.svg', 150),
  ('Drawing Book', 'A4 sketch book with thick pages for drawing and art.', 80, 'Stationery',
    array['drawing','sketch','art','book','stationery'], '/images/products/drawing-book.svg', 100),
  ('Eraser', 'Soft rubber eraser that removes pencil marks cleanly.', 8, 'Stationery',
    array['eraser','rubber','stationery'], '/images/products/eraser.svg', 250),
  ('Wireless Mouse', 'Ergonomic 2.4GHz wireless mouse with USB receiver.', 650, 'Electronics',
    array['mouse','wireless','computer','electronics'], '/images/products/wireless-mouse.svg', 80),
  ('Keyboard', 'Full-size wired keyboard with responsive keys.', 1200, 'Electronics',
    array['keyboard','computer','electronics','typing'], '/images/products/keyboard.svg', 60),
  ('Laptop', '14-inch laptop suitable for study and office work.', 55000, 'Electronics',
    array['laptop','computer','electronics'], '/images/products/laptop.svg', 15),
  ('Backpack', 'Water-resistant backpack with a padded laptop compartment.', 1500, 'Accessories',
    array['backpack','bag','travel','accessories'], '/images/products/backpack.svg', 70),
  ('Running Shoes', 'Lightweight running shoes with breathable mesh upper.', 2800, 'Fashion',
    array['shoes','sneakers','running','sports','fashion'], '/images/products/running-shoes.svg', 50),
  ('Water Bottle', '1 litre BPA-free reusable water bottle.', 350, 'Accessories',
    array['bottle','water','accessories','sports'], '/images/products/water-bottle.svg', 120)
) as v(name, description, price, category, keywords, image_url, stock);

-- 1. Add demo products that do not exist yet.
insert into public.products (name, description, price, category, keywords, image_url, stock)
select s.name, s.description, s.price, s.category, s.keywords, s.image_url, s.stock
from seed_products s
where not exists (select 1 from public.products p where p.name = s.name);

-- 2. Update untouched demo products (still using the grey placeholder)
--    with their demo image and latest keywords.
update public.products p
set image_url = s.image_url,
    keywords = s.keywords
from seed_products s
where p.name = s.name
  and (p.image_url is null or p.image_url = '/images/placeholder.svg');

drop table if exists pg_temp.seed_products;
