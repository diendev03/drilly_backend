const transactionCategoryRepository = require('../repositories/transaction_category.reposotory');
const accountRespository = require('../repositories/account.repository');
const e = require('express');

const getAllCategories = async ({ account_id }) => {
  try {
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
  } catch (error) {
    console.error('transaction_category.service.getAllCategories error:', error);
    throw error;
  }
};

const getCategoriesByOwner = async ({account_id}) => {
  try {
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
  } catch (error) {
    console.error('transaction_category.service.getCategoriesByOwner error:', error);
    throw error;
  }
};

const createCategory = async ({
  name,
  type,
  icon,
  color,
  owner_id
}) => {
  try {
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
  } catch (error) {
    console.error('transaction_category.service.createCategory error:', error);
    throw error;
  }
};

const searchCategory = async({keyword}) => {
  try {
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
  } catch (error) {
    console.error('transaction_category.service.searchCategory error:', error);
    throw error;
  }
};

const updateCategory = async (id, updateData) => {
  try {
    const result = await transactionCategoryRepository.updateCategory(id, updateData);
    if (result.affectedRows === 0) {
      throw new Error('Category not found or no changes made');
    }
    return result;
  } catch (error) {
    console.error('transaction_category.service.updateCategory error:', error);
    throw error;
  }
};
const deleteCategory = async ({ account_id, id }) => {
  try {
    const account = await accountRespository.getAccountById(account_id);
    if (account.role !== 0) {
      throw new Error('Bạn không có quyền xóa danh mục');
    }

    const result = await transactionCategoryRepository.deleteCategory(id);

    if (!result || result.affectedRows === 0) {
      throw new Error(`Không tồn tại danh mục với ID: ${id}`);
    }

    return result;
  } catch (error) {
    console.error('transaction_category.service.deleteCategory error:', error);
    throw error;
  }
};


module.exports = {
  getAllCategories,
  getCategoriesByOwner,
  createCategory,
  searchCategory,
  updateCategory,
  deleteCategory
};