const featureService = require('../services/feature.service');
const { sendSuccess, sendError } = require('../utils/response');

const getAvailableFeatures = async (req, res) => {
    try {
        const features = await featureService.getAvailableFeatures();
        return sendSuccess(res, 'Lấy danh sách tính năng thành công', features);
    } catch (error) {
        return sendError(res, 'Lỗi lấy danh sách tính năng', error);
    }
};

const getUserFeatures = async (req, res) => {
    try {
        const userId = req.account?.account_id; // From middleware
        if (!userId) {
            return sendError(res, 'Không tìm thấy thông tin xác thực');
        }
        const features = await featureService.getUserFeatures(userId);
        return sendSuccess(res, 'Lấy tính năng người dùng thành công', features);
    } catch (error) {
        return sendError(res, 'Lỗi lấy tính năng người dùng', error);
    }
};

const toggleFeature = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendError(res, 'Không tìm thấy thông tin xác thực');
        }
        const { featureId, enabled } = req.body;

        if (!featureId || enabled === undefined) {
            return sendError(res, 'Thiếu thông tin featureId hoặc enabled');
        }

        const result = await featureService.toggleFeature(userId, featureId, enabled);
        return sendSuccess(res, 'Cập nhật tính năng thành công', result);
    } catch (error) {
        return sendError(res, 'Lỗi cập nhật tính năng', error);
    }
};

module.exports = {
    getAvailableFeatures,
    getUserFeatures,
    toggleFeature,
};
