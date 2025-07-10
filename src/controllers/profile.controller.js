const profileService = require('../services/profile.service');
const { sendCreated, sendFail, sendError } = require('../utils/response');

// ✅ Cập nhật hồ sơ
const updateProfile = async (req, res) => {
  try {
    const { name, birthday, gender, mycolor, avatar, bio, location } = req.body;
    const account_id = req.account?.account_id;

    if (!account_id) {
      return sendFail(res, 'Sai token xác thực');
    }

    if (!name && !email && !birthday && !gender && !mycolor && !avatar && !bio && !location) {
      return sendFail(res, 'Thiếu thông tin cập nhật');
    }

    const updatedProfile = await profileService.updateProfile({
      account_id,
      name,
      birthday,
      gender,
      mycolor,
      avatar,
      bio,
      location
    });

    return sendCreated(res, 'Cập nhật hồ sơ thành công', updatedProfile);
  } catch (error) {
    return sendError(res, 'Lỗi server', error);
  }
};
const getProfile = async (req, res) => {
  try {
    const account_id = req.account?.account_id;

    if (!account_id) {
      return sendFail(res, 'Sai token xác thực');
    }

    const profile = await profileService.getProfile(account_id);
    if (!profile) {
      return sendFail(res, 'Không tìm thấy hồ sơ');
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy hồ sơ thành công',
      data: profile
    });
  } catch (error) {
    return sendError(res, 'Lỗi server', error);
  }
};

module.exports = {
  updateProfile,
  getProfile
};