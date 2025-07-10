const transactionCategoryRepository = require('../repositories/transaction_category.reposotory');
const accountRespository = require('../repositories/account.repository');
const e = require('express');

const getAllCategories = async () => {
  const rows = await transactionCategoryRepository.getAllCategories();
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

module.exports = {
  getAllCategories,
  createCategory
};