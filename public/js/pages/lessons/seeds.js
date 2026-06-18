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
