const transactionCategoryRepository = require('../repositories/transaction_category.reposotory');
const accountRespository = require('../repositories/account.repository');
const e = require('express');

const getAllCategories = async ({ account_id }) => {
  const rows = await transactionCategoryRepository.getAllCategories({ account_id });
  const result = rows.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    icon: item.icon,
    color: item.color,
    is_global: item.is_global,
    created_at: item.created_at,
  }));

  return result;
};

const getCategoriesByOwner = async ({account_id}) => {
  const rows = await transactionCategoryRepository.getCategoriesByOwner({account_id});
  const result = rows.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    icon: item.icon,
    color: item.color,
    is_global: item.is_global,
    created_at: item.created_at,
  }));

  return result;
};

const createCategory = async ({
  name,
  type,
  icon,
  color,
  owner_id
}) => {
  const creater = await accountRespository.getAccountById(owner_id);
  var is_global, approved_by;
  if (creater.role == 0) {
    is_global = true;
    approved_by = owner_id;
  } else {
    is_global = false;
    approved_by = null;
  }
  console.log("data: ", {
    name,
    type,
    icon,
    color,
    is_global,
    owner_id,
    approved_by
  });

  return await transactionCategoryRepository.createCategory({
    name,
    type,
    icon,
    color,
    is_global,
    owner_id,
    approved_by
  });
};

const searchCategory = async({keyword}) => {
  const rows = await transactionCategoryRepository.searchCategory(keyword);
  const result = rows.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    icon: item.icon,
    color: item.color,
    isGlobal: item.is_global,
    createdAt: item.created_at,
  }));

  return result;
};

const updateCategory = async (id, updateData) => {
  const result = await transactionCategoryRepository.updateCategory(id, updateData);
  if (result.affectedRows === 0) {
    throw new Error('Category not found or no changes made');
  }
  return result;
};
const deleteCategory = async ({ account_id, id }) => {
  const account = await accountRespository.getAccountById(account_id);
  if (account.role !== 0) {
    throw new Error('Bạn không có quyền xóa danh mục');
  }

  const result = await transactionCategoryRepository.deleteCategory(id);

  if (!result || result.affectedRows === 0) {
    throw new Error(`Không tồn tại danh mục với ID: ${id}`);
  }

  return result;
};


module.exports = {
  getAllCategories,
  getCategoriesByOwner,
  createCategory,
  searchCategory,
  updateCategory,
  deleteCategory
};