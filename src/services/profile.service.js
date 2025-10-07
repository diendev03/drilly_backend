const profileRepo= require('../repositories/profile.repository');

/* ---------- PROFILE SERVICE ---------- */

// Cập nhật hồ sơ người dùng
const updateProfile = async (profileData) => {
  const {
    account_id,
    name,
    birthday,
    gender,
    my_color,
    avatar,
    bio,
    location,
  } = profileData;

  // Gọi repository để cập nhật
  return await profileRepo.updateProfile({
    account_id,
    name,
    birthday,
    gender,
    my_color,
    avatar,
    bio,
    location,
  });
};
// Lấy hồ sơ người dùng theo account_id
const getProfile = async (account_id) => {  
  return await profileRepo.getProfile(account_id);
}

// Tìm kiếm hồ sơ người dùng theo từ khóa
const findProfile = async (keyword) => {
  return await profileRepo.findProfile({ keyword });
}

module.exports = { updateProfile, getProfile, findProfile };