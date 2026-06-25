export const SEED_EMPTY = '';
export const SEED_EMPTY_FK = 'PRAGMA foreign_keys = ON;';
export const SEED_USERS = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);
INSERT INTO users (id, name, city, age, email) VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, 'noah@example.com'),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, 'liam@example.com'),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com');
`;
export const SEED_USERS_EXT = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);
INSERT INTO users VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, NULL),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, NULL),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com'),
  (6, 'Eli', 'Berlin', 35, 'eli@example.com'),
  (7, 'Ivy', 'Munich', 24, NULL),
  (8, 'Jay', 'Hamburg', 29, 'jay@example.com');
`;
export const SEED_USERS_NULL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);
INSERT INTO users (id, name, city, age, email) VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, NULL),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, NULL),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com');
`;
export const SEED_SHOP = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  item TEXT NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO customers VALUES
  (1, 'Ava', 'Berlin'),
  (2, 'Noah', 'Hamburg'),
  (3, 'Mia', 'Munich'),
  (4, 'Leo', 'Leipzig');
INSERT INTO orders VALUES
  (1, 1, 'Laptop', 1200),
  (2, 1, 'Mouse', 25),
  (3, 2, 'Keyboard', 80),
  (4, 3, 'Monitor', 350),
  (5, 1, 'Desk', 450);
`;
export const SEED_SHOP_EXT = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
INSERT INTO customers VALUES
  (1, 'Ava'),
  (2, 'Noah'),
  (3, 'Mia');
INSERT INTO products VALUES
  (1, 'Laptop', 1200),
  (2, 'Mouse', 25),
  (3, 'Keyboard', 80),
  (4, 'Monitor', 350),
  (5, 'Desk', 450);
INSERT INTO orders VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 2),
  (3, 2, 3, 1),
  (4, 3, 4, 1),
  (5, 1, 5, 1);
`;
export const SEED_EMPLOYEES = `
PRAGMA foreign_keys = ON;
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id)
);
INSERT INTO employees VALUES
  (1, 'Zara', NULL),
  (2, 'Ben', 1),
  (3, 'Chris', 1),
  (4, 'Diana', 2),
  (5, 'Evan', 2),
  (6, 'Finn', 3);
`;
export const SEED_NORMALIZE = `
CREATE TABLE orders_denorm (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  product TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO orders_denorm VALUES
  (1, 'Ava', 'Berlin', 'Laptop', 1200, 'Electronics'),
  (2, 'Ava', 'Berlin', 'Mouse', 25, 'Accessories'),
  (3, 'Noah', 'Hamburg', 'Keyboard', 80, 'Accessories'),
  (4, 'Mia', 'Munich', 'Monitor', 350, 'Electronics'),
  (5, 'Ava', 'Berlin', 'Desk', 450, 'Furniture');
`;
export const SEED_INVENTORY = `
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);
INSERT INTO products VALUES
  (1, 'Laptop', 'Electronics', 1200, 10),
  (2, 'Mouse', 'Accessories', 25, 100),
  (3, 'Keyboard', 'Accessories', 80, 50),
  (4, 'Monitor', 'Electronics', 350, 30),
  (5, 'Desk', 'Furniture', 450, 15),
  (6, 'Chair', 'Furniture', 200, 25),
  (7, 'Tablet', 'Electronics', 500, 20),
  (8, 'Headphones', 'Accessories', 60, 75),
  (9, 'Lamp', 'Furniture', 40, 60),
  (10, 'Printer', 'Electronics', 180, 12);
`;
export const SEED_ABITUR = `
CREATE TABLE schueler (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  klasse TEXT NOT NULL,
  geburtsdatum TEXT NOT NULL
);
CREATE TABLE faecher (
  id INTEGER PRIMARY KEY,
  bezeichnung TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);
CREATE TABLE noten (
  id INTEGER PRIMARY KEY,
  schueler_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  note REAL NOT NULL,
  datum TEXT NOT NULL,
  FOREIGN KEY (schueler_id) REFERENCES schueler(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);
CREATE TABLE lehrer (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);
CREATE TABLE unterrichtet (
  lehrer_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  PRIMARY KEY (lehrer_id, fach_id),
  FOREIGN KEY (lehrer_id) REFERENCES lehrer(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);
INSERT INTO schueler VALUES
  (1, 'Müller, Anna', 'Q1', '2007-03-15'),
  (2, 'Schmidt, Ben', 'Q1', '2007-07-22'),
  (3, 'Çiçek, Zeynep', 'Q1', '2006-11-08'),
  (4, 'Nowak, Clara', 'Q1', '2007-01-30'),
  (5, 'Fischer, David', 'Q1', '2006-09-14'),
  (6, 'Weber, Emma', '10a', '2008-05-03'),
  (7, 'Becker, Finn', '10a', '2008-12-19'),
  (8, 'Hoffmann, Greta', '10b', '2008-08-27'),
  (9, 'Schäfer, Henrik', '10b', '2009-02-11'),
  (10, 'Koch, Ida', '9c', '2009-06-07'),
  (11, 'Bauer, Jan', '9c', '2009-10-25'),
  (12, 'Richter, Klara', '9c', '2009-04-16'),
  (13, 'Klein, Leon', 'Q1', '2006-12-01'),
  (14, 'Wolf, Mia', 'Q1', '2007-05-18'),
  (15, 'Schröder, Noah', '10a', '2008-03-29');
INSERT INTO faecher VALUES
  (1, 'Mathematik', 'M'),
  (2, 'Deutsch', 'D'),
  (3, 'Englisch', 'E'),
  (4, 'Biologie', 'BI'),
  (5, 'Chemie', 'CH'),
  (6, 'Physik', 'PH'),
  (7, 'Geschichte', 'GE'),
  (8, 'Erdkunde', 'EK'),
  (9, 'Kunst', 'KU'),
  (10, 'Sport', 'SP');
INSERT INTO lehrer VALUES
  (1, 'Dr. Wagner', 'WAG'),
  (2, 'Krüger, Sabine', 'KRU'),
  (3, 'Mertens, Thomas', 'MER'),
  (4, 'Schneider, Julia', 'SCH'),
  (5, 'Fischer, Klaus', 'FIS'),
  (6, 'Lehmann, Petra', 'LEH'),
  (7, 'Zimmermann, Dirk', 'ZIM'),
  (8, 'Hartmann, Nicole', 'HAR');
INSERT INTO unterrichtet VALUES
  (1, 1), (1, 6),
  (2, 2), (2, 7),
  (3, 3),
  (4, 4), (4, 5),
  (5, 8), (5, 9),
  (6, 10),
  (7, 1),
  (8, 2), (8, 3);
INSERT INTO noten (schueler_id, fach_id, note, datum) VALUES
  (1, 1, 2.0, '2025-01-15'), (1, 2, 3.0, '2025-01-15'), (1, 3, 1.0, '2025-01-15'), (1, 4, 2.0, '2025-01-20'),
  (2, 1, 3.0, '2025-01-15'), (2, 2, 2.0, '2025-01-15'), (2, 3, 3.0, '2025-01-15'), (2, 5, 4.0, '2025-01-20'),
  (3, 1, 1.0, '2025-01-15'), (3, 2, 1.0, '2025-01-15'), (3, 3, 2.0, '2025-01-15'), (3, 6, 1.0, '2025-01-20'),
  (4, 1, 4.0, '2025-01-15'), (4, 2, 3.0, '2025-01-15'), (4, 3, 4.0, '2025-01-15'), (4, 7, 3.0, '2025-01-20'),
  (5, 1, 3.0, '2025-01-15'), (5, 2, 4.0, '2025-01-15'), (5, 3, 5.0, '2025-01-15'), (5, 8, 3.0, '2025-01-20'),
  (6, 1, 2.0, '2025-02-01'), (6, 2, 3.0, '2025-02-01'), (6, 3, 2.0, '2025-02-01'),
  (7, 1, 5.0, '2025-02-01'), (7, 2, 4.0, '2025-02-01'), (7, 3, 3.0, '2025-02-01'),
  (8, 1, 1.0, '2025-02-01'), (8, 2, 2.0, '2025-02-01'), (8, 3, 3.0, '2025-02-01'),
  (9, 1, 3.0, '2025-02-01'), (9, 2, 5.0, '2025-02-01'), (9, 3, 4.0, '2025-02-01'),
  (10, 1, 4.0, '2025-02-15'), (10, 2, 3.0, '2025-02-15'), (10, 3, 2.0, '2025-02-15'),
  (11, 1, 2.0, '2025-02-15'), (11, 2, 3.0, '2025-02-15'), (11, 3, 1.0, '2025-02-15'),
  (12, 1, 5.0, '2025-02-15'), (12, 2, 4.0, '2025-02-15'), (12, 3, 5.0, '2025-02-15'),
  (13, 1, 1.0, '2025-01-15'), (13, 2, 2.0, '2025-01-15'), (13, 3, 2.0, '2025-01-15'), (13, 4, 3.0, '2025-01-20'), (13, 5, 2.0, '2025-01-20'),
  (14, 1, 3.0, '2025-01-15'), (14, 2, 2.0, '2025-01-15'), (14, 3, 4.0, '2025-01-15'), (14, 6, 2.0, '2025-01-20'),
  (15, 1, 4.0, '2025-02-01'), (15, 2, 3.0, '2025-02-01'), (15, 3, 5.0, '2025-02-01');
`;
export const SEED_DATES = `
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  event_date TEXT NOT NULL
);
INSERT INTO events VALUES
  (1, 'Product launch', '2025-01-15'),
  (2, 'Team meeting', '2025-02-20'),
  (3, 'Conference', '2025-03-10'),
  (4, 'Workshop', '2025-01-25'),
  (5, 'Review', '2025-03-01');
`;

export const SEED_MARCH_ORDERS = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  total_amount INTEGER NOT NULL
);

INSERT INTO customers (id, name, email)
VALUES (1, 'Alice', 'alice@example.com');

INSERT INTO customers (id, name, email)
VALUES (2, 'Bob', 'bob@example.com');

INSERT INTO customers (id, name, email)
VALUES (3, 'Charlie', 'charlie@example.com');

INSERT INTO customers (id, name, email)
VALUES (4, 'Diana', 'diana@example.com');

INSERT INTO customers (id, name, email)
VALUES (5, 'Evan', 'evan@example.com');

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (1, 1, '2023-02-15', 5000);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (2, 1, '2023-03-05', 7500);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (3, 2, '2023-03-18', 6200);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (4, 3, '2023-04-01', 8100);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (5, 4, '2023-03-30', 4300);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (6, 5, '2023-01-10', 2900);
`

export const SEED_NORDWIND = `
-- Tabellen mit allen Spalten
CREATE TABLE Lieferant (
    LieferantenNr INTEGER PRIMARY KEY,
    Firma TEXT NOT NULL,
    Kontaktperson TEXT,
    Position TEXT,
    Straße TEXT,
    Ort TEXT,
    Region TEXT,
    PLZ TEXT,
    Land TEXT,
    Telefon TEXT,
    Telefax TEXT,
    Homepage TEXT
);

CREATE TABLE Kunde (
    KundenCode TEXT PRIMARY KEY,
    Firma TEXT NOT NULL,
    Kontaktperson TEXT,
    Position TEXT,
    Straße TEXT,
    Ort TEXT,
    Region TEXT,
    PLZ TEXT,
    Land TEXT,
    Telefon TEXT,
    Telefax TEXT
);

CREATE TABLE Versandfirma (
    FirmenNr INTEGER PRIMARY KEY,
    Firma TEXT NOT NULL,
    Telefon TEXT
);

CREATE TABLE Personal (
    PersonalNr INTEGER PRIMARY KEY,
    Nachname TEXT NOT NULL,
    Vorname TEXT NOT NULL,
    Position TEXT,
    Anrede TEXT,
    Geburtsdatum TEXT,
    Einstellung TEXT,
    Straße TEXT,
    Ort TEXT,
    Region TEXT,
    PLZ TEXT,
    Land TEXT,
    TelefonPrivat TEXT,
    DurchwahlBüro TEXT,
    Bemerkungen TEXT,
    Vorgesetzter INTEGER,
    FOREIGN KEY (Vorgesetzter) REFERENCES Personal(PersonalNr)
);

CREATE TABLE Kategorie (
    KategorieNr INTEGER PRIMARY KEY,
    Kategoriename TEXT NOT NULL,
    Beschreibung TEXT
);

CREATE TABLE Artikel (
    ArtikelNr INTEGER PRIMARY KEY,
    Artikelname TEXT NOT NULL,
    LieferantenNr INTEGER,
    KategorieNr INTEGER,
    Liefereinheit TEXT,
    Einzelpreis REAL,
    Lagerbestand INTEGER,
    BestellteEinheiten INTEGER DEFAULT 0,
    Mindestbestand INTEGER,
    Auslaufartikel INTEGER DEFAULT 0,
    FOREIGN KEY (LieferantenNr) REFERENCES Lieferant(LieferantenNr),
    FOREIGN KEY (KategorieNr) REFERENCES Kategorie(KategorieNr)
);

CREATE TABLE Bestellung (
    BestellNr INTEGER PRIMARY KEY,
    KundenCode TEXT,
    PersonalNr INTEGER,
    Bestelldatum TEXT,
    Lieferdatum TEXT,
    Versanddatum TEXT,
    FirmenNr INTEGER,
    Frachtkosten REAL,
    Empfänger TEXT,
    Straße TEXT,
    Ort TEXT,
    Region TEXT,
    PLZ TEXT,
    Bestimmungsland TEXT,
    FOREIGN KEY (KundenCode) REFERENCES Kunde(KundenCode),
    FOREIGN KEY (PersonalNr) REFERENCES Personal(PersonalNr),
    FOREIGN KEY (FirmenNr) REFERENCES Versandfirma(FirmenNr)
);

CREATE TABLE Bestelldetails (
    BestellNr INTEGER,
    ArtikelNr INTEGER,
    Einzelpreis REAL,
    Anzahl INTEGER,
    Rabatt REAL DEFAULT 0,
    PRIMARY KEY (BestellNr, ArtikelNr),
    FOREIGN KEY (BestellNr) REFERENCES Bestellung(BestellNr),
    FOREIGN KEY (ArtikelNr) REFERENCES Artikel(ArtikelNr)
);

-- Daten einfügen
INSERT INTO Lieferant VALUES
(1, 'Exotic Liquids', 'Charlotte Cooper', 'Purchasing Manager', '49 Gilbert St.', 'London', NULL, 'EC1 4SD', 'UK', '(171) 555-2222', NULL, NULL),
(8, 'Specialty Biscuits Ltd.', 'Peter Wilson', 'Sales Representative', '29 King''s Way', 'Manchester', NULL, 'M14 GSD', 'UK', '(161) 555-4448', NULL, NULL),
(13, 'Escargots Nouveaux', 'Marie Delamare', 'Sales Manager', '22 rue H. Voiron', 'Montceau', NULL, '71300', 'France', '85.57.00.07', NULL, NULL);

INSERT INTO Kategorie VALUES
(1, 'Getränke', 'Kaffee, Tee, Bier, Wein'),
(3, 'Süßwaren', 'Desserts, Bonbons, süßes Gebäck'),
(8, 'Fisch/Meeresfrüchte', 'Fisch und Meeresfrüchte');

INSERT INTO Versandfirma VALUES
(1, 'Speedy Express', '(503) 555-9831'),
(3, 'Federal Shipping', '(503) 555-9931');

INSERT INTO Personal VALUES
(1, 'Davolio', 'Nancy', 'Sales Representative', 'Ms.', '1948-12-08', '1992-05-01', '507 - 20th Ave. E.', 'Seattle', 'WA', '98122', 'USA', '(206) 555-9857', '(206) 555-5467', 'Spricht Deutsch und Französisch.', NULL),
(3, 'Leverling', 'Janet', 'Sales Representative', 'Ms.', '1963-08-30', '1992-04-01', '722 Moss Bay Blvd.', 'Kirkland', 'WA', '98033', 'USA', '(206) 555-3412', '(206) 555-3355', 'Spricht Japanisch.', 2),
(5, 'Buchanan', 'Steven', 'Sales Manager', 'Mr.', '1955-03-04', '1993-10-17', '14 Garrett Hill', 'London', NULL, 'SW1 8JR', 'UK', '(71) 555-4848', '(71) 555-7773', 'Ehemaliger Fußballprofi.', 2);

INSERT INTO Kunde VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Sales Representative', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany', '030-0074321', '030-0076545'),
('ANATR', 'Ana Trujillo Emparedados y helados', 'Ana Trujillo', 'Owner', 'Avda. de la Constitución 2222', 'México D.F.', NULL, '05021', 'Mexico', '(5) 555-4729', '(5) 555-3745'),
('RATTC', 'Rattlesnake Canyon Grocery', 'Paula Wilson', 'Sales Representative', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', 'USA', '(505) 555-5939', '(505) 555-3620'),
('RICSU', 'Richter Supermarkt', 'Michael Holz', 'Sales Manager', 'Grenzacherweg 237', 'Genève', NULL, '1203', 'Switzerland', '0897-034214', NULL);

INSERT INTO Artikel VALUES
(1, 'Chai', 1, 1, '10 boxes x 20 bags', 18.00, 39, 0, 10, 0),
(19, 'Teatime Chocolate Biscuits', 8, 3, '10 boxes x 12 pieces', 9.20, 25, 0, 5, 0),
(21, 'Sir Rodney''s Scones', 8, 3, '24 pkgs. x 4 pieces', 10.00, 3, 40, 5, 0),
(43, 'Ipoh Coffee', 1, 1, '16 - 500 g tins', 46.00, 17, 10, 25, 0),
(58, 'Escargots de Bourgogne', 13, 8, '24 pieces', 13.25, 62, 0, 20, 0);

INSERT INTO Bestellung VALUES
(10266, 'ALFKI', 3, '1996-07-26', '1996-08-23', '1996-07-31', 3, 25.73, 'Maria Anders', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany'),
(11031, 'RICSU', 5, '1998-04-15', '1998-05-13', '1998-04-24', 1, 8.50, 'Michael Holz', 'Grenzacherweg 237', 'Genève', NULL, '1203', 'Switzerland'),
(11032, 'RATTC', 5, '1998-05-06', '1998-06-03', '1998-05-15', 1, 12.30, 'Paula Wilson', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', 'USA'),
(11033, 'ALFKI', 5, '1998-05-07', '1998-06-04', '1998-05-16', 1, 5.60, 'Maria Anders', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany'),
(11034, 'ANATR', 5, '1998-05-07', '1998-06-04', '1998-05-15', 3, 15.90, 'Ana Trujillo', 'Avda. de la Constitución 2222', 'México D.F.', NULL, '05021', 'Mexico'),
(11035, 'RICSU', 5, '1998-05-10', '1998-06-07', '1998-05-20', 1, 7.80, 'Michael Holz', 'Grenzacherweg 237', 'Genève', NULL, '1203', 'Switzerland'),
(11036, 'ALFKI', 1, '1998-05-11', '1998-06-08', '1998-05-18', 1, 3.20, 'Maria Anders', 'Obere Str. 57', 'Berlin', NULL, '12209', 'Germany'),
(11037, 'RATTC', 3, '1998-05-12', '1998-06-09', '1998-05-20', 3, 22.00, 'Paula Wilson', '2817 Milton Dr.', 'Albuquerque', 'NM', '87110', 'USA'),
(11038, 'ANATR', 1, '1998-05-13', '1998-06-10', '1998-05-22', 1, 9.50, 'Ana Trujillo', 'Avda. de la Constitución 2222', 'México D.F.', NULL, '05021', 'Mexico');

INSERT INTO Bestelldetails VALUES
(10266, 19, 9.20, 5, 0),
(11031, 19, 9.20, 3, 0.1),
(11031, 58, 13.25, 2, 0),
(11031, 1, 18.00, 1, 0),
(11032, 21, 10.00, 5, 0),
(11033, 58, 13.25, 4, 0.1),
(11034, 58, 13.25, 6, 0),
(11035, 19, 9.20, 2, 0),
(11035, 58, 13.25, 3, 0),
(11036, 1, 18.00, 10, 0),
(11037, 43, 46.00, 2, 0),
(11038, 58, 13.25, 5, 0.05);
`


export const SEED_TEST_SCHEMA= `
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT, signup_date DATE NOT NULL, loyalty_tier TEXT CHECK(loyalty_tier IN ('bronze','silver','gold','platinum')) DEFAULT 'bronze', is_active BOOLEAN DEFAULT 1); CREATE TABLE categories (category_id INTEGER PRIMARY KEY, name TEXT NOT NULL, parent_category_id INTEGER REFERENCES categories(category_id), description TEXT); CREATE TABLE products (product_id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(category_id), name TEXT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL CHECK(price > 0), stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0), is_discontinued BOOLEAN DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(customer_id), order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status TEXT CHECK(status IN ('pending','shipped','delivered','cancelled','returned')) DEFAULT 'pending', shipping_address TEXT NOT NULL, total_amount DECIMAL(12,2)); CREATE TABLE order_items (order_item_id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(order_id), product_id INTEGER NOT NULL REFERENCES products(product_id), quantity INTEGER NOT NULL CHECK(quantity > 0), unit_price DECIMAL(10,2) NOT NULL); CREATE TABLE reviews (review_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(product_id), customer_id INTEGER NOT NULL REFERENCES customers(customer_id), rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), review_text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(product_id, customer_id)); INSERT INTO categories VALUES (1,'Electronics',NULL,'All electronic devices'),(2,'Computers',1,'Desktop and laptop computers'),(3,'Laptops',2,'Portable computers'),(4,'Accessories',2,'Computer accessories'),(5,'Clothing',NULL,'Apparel and fashion'),(6,'Shoes',5,'Footwear'),(7,'Running Shoes',6,'Athletic running shoes'),(8,'Sandals',6,'Summer footwear'); INSERT INTO customers VALUES (1,'Alice','Johnson','alice@email.com','555-0100','2024-01-15','gold',1),(2,'Bob','Smith','bob@email.com','555-0101','2024-02-20','silver',1),(3,'Carol','Williams','carol@email.com','555-0102','2024-03-10','silver',1),(4,'Dave','Brown','dave@email.com',NULL,'2024-04-05','bronze',1),(5,'Eve','Davis','eve@email.com','555-0104','2024-05-20','bronze',0),(6,'Frank','Miller','frank@email.com','555-0105','2024-06-01','gold',1),(7,'Grace','Wilson','grace@email.com',NULL,'2024-06-15','platinum',1),(8,'Hank','Taylor','hank@email.com','555-0107','2024-07-01','bronze',1),(9,'Iris','Anderson','iris@email.com','555-0108','2024-08-12','silver',1),(10,'Jack','Thomas','jack@email.com',NULL,'2024-09-05','gold',0); INSERT INTO products VALUES (1,3,'MacBook Pro 16"','High-performance laptop with M3 chip',2499.00,15,0,'2024-01-01'),(2,3,'Dell XPS 15','Windows ultrabook',1899.00,8,0,'2024-01-15'),(3,3,'ThinkPad X1 Carbon','Business laptop',1799.00,0,0,'2024-02-01'),(4,4,'USB-C Hub','Multi-port adapter 7-in-1',79.99,200,0,'2024-01-01'),(5,4,'Wireless Mouse','Ergonomic wireless mouse',49.99,0,1,'2024-01-01'),(6,7,'Nike Air Zoom Pegasus','Running shoes with Zoom Air',129.99,50,0,'2024-03-01'),(7,7,'Adidas Ultraboost','Responsive running shoes',179.99,30,0,'2024-03-15'),(8,6,'Leather Boots','Handcrafted formal boots',249.00,12,0,'2024-02-01'),(9,4,'Mechanical Keyboard','Cherry MX switches',149.99,45,0,'2024-02-15'),(10,7,'Brooks Ghost 15','Neutral running shoe',139.99,25,0,'2024-04-01'),(11,8,'Birkenstock Arizona','Classic sandals',99.99,60,0,'2024-05-01'),(12,3,'HP Spectre x360','Convertible laptop',1599.00,5,0,'2024-03-01'); INSERT INTO orders VALUES (1,1,'2024-12-01 10:30:00','delivered','123 Main St, New York, NY',2578.99),(2,1,'2025-01-05 14:15:00','shipped','123 Main St, New York, NY',129.99),(3,2,'2024-12-15 09:00:00','delivered','456 Oak Ave, Los Angeles, CA',1948.99),(4,3,'2025-01-20 16:45:00','pending','789 Pine Rd, Chicago, IL',NULL),(5,4,'2025-02-01 11:00:00','cancelled','321 Elm St, Houston, TX',0.00),(6,6,'2024-12-10 08:30:00','delivered','654 Maple Dr, San Francisco, CA',259.98),(7,7,'2025-01-15 13:00:00','shipped','987 Cedar Ln, Miami, FL',179.99),(8,1,'2025-02-05 10:00:00','pending','123 Main St, New York, NY',NULL),(9,2,'2025-02-10 15:30:00','returned','456 Oak Ave, Los Angeles, CA',79.99),(10,3,'2025-02-12 12:00:00','shipped','789 Pine Rd, Chicago, IL',1878.99),(11,1,'2025-02-15 09:00:00','pending','123 Main St, New York, NY',NULL),(12,8,'2024-12-20 16:00:00','delivered','111 First St, Boston, MA',249.00),(13,9,'2025-01-25 11:30:00','delivered','222 Second Ave, Seattle, WA',149.99),(14,10,'2025-02-18 14:00:00','cancelled','333 Third Rd, Denver, CO',0.00),(15,6,'2025-02-20 08:00:00','pending','654 Maple Dr, San Francisco, CA',399.96); INSERT INTO order_items VALUES (1,1,1,1,2499.00),(2,1,4,1,79.99),(3,2,6,1,129.99),(4,3,2,1,1899.00),(5,3,4,1,49.99),(6,6,6,2,129.99),(7,7,7,1,179.99),(8,10,3,1,1799.00),(9,10,4,1,79.99),(10,4,1,1,2499.00),(11,4,4,2,79.99),(12,12,8,1,249.00),(13,13,9,1,149.99),(14,15,10,2,139.99),(15,15,11,1,99.99),(16,2,7,3,179.99),(17,3,9,1,149.99),(18,8,5,1,49.99),(19,9,5,2,49.99),(20,10,12,1,1599.00); INSERT INTO reviews VALUES (1,1,1,5,'Amazing laptop, super fast and great battery life!','2024-12-05'),(2,1,3,4,'Great machine but a bit pricey for what you get','2025-01-10'),(3,2,2,3,'Decent performance, battery life could be better','2024-12-20'),(4,6,6,5,'Best running shoes ever, very comfortable','2025-01-05'),(5,6,7,4,'Comfortable for long runs, good cushioning','2025-02-01'),(6,7,1,5,'Love the Ultraboost cushioning, perfect fit','2025-01-15'),(7,4,2,2,'Failed after 2 months, USB ports stopped working','2025-02-10'),(8,4,8,3,'Works okay but gets hot with multiple devices','2025-01-20'),(9,9,9,5,'Best keyboard I have ever used, great for coding','2025-02-15'),(10,11,10,4,'Very comfortable sandals, arch support is good','2024-12-25'),(11,8,4,5,'Beautiful boots, great craftsmanship','2025-01-08'),(12,1,6,4,'Powerful laptop but fan gets loud under load','2025-02-05'),(13,12,3,3,'Good convertible but hinges feel loose','2025-01-30'),(14,10,1,5,'Perfect neutral running shoe, no complaints','2025-02-12'); 
`

