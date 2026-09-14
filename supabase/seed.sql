-- ============================================================
-- SHOPIO - Demo Seed Data (STEP A)
-- Run this after schema.sql inside the Supabase SQL Editor.
-- Prices are in BDT (৳).
-- ============================================================

insert into public.products (name, description, price, category, keywords, image_url, stock) values
('Blue Ballpoint Pen', 'Smooth writing blue ballpoint pen, ideal for everyday use.', 15, 'Stationery', array['pen','ballpoint','writing','stationery','blue'], '/images/placeholder.svg', 200),
('Black Gel Pen', 'Quick-drying black gel pen with a comfortable grip.', 25, 'Stationery', array['pen','gel','writing','stationery','black'], '/images/placeholder.svg', 180),
('HB Pencil', 'Classic HB graphite pencil for writing and sketching.', 10, 'Stationery', array['pencil','hb','writing','graphite','stationery'], '/images/placeholder.svg', 300),
('Notebook', '120-page ruled notebook for school and office use.', 60, 'Stationery', array['notebook','pages','writing','ruled','stationery'], '/images/placeholder.svg', 150),
('Drawing Book', 'A4 sketch book with thick pages for drawing and art.', 80, 'Stationery', array['drawing','sketch','art','book','stationery'], '/images/placeholder.svg', 100),
('Eraser', 'Soft rubber eraser that removes pencil marks cleanly.', 8, 'Stationery', array['eraser','rubber','stationery'], '/images/placeholder.svg', 250),
('Wireless Mouse', 'Ergonomic 2.4GHz wireless mouse with USB receiver.', 650, 'Electronics', array['mouse','wireless','computer','electronics'], '/images/placeholder.svg', 80),
('Keyboard', 'Full-size wired keyboard with responsive keys.', 1200, 'Electronics', array['keyboard','computer','electronics','typing'], '/images/placeholder.svg', 60),
('Laptop', '14-inch laptop suitable for study and office work.', 55000, 'Electronics', array['laptop','computer','electronics'], '/images/placeholder.svg', 15),
('Backpack', 'Water-resistant backpack with a padded laptop compartment.', 1500, 'Accessories', array['backpack','bag','travel','accessories'], '/images/placeholder.svg', 70),
('Running Shoes', 'Lightweight running shoes with breathable mesh upper.', 2800, 'Fashion', array['shoes','running','sports','fashion'], '/images/placeholder.svg', 50),
('Water Bottle', '1 litre BPA-free reusable water bottle.', 350, 'Accessories', array['bottle','water','accessories','sports'], '/images/placeholder.svg', 120)
on conflict do nothing;
