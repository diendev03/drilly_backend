const chalk = require('chalk'); // Tùy chọn để tô màu console log (có thể bỏ nếu không cần)

/**
 * Format query SQL với tham số truyền vào
 * @param {string} query - Câu SQL có chứa dấu ?
 * @param {Array} params - Danh sách giá trị truyền vào
 * @returns {string} - Câu SQL đã được bind giá trị
 */
const formatQuery = (query, params = []) => {
  let index = 0;
  return query.replace(/\?/g, () => {
    const val = params[index++];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    return `'${val.toString().replace(/'/g, "\\'")}'`;
  });
};

// Log thành công
const logSuccess = (message) => {
  console.log(chalk.green('✅ ' + message));
};

// Log cảnh báo
const logWarn = (message) => {
  console.warn(chalk.yellow('⚠️  ' + message));
};

// Log lỗi
const logError = (message) => {
  console.error(chalk.red('❌ ' + message));
};

// Log thông tin bình thường
const logInfo = (message) => {
  console.log(chalk.blue('ℹ️  ' + message));
};

module.exports = {
  formatQuery,
  logSuccess,
  logWarn,
  logError,
  logInfo
};
