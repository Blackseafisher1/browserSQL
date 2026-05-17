-- ============================================
-- Test 1: Employee Salary Analysis
-- ============================================
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT,
    salary REAL,
    hire_date TEXT,
    manager_id INTEGER
);

CREATE TABLE departments (
    name TEXT PRIMARY KEY,
    budget REAL,
    location TEXT
);

-- Sample data
INSERT INTO departments VALUES ('Engineering', 500000, 'Building A');
INSERT INTO departments VALUES ('Sales', 400000, 'Building B');
INSERT INTO departments VALUES ('Marketing', 300000, 'Building C');
INSERT INTO departments VALUES ('HR', 200000, 'Building A');
INSERT INTO departments VALUES ('Finance', 350000, 'Building B');

INSERT INTO employees VALUES (1, 'Alice', 'Engineering', 120000, '2020-03-15', NULL);
INSERT INTO employees VALUES (2, 'Bob', 'Engineering', 110000, '2019-07-01', 1);
INSERT INTO employees VALUES (3, 'Charlie', 'Engineering', 105000, '2021-01-10', 1);
INSERT INTO employees VALUES (4, 'Diana', 'Engineering', 115000, '2018-11-20', NULL);
INSERT INTO employees VALUES (5, 'Eve', 'Engineering', 108000, '2022-06-01', 1);
INSERT INTO employees VALUES (6, 'Frank', 'Engineering', 95000, '2023-02-15', 1);
INSERT INTO employees VALUES (7, 'Grace', 'Sales', 130000, '2019-04-01', NULL);
INSERT INTO employees VALUES (8, 'Henry', 'Sales', 125000, '2020-08-15', 7);
INSERT INTO employees VALUES (9, 'Ivy', 'Sales', 115000, '2021-03-01', 7);
INSERT INTO employees VALUES (10, 'Jack', 'Sales', 110000, '2022-01-10', 7);
INSERT INTO employees VALUES (11, 'Kate', 'Sales', 105000, '2022-11-01', 7);
INSERT INTO employees VALUES (12, 'Leo', 'Marketing', 100000, '2020-06-01', NULL);
INSERT INTO employees VALUES (13, 'Mia', 'Marketing', 95000, '2021-02-15', 12);
INSERT INTO employees VALUES (14, 'Noah', 'Marketing', 92000, '2022-09-01', 12);
INSERT INTO employees VALUES (15, 'Olivia', 'Marketing', 90000, '2023-04-01', 12);
INSERT INTO employees VALUES (16, 'Paul', 'HR', 85000, '2020-12-01', NULL);
INSERT INTO employees VALUES (17, 'Quinn', 'HR', 82000, '2021-07-15', 16);
INSERT INTO employees VALUES (18, 'Rose', 'HR', 80000, '2022-03-01', 16);
INSERT INTO employees VALUES (19, 'Sam', 'HR', 78000, '2023-01-10', 16);
INSERT INTO employees VALUES (20, 'Tina', 'Finance', 140000, '2018-05-15', NULL);
INSERT INTO employees VALUES (21, 'Uma', 'Finance', 135000, '2019-10-01', 20);
INSERT INTO employees VALUES (22, 'Victor', 'Finance', 130000, '2020-11-15', 20);
INSERT INTO employees VALUES (23, 'Wendy', 'Finance', 128000, '2021-08-01', 20);
INSERT INTO employees VALUES (24, 'Xavier', 'Finance', 125000, '2022-04-15', 20);
INSERT INTO employees VALUES (25, 'Yara', 'Engineering', 100000, '2024-12-01', 1);  -- < 90 days

-- ============================================
-- Test 2: Product Monthly Sales Growth
-- ============================================
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    customer_id INTEGER,
    employee_id INTEGER,
    order_date TEXT,
    quantity INTEGER,
    unit_price REAL,
    amount REAL
);

-- Sample data for monthly growth test
INSERT INTO products VALUES (1, 'Widget A', 'Widgets');
INSERT INTO products VALUES (2, 'Widget B', 'Widgets');
INSERT INTO products VALUES (3, 'Gadget X', 'Gadgets');
INSERT INTO products VALUES (4, 'Gadget Y', 'Gadgets');
INSERT INTO products VALUES (5, 'Doohickey', 'Other');
INSERT INTO products VALUES (6, 'Thingamajig', 'Other');

-- Generate 6 months of orders (adjust dates to be recent 6 months from now)
-- Product 1: Growing (consistent)
INSERT INTO orders VALUES (1, 1, 1, 7, date('now', '-5 months', 'start of month'), 10, 10, 100);
INSERT INTO orders VALUES (2, 1, 2, 7, date('now', '-5 months', 'start of month', '+15 days'), 5, 12, 60);
INSERT INTO orders VALUES (3, 1, 3, 7, date('now', '-4 months', 'start of month'), 12, 12, 144);
INSERT INTO orders VALUES (4, 1, 1, 7, date('now', '-3 months', 'start of month'), 15, 14, 210);
INSERT INTO orders VALUES (5, 1, 2, 7, date('now', '-2 months', 'start of month'), 18, 15, 270);
INSERT INTO orders VALUES (6, 1, 3, 7, date('now', '-1 months', 'start of month'), 20, 16, 320);
INSERT INTO orders VALUES (7, 1, 1, 7, date('now', 'start of month'), 25, 18, 450);

-- Product 2: Declining (consistent negative)
INSERT INTO orders VALUES (8, 2, 1, 7, date('now', '-5 months', 'start of month'), 50, 10, 500);
INSERT INTO orders VALUES (9, 2, 2, 7, date('now', '-4 months', 'start of month'), 45, 10, 450);
INSERT INTO orders VALUES (10, 2, 3, 7, date('now', '-3 months', 'start of month'), 40, 10, 400);
INSERT INTO orders VALUES (11, 2, 1, 7, date('now', '-2 months', 'start of month'), 35, 10, 350);
INSERT INTO orders VALUES (12, 2, 2, 7, date('now', '-1 months', 'start of month'), 30, 10, 300);
INSERT INTO orders VALUES (13, 2, 3, 7, date('now', 'start of month'), 25, 10, 250);

-- Product 3: Volatile (inconsistent)
INSERT INTO orders VALUES (14, 3, 1, 7, date('now', '-5 months', 'start of month'), 10, 20, 200);
INSERT INTO orders VALUES (15, 3, 2, 7, date('now', '-4 months', 'start of month'), 5, 20, 100);
INSERT INTO orders VALUES (16, 3, 3, 7, date('now', '-3 months', 'start of month'), 30, 20, 600);
INSERT INTO orders VALUES (17, 3, 1, 7, date('now', '-2 months', 'start of month'), 8, 20, 160);
INSERT INTO orders VALUES (18, 3, 2, 7, date('now', '-1 months', 'start of month'), 25, 20, 500);
INSERT INTO orders VALUES (19, 3, 3, 7, date('now', 'start of month'), 12, 20, 240);

-- Product 4: Only 4 months (should be excluded)
INSERT INTO orders VALUES (20, 4, 1, 7, date('now', '-3 months', 'start of month'), 10, 15, 150);
INSERT INTO orders VALUES (21, 4, 2, 7, date('now', '-2 months', 'start of month'), 12, 15, 180);
INSERT INTO orders VALUES (22, 4, 3, 7, date('now', '-1 months', 'start of month'), 14, 15, 210);
INSERT INTO orders VALUES (23, 4, 1, 7, date('now', 'start of month'), 16, 15, 240);

-- Product 5: Low average sales (below 1000)
INSERT INTO orders VALUES (24, 5, 1, 7, date('now', '-5 months', 'start of month'), 5, 8, 40);
INSERT INTO orders VALUES (25, 5, 2, 7, date('now', '-4 months', 'start of month'), 6, 8, 48);
INSERT INTO orders VALUES (26, 5, 3, 7, date('now', '-3 months', 'start of month'), 7, 8, 56);
INSERT INTO orders VALUES (27, 5, 1, 7, date('now', '-2 months', 'start of month'), 8, 8, 64);
INSERT INTO orders VALUES (28, 5, 2, 7, date('now', '-1 months', 'start of month'), 9, 8, 72);
INSERT INTO orders VALUES (29, 5, 3, 7, date('now', 'start of month'), 10, 8, 80);

-- Product 6: Missing one month (should be excluded)
INSERT INTO orders VALUES (30, 6, 1, 7, date('now', '-5 months', 'start of month'), 20, 25, 500);
INSERT INTO orders VALUES (31, 6, 2, 7, date('now', '-4 months', 'start of month'), 22, 25, 550);
INSERT INTO orders VALUES (32, 6, 3, 7, date('now', '-2 months', 'start of month'), 24, 25, 600);
INSERT INTO orders VALUES (33, 6, 1, 7, date('now', '-1 months', 'start of month'), 26, 25, 650);
INSERT INTO orders VALUES (34, 6, 2, 7, date('now', 'start of month'), 28, 25, 700);

