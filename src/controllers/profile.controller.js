const profileService = require('../services/profile.service');
const { sendCreated, sendFail, sendError } = require('../utils/response');

// ✅ Cập nhật hồ sơ
const updateProfile = async (req, res) => {
  try {
    const { name, email, birthday, gender, mycolor, avatar, bio, location } = req.body;
    const account_id = req.headers['account_id'];

    if (!account_id?.trim()) {
      return sendFail(res, 'Thiếu account_id trong header');
    }

    if (!name && !email && !birthday && !gender && !mycolor && !avatar && !bio && !location) {
      return sendFail(res, 'Thiếu thông tin cập nhật');
    }

    const updatedProfile = await profileService.updateProfile({
      account_id,
      name,
      email,
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

module.exports = {
  updateProfile
};