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