-- ============================================
-- Test 3: Customer Retention
-- ============================================
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT,
    join_date TEXT
);

-- Reuse orders table, add customer data
INSERT INTO customers VALUES (1, 'Customer A', '2023-01-15');
INSERT INTO customers VALUES (2, 'Customer B', '2023-06-01');
INSERT INTO customers VALUES (3, 'Customer C', '2024-02-20');

-- Add more orders to Product 3 to push average above 1000
INSERT INTO orders VALUES 
(35, 3, 1, 7, date('now', '-5 months', 'start of month', '+10 days'), 50, 20, 1000),
(36, 3, 2, 7, date('now', '-4 months', 'start of month', '+10 days'), 55, 20, 1100),
(37, 3, 3, 7, date('now', '-3 months', 'start of month', '+10 days'), 60, 20, 1200),
(38, 3, 1, 7, date('now', '-2 months', 'start of month', '+10 days'), 65, 20, 1300),
(39, 3, 2, 7, date('now', '-1 months', 'start of month', '+10 days'), 70, 20, 1400),
(40, 3, 3, 7, date('now', 'start of month', '+10 days'), 75, 20, 1500);

-- Also boost Product 1
INSERT INTO orders VALUES
(41, 1, 1, 7, date('now', '-5 months', 'start of month', '+10 days'), 30, 20, 600),
(42, 1, 2, 7, date('now', '-4 months', 'start of month', '+10 days'), 35, 20, 700),
(43, 1, 3, 7, date('now', '-3 months', 'start of month', '+10 days'), 40, 20, 800),
(44, 1, 1, 7, date('now', '-2 months', 'start of month', '+10 days'), 45, 20, 900),
(45, 1, 2, 7, date('now', '-1 months', 'start of month', '+10 days'), 50, 20, 1000),
(46, 1, 3, 7, date('now', 'start of month', '+10 days'), 55, 20, 1100);          






-- Some retention-focused orders (adjust dates as needed)
-- These are just placeholders; the retention query needs real monthly data

WITH RECURSIVE
months(month) AS (
    SELECT strftime('%Y-%m', 'now', '-5 months')
    UNION ALL
    SELECT strftime('%Y-%m', date(month || '-01', '+1 month'))
    FROM months
    WHERE month < strftime('%Y-%m', 'now')
),
monthly_sales AS (
    SELECT 
        p.id AS product_id,
        p.name,
        strftime('%Y-%m', o.order_date) AS month,
        SUM(o.quantity * o.unit_price) AS sales,
        strftime('%Y-%m', date(strftime('%Y-%m', o.order_date) || '-01', '-1 month')) AS prev_month
    FROM products p
    JOIN orders o ON p.id = o.product_id
    WHERE o.order_date >= date('now', '-6 months', 'start of month')
    GROUP BY p.id, month
),
growth_calc AS (
    SELECT 
        m1.product_id,
        m1.name,
        m1.month,
        m1.sales,
        (m1.sales - m2.sales) * 1.0 / m2.sales AS growth_rate
    FROM monthly_sales m1
    JOIN monthly_sales m2 ON m1.product_id = m2.product_id AND m1.prev_month = m2.month
),
product_metrics AS (
    SELECT 
        g.product_id,
        g.name,
        AVG(g.sales) AS avg_sales,
        -- SQLite doesn't have STDEV, using the formula: sqrt(avg(x^2) - avg(x)^2)
        ROUND(SQRT(AVG(g.growth_rate * g.growth_rate) - (AVG(g.growth_rate) * AVG(g.growth_rate))), 4) AS growth_stddev
    FROM growth_calc g
    GROUP BY g.product_id, g.name
    HAVING COUNT(*) = 5 AND AVG(g.sales) > 1000
),
ranked_months AS (
    SELECT 
        ms.product_id,
        ms.month,
        ROW_NUMBER() OVER (PARTITION BY ms.product_id ORDER BY ms.sales DESC, ms.month DESC) AS rank_best,
        ROW_NUMBER() OVER (PARTITION BY ms.product_id ORDER BY ms.sales ASC, ms.month DESC) AS rank_worst
    FROM monthly_sales ms
)
SELECT 
    pm.name,
    pm.avg_sales,
    pm.growth_stddev,
    best.month AS best_month,
    worst.month AS worst_month
FROM product_metrics pm
JOIN ranked_months best ON pm.product_id = best.product_id AND best.rank_best = 1
JOIN ranked_months worst ON pm.product_id = worst.product_id AND worst.rank_worst = 1
ORDER BY pm.growth_stddev ASC, pm.name ASC
LIMIT 5;             

