const dbPromise = require('../config/database');
const getConnection = async () => { return await dbPromise; };

const getReportSummary = async ({ account_id }) => {
  const con = await getConnection();

  const query = `
    SELECT 
      SUM(CASE 
            WHEN type = 'income' AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) 
            THEN amount ELSE 0 
          END) AS income_current,
      SUM(CASE 
            WHEN type = 'income' AND MONTH(date) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
            THEN amount ELSE 0 
          END) AS income_previous,
      SUM(CASE 
            WHEN type = 'expense' AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) 
            THEN amount ELSE 0 
          END) AS expense_current,
      SUM(CASE 
            WHEN type = 'expense' AND MONTH(date) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
            THEN amount ELSE 0 
          END) AS expense_previous
    FROM transaction
    WHERE account_id = ?
      AND date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01');
  `;

  const [rows] = await con.execute(query, [account_id]);
  return rows[0];
};



const getSummaryByCategory = async ({ account_id }) => {
  const con = await getConnection();

  const query = `
   SELECT 
  c.id AS category_id,
  c.name AS category_name,
  c.type AS category_type,

  -- tổng tháng hiện tại
  COALESCE(SUM(CASE 
      WHEN YEAR(t.date) = YEAR(CURDATE()) 
       AND MONTH(t.date) = MONTH(CURDATE()) 
      THEN t.amount END), 0) AS current_total,

  -- tổng tháng trước
  COALESCE(SUM(CASE 
      WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
       AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
      THEN t.amount END), 0) AS previous_total,

  -- growth_rate
  CASE
    WHEN COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
         AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        THEN t.amount END), 0) = 0
     AND COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE()) 
         AND MONTH(t.date) = MONTH(CURDATE()) 
        THEN t.amount END), 0) > 0
    THEN 100

    WHEN COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
         AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        THEN t.amount END), 0) > 0
     AND COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE()) 
         AND MONTH(t.date) = MONTH(CURDATE()) 
        THEN t.amount END), 0) = 0
    THEN -100

    WHEN COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
         AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        THEN t.amount END), 0) = 0
     AND COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE()) 
         AND MONTH(t.date) = MONTH(CURDATE()) 
        THEN t.amount END), 0) = 0
    THEN 0

    ELSE ROUND(
      (COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE()) 
         AND MONTH(t.date) = MONTH(CURDATE()) 
        THEN t.amount END), 0) 
      - COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
         AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        THEN t.amount END), 0)
      ) / COALESCE(SUM(CASE 
        WHEN YEAR(t.date) = YEAR(CURDATE() - INTERVAL 1 MONTH) 
         AND MONTH(t.date) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        THEN t.amount END), 1) * 100, 2)
  END AS growth_rate

FROM transaction_category c
LEFT JOIN transaction t 
  ON c.id = t.category 
 AND t.account_id = ?
GROUP BY c.id, c.name, c.type
HAVING current_total > 0 OR previous_total > 0
ORDER BY c.type, current_total DESC;
  `;

  const [rows] = await con.execute(query, [account_id]);
  return rows;
};


module.exports = {
  getReportSummary,
  getSummaryByCategory,
};
