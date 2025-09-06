const profileService = require('../services/profile.service');
const { sendCreated,sendSuccess, sendFail, sendError } = require('../utils/response');

// ✅ Cập nhật hồ sơ
const updateProfile = async (req, res) => {
  try {
    const { name, birthday, gender, my_color, avatar, bio, location } = req.body;
    const account_id = req.account?.account_id;

    if (!account_id) {
      return sendFail(res, 'Invalid authentication token');
    }

    if (!name && !email && !birthday && !gender && !my_color && !avatar && !bio && !location) {
      return sendFail(res, 'Missing update information');
    }

    const updatedProfile = await profileService.updateProfile({
      account_id,
      name,
      birthday,
      gender,
      my_color,
      avatar,
      bio,
      location
    });

    return sendCreated(res, 'Update profile successfully', updatedProfile);
  } catch (error) {
    return sendError(res, 'Server error', error);
  }
};
const getProfile = async (req, res) => {
  try {
    const account_id = req.account?.account_id;

    if (!account_id) {
      return sendFail(res, 'Invalid authentication token');
    }

    const profile = await profileService.getProfile(account_id);
    if (!profile) {
      return sendFail(res, 'Can not find profile');
    }

    return sendSuccess(res, 'Get profile successfully', profile);
  } catch (error) {
    return sendError(res, 'Server error', error);
  }
};

module.exports = {
  updateProfile,
  getProfile
};