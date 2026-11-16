-- ============================================================
-- SHOPIO - Demo Seed Data
-- Run this after schema.sql in the Supabase SQL Editor.
-- Prices are in BDT (৳).
-- 62 products: 12 Shopio demo products + 50 real products from the free
-- DummyJSON demo dataset (https://dummyjson.com), converted at 1 USD ≈ ৳120.
-- Their photos are saved in public/images/products/*.webp.
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
    array['bottle','water','accessories','sports'], '/images/products/water-bottle.svg', 120),

  -- ========== 50 real products (DummyJSON demo dataset, prices in BDT) ==========
  -- Electronics,
  ('iPhone 13 Pro', 'The iPhone 13 Pro is a cutting-edge smartphone with a powerful camera system, high-performance chip, and stunning display. It offers advanced features for users who demand top-notch technology.', 132000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','iphone','ios','apple','smartphones'], '/images/products/iphone-13-pro.webp', 56),
  ('iPhone X', 'The iPhone X is a flagship smartphone featuring a bezel-less OLED display, facial recognition technology (Face ID), and impressive performance. It represents a milestone in iPhone design and innovation.', 108000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','iphone','ios','apple','smartphones'], '/images/products/iphone-x.webp', 37),
  ('Samsung Galaxy S10', 'The Samsung Galaxy S10 is a flagship device featuring a dynamic AMOLED display, versatile camera system, and powerful performance. It represents innovation and excellence in smartphone technology.', 84000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','galaxy','samsung','smartphones','samsung galaxy'], '/images/products/samsung-galaxy-s10.webp', 19),
  ('Samsung Galaxy S8', 'The Samsung Galaxy S8 is a premium smartphone with an Infinity Display, offering a stunning visual experience. It boasts advanced camera capabilities and cutting-edge technology.', 60000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','galaxy','samsung','smartphones','samsung galaxy'], '/images/products/samsung-galaxy-s8.webp', 0),
  ('Oppo F19 Pro Plus', 'The Oppo F19 Pro Plus is a feature-rich smartphone with a focus on camera capabilities. It boasts advanced photography features and a powerful performance for a premium user experience.', 48000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','oppo','smartphones'], '/images/products/oppo-f19-pro-plus.webp', 78),
  ('Realme C35', 'The Realme C35 is a budget-friendly smartphone with a focus on providing essential features for everyday use. It offers a reliable performance and user-friendly experience.', 18000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','realme','smartphones'], '/images/products/realme-c35.webp', 48),
  ('Realme XT', 'The Realme XT is a feature-rich smartphone with a focus on camera technology. It comes equipped with advanced camera sensors, delivering high-quality photos and videos for photography enthusiasts.', 42000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','realme','smartphones'], '/images/products/realme-xt.webp', 80),
  ('Vivo V9', 'The Vivo V9 is a smartphone known for its sleek design and emphasis on capturing high-quality selfies. It features a notch display, dual-camera setup, and a modern design.', 36000, 'Electronics',
    array['smartphone','phone','mobile','mobile phone','android','vivo','smartphones'], '/images/products/vivo-v9.webp', 82),
  ('Apple MacBook Pro 14 Inch Space Grey', 'The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple''s M1 Pro chip for exceptional performance and a stunning Retina display.', 240000, 'Electronics',
    array['laptop','computer','macbook','pc','apple','laptops'], '/images/products/apple-macbook-pro-14-inch-space-grey.webp', 24),
  ('Asus Zenbook Pro Dual Screen Laptop', 'The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.', 216000, 'Electronics',
    array['laptop','computer','pc','dual screen','asus','laptops'], '/images/products/asus-zenbook-pro-dual-screen-laptop.webp', 45),
  ('Lenovo Yoga 920', 'The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.', 132000, 'Electronics',
    array['laptop','computer','pc','2-in-1','lenovo','laptops'], '/images/products/lenovo-yoga-920.webp', 40),
  ('New DELL XPS 13 9300 Laptop', 'The New DELL XPS 13 9300 Laptop is a compact and powerful device, featuring a virtually borderless InfinityEdge display and high-end performance for various tasks.', 180000, 'Electronics',
    array['laptop','computer','pc','ultrabook','dell','laptops'], '/images/products/new-dell-xps-13-9300-laptop.webp', 74),
  ('iPad Mini 2021 Starlight', 'The iPad Mini 2021 in Starlight is a compact and powerful tablet from Apple. Featuring a stunning Retina display, powerful A-series chip, and a sleek design, it offers a premium tablet experience.', 60000, 'Electronics',
    array['tablet','ipad','apple','electronics','tablets'], '/images/products/ipad-mini-2021-starlight.webp', 47),
  ('Samsung Galaxy Tab S8 Plus Grey', 'The Samsung Galaxy Tab S8 Plus in Grey is a high-performance Android tablet by Samsung. With a large AMOLED display, powerful processor, and S Pen support, it''s ideal for productivity and entertainment.', 72000, 'Electronics',
    array['tablet','galaxy tab','android','samsung','electronics','tablets'], '/images/products/samsung-galaxy-tab-s8-plus-grey.webp', 62),
  ('Apple Airpods', 'The Apple Airpods offer a seamless wireless audio experience. With easy pairing, high-quality sound, and Siri integration, they are perfect for on-the-go listening.', 15500, 'Electronics',
    array['earbuds','earphones','headphones','wireless','bluetooth','audio','apple','electronics','wireless earphones'], '/images/products/apple-airpods.webp', 67),
  ('Beats Flex Wireless Earphones', 'The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.', 6000, 'Electronics',
    array['earphones','earbuds','headphones','wireless','bluetooth','audio','beats','electronics','wireless earphones'], '/images/products/beats-flex-wireless-earphones.webp', 50),
  ('Apple Watch Series 4 Gold', 'The Apple Watch Series 4 in Gold is a stylish and advanced smartwatch with features like heart rate monitoring, fitness tracking, and a beautiful Retina display.', 42000, 'Electronics',
    array['smartwatch','watch','wearable','fitness','apple','electronics','smartwatches'], '/images/products/apple-watch-series-4-gold.webp', 33),
  ('Apple iPhone Charger', 'The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.', 2400, 'Electronics',
    array['charger','adapter','usb','cable','iphone','apple','electronics','chargers'], '/images/products/apple-iphone-charger.webp', 31),
  -- Fashion,
  ('Blue & Black Check Shirt', 'The Blue & Black Check Shirt is a stylish and comfortable men''s shirt featuring a classic check pattern. Made from high-quality fabric, it''s suitable for both casual and semi-formal occasions.', 3600, 'Fashion',
    array['shirt','check shirt','men','clothing','fashion trends','men''s shirts'], '/images/products/blue-black-check-shirt.webp', 38),
  ('Man Plaid Shirt', 'The Man Plaid Shirt is a timeless and versatile men''s shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.', 4200, 'Fashion',
    array['shirt','plaid','men','clothing','classic wear','men''s shirts'], '/images/products/man-plaid-shirt.webp', 82),
  ('Gigabyte Aorus Men Tshirt', 'The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it''s perfect for expressing your gaming style.', 3000, 'Fashion',
    array['t-shirt','tshirt','men','clothing','gaming','gigabyte','men''s t-shirts'], '/images/products/gigabyte-aorus-men-tshirt.webp', 90),
  ('Nike Air Jordan 1 Red And Black', 'The Nike Air Jordan 1 in Red and Black is an iconic basketball sneaker known for its stylish design and high-performance features, making it a favorite among sneaker enthusiasts and athletes.', 18000, 'Fashion',
    array['shoes','sneakers','basketball shoes','footwear','men','nike','athletic shoes'], '/images/products/nike-air-jordan-1-red-and-black.webp', 7),
  ('Puma Future Rider Trainers', 'The Puma Future Rider Trainers offer a blend of retro style and modern comfort. Perfect for casual wear, these trainers provide a fashionable and comfortable option for everyday use.', 11000, 'Fashion',
    array['shoes','sneakers','trainers','running','footwear','men','puma','casual shoes'], '/images/products/puma-future-rider-trainers.webp', 90),
  ('Sports Sneakers Off White & Red', 'The Sports Sneakers in Off White and Red combine style and functionality, making them a fashionable choice for sports enthusiasts. The red and off-white color combination adds a bold and energetic touch.', 14500, 'Fashion',
    array['shoes','sneakers','footwear','men','off white','athletic shoes'], '/images/products/sports-sneakers-off-white-red.webp', 17),
  ('Blue Frock', 'The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.', 3600, 'Fashion',
    array['dress','frock','women','girls','clothing','dresses'], '/images/products/blue-frock.webp', 52),
  ('Girl Summer Dress', 'The Girl Summer Dress is a cute and breezy dress designed for warm weather. With playful patterns and lightweight fabric, it''s perfect for keeping cool and stylish during the summer.', 2400, 'Fashion',
    array['dress','summer dress','women','girls','clothing','girls'' dresses'], '/images/products/girl-summer-dress.webp', 43),
  ('Black Women''s Gown', 'The Black Women''s Gown is an elegant and timeless evening gown. With a sleek black design, it''s perfect for formal events and special occasions, exuding sophistication and style.', 15500, 'Fashion',
    array['gown','dress','party','women','clothing','gowns'], '/images/products/black-women-s-gown.webp', 25),
  ('Calvin Klein Heel Shoes', 'Calvin Klein Heel Shoes are elegant and sophisticated, designed for formal occasions. With a classic design and high-quality materials, they complement your stylish ensemble.', 9600, 'Fashion',
    array['shoes','heels','high heels','footwear','women','calvin klein','heel shoes'], '/images/products/calvin-klein-heel-shoes.webp', 93),
  ('Golden Shoes Woman', 'The Golden Shoes for Women are a glamorous choice for special occasions. Featuring a golden hue and stylish design, they add a touch of luxury to your outfit.', 6000, 'Fashion',
    array['shoes','heels','footwear','women','party','fashion diva','women''s shoes'], '/images/products/golden-shoes-woman.webp', 88),
  ('Black & Brown Slipper', 'The Black & Brown Slipper is a comfortable and stylish choice for casual wear. Featuring a blend of black and brown colors, it adds a touch of sophistication to your relaxation.', 2400, 'Fashion',
    array['slipper','sandal','footwear','women','comfort trends','slippers'], '/images/products/black-brown-slipper.webp', 3),
  -- Accessories,
  ('Black Sun Glasses', 'The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.', 3600, 'Accessories',
    array['sunglasses','glasses','eyewear','shades','fashion shades'], '/images/products/black-sun-glasses.webp', 60),
  ('Green and Black Glasses', 'The Green and Black Glasses feature a bold combination of green and black colors, adding a touch of vibrancy to your eyewear collection. They are both stylish and eye-catching.', 4200, 'Accessories',
    array['sunglasses','glasses','eyewear','shades','fashion shades'], '/images/products/green-and-black-glasses.webp', 24),
  ('Sunglasses', 'The Sunglasses offer a classic and simple design with a focus on functionality. These sunglasses provide essential UV protection while maintaining a timeless look.', 2750, 'Accessories',
    array['sunglasses','glasses','eyewear','shades','fashion shades'], '/images/products/sunglasses.webp', 27),
  ('Brown Leather Belt Watch', 'The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.', 11000, 'Accessories',
    array['watch','wristwatch','leather','men','fashion timepieces','watches','leather watches'], '/images/products/brown-leather-belt-watch.webp', 32),
  ('Longines Master Collection', 'The Longines Master Collection is an elegant and refined watch known for its precision and craftsmanship. With a timeless design, it''s a symbol of luxury and sophistication.', 180000, 'Accessories',
    array['watch','wristwatch','luxury','men','longines','watches','luxury watches'], '/images/products/longines-master-collection.webp', 100),
  ('Women''s Wrist Watch', 'The Women''s Wrist Watch is a versatile and fashionable timepiece for everyday wear. With a comfortable strap and a simple yet elegant design, it complements various styles.', 15500, 'Accessories',
    array['watch','wristwatch','women','fashion co.','watches','women''s watches'], '/images/products/women-s-wrist-watch.webp', 12),
  ('Blue Women''s Handbag', 'The Blue Women''s Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.', 6000, 'Accessories',
    array['bag','handbag','purse','women','fashionista','fashion accessories','handbags'], '/images/products/blue-women-s-handbag.webp', 76),
  ('Heshe Women''s Leather Bag', 'The Heshe Women''s Leather Bag is a luxurious and high-quality leather bag for the sophisticated woman. With a timeless design and durable craftsmanship, it''s a versatile accessory.', 15500, 'Accessories',
    array['bag','handbag','leather','women','heshe','fashion accessories','leather bags'], '/images/products/heshe-women-s-leather-bag.webp', 99),
  ('White Faux Leather Backpack', 'The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it''s perfect for both casual and on-the-go styles.', 4800, 'Accessories',
    array['backpack','bag','school bag','women','urban chic','fashion accessories','backpacks'], '/images/products/white-faux-leather-backpack.webp', 39),
  ('Women Handbag Black', 'The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it''s a must-have in every woman''s wardrobe.', 7200, 'Accessories',
    array['bag','handbag','purse','women','elegance collection','fashion accessories','handbags'], '/images/products/women-handbag-black.webp', 11),
  ('Green Crystal Earring', 'The Green Crystal Earring is a dazzling accessory that features a vibrant green crystal. With a classic design, it adds a touch of elegance to your ensemble, perfect for formal or special occasions.', 3600, 'Accessories',
    array['earrings','earring','jewellery','jewelry','women','fashion accessories'], '/images/products/green-crystal-earring.webp', 54),
  ('Green Oval Earring', 'The Green Oval Earring is a stylish and versatile accessory with a unique oval shape. Whether for casual or dressy occasions, its green hue and contemporary design make it a standout piece.', 3000, 'Accessories',
    array['earrings','earring','jewellery','jewelry','women','fashion accessories'], '/images/products/green-oval-earring.webp', 73),
  -- Sports,
  ('Cricket Bat', 'The Cricket Bat is an essential piece of cricket equipment used by batsmen to hit the cricket ball. It is made of wood and comes in various sizes and designs.', 3600, 'Sports',
    array['cricket','bat','cricket bat','willow','sports equipment'], '/images/products/cricket-bat.webp', 98),
  ('Cricket Ball', 'The Cricket Ball is a hard leather ball used in the sport of cricket. It is bowled and batted in the game, and its hardness and seam contribute to the dynamics of cricket play.', 1550, 'Sports',
    array['cricket','ball','cricket ball','leather ball','sports equipment'], '/images/products/cricket-ball.webp', 30),
  ('Cricket Helmet', 'The Cricket Helmet is a protective headgear worn by cricket players, especially batsmen and wicketkeepers. It provides protection against fast bowling and bouncers.', 5400, 'Sports',
    array['cricket','helmet','safety','protective gear','sports equipment'], '/images/products/cricket-helmet.webp', 10),
  ('Cricket Wicket', 'The Cricket Wicket is a set of three stumps and two bails, forming a wicket used in the sport of cricket. Batsmen aim to protect the wicket while scoring runs.', 3600, 'Sports',
    array['cricket','wicket','stumps','sports equipment'], '/images/products/cricket-wicket.webp', 25),
  ('Football', 'The Football, also known as a soccer ball, is the standard ball used in the sport of football (soccer). It is designed for kicking and passing in the game.', 2150, 'Sports',
    array['football','soccer','ball','sports equipment'], '/images/products/football.webp', 96),
  ('Feather Shuttlecock', 'The Feather Shuttlecock is used in the sport of badminton. It features natural feathers and is designed for high-speed play, providing stability and accuracy during matches.', 720, 'Sports',
    array['badminton','shuttlecock','shuttle','cock','sports equipment'], '/images/products/feather-shuttlecock.webp', 95),
  ('Tennis Racket', 'The Tennis Racket is an essential piece of equipment used in the sport of tennis. It features a frame with strings and a grip, allowing players to hit the tennis ball.', 6000, 'Sports',
    array['tennis','racket','racquet','sports equipment'], '/images/products/tennis-racket.webp', 6),
  ('Basketball', 'The Basketball is a standard ball used in basketball games. It is designed for dribbling, shooting, and passing in the game of basketball, suitable for both indoor and outdoor play.', 1800, 'Sports',
    array['basketball','ball','sports equipment'], '/images/products/basketball.webp', 75)
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
