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


select 1;