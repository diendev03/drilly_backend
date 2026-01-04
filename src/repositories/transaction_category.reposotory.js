const dbPromise = require('../config/database');

// Kết nối DB
const getConnection = async () => {
  return await dbPromise;
};

// ✅ Tạo danh mục mới
const createCategory = async ({
  name,
  type,
  icon,
  color,
  is_global,
  owner_id,
  approved_by
}) => {
  const query = `
    INSERT INTO transaction_category 
    (name, type, icon, color, is_global, owner_id, approved_by, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const db = await getConnection();
  const [result] = await db.execute(query, [
    name, type, icon, color, is_global, owner_id, approved_by
  ]);

  const newId = result.insertId;

  const [rows] = await db.execute(
    `SELECT * FROM transaction_category WHERE id = ? LIMIT 1`,
    [newId]
  );

  return rows[0];
};


// ✅ Lấy tất cả danh mục
const getAllCategories = async ({ account_id }) => {
  const db = await getConnection();
  const [rows] = await db.execute('SELECT * FROM transaction_category WHERE is_global=0 OR owner_id = ? ORDER BY name ASC', [account_id]);
  return rows;
};

const getCategoriesByOwner = async ({ account_id }) => {
  const db = await getConnection();
  const [rows] = await db.execute(
    `SELECT * FROM transaction_category 
     WHERE owner_id = ? 
     ORDER BY name ASC`,
    [account_id]
  );
  return rows;
};



// ✅ Tìm kiếm theo keyword (name hoặc type)
const searchCategory = async (keyword) => {
  const query = `
    SELECT * FROM transaction_category 
    WHERE name LIKE ? OR type LIKE ?
  `;
  const db = await getConnection();
  const [rows] = await db.execute(query, [`%${keyword}%`, `%${keyword}%`]);
  return rows;
};

// ✅ Cập nhật danh mục theo id
const updateCategory = async (id, updateData) => {
  const fields = [];
  const values = [];

  for (const key in updateData) {
    fields.push(`${key} = ?`);
    values.push(updateData[key]);
  }

  const query = `UPDATE transaction_category SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  const db = await getConnection();
  const [result] = await db.execute(query, values);

  if (result.affectedRows === 0) return null;

  // Lấy lại category sau khi cập nhật
  const [rows] = await db.execute(
    `SELECT * FROM transaction_category WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
};

// ✅ Xóa danh mục
const deleteCategory = async (id) => {
  const db = await getConnection();
  const [result] = await db.execute('DELETE FROM transaction_category WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Lấy category theo ID
const getCategoryById = async (id) => {
  const db = await getConnection();
  const [rows] = await db.execute('SELECT * FROM transaction_category WHERE id = ? LIMIT 1', [id]);
  return rows.length ? rows[0] : null;
};

// ✅ Tìm category theo tên và owner (để check trùng)
const findCategoryByNameAndOwner = async (name, ownerId, isGlobal) => {
  const db = await getConnection();
  const query = `
    SELECT * FROM transaction_category 
    WHERE name = ? 
    AND (
      (owner_id = ? AND is_global = ?) 
      OR (is_global = 1 AND ? = 1)
    )
    LIMIT 1
  `;
  // Logic simplified: just check exact match on name + (owner or global)
  // Actually, we usually want to prevent creating a personal category if it conflicts with an existing personal one.
  // Or prevents creating a global one if it exists.

  const [rows] = await db.execute(
    'SELECT * FROM transaction_category WHERE name = ? AND owner_id = ? AND is_global = ? LIMIT 1',
    [name, ownerId, isGlobal]
  );
  return rows.length ? rows[0] : null;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesByOwner,
  searchCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  findCategoryByNameAndOwner,
};
