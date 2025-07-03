const {
  updateProfileInDB,   // hàm repo cập nhật profile
} = require('../repositories/profile.repository');

/* ---------- PROFILE SERVICE ---------- */

// Cập nhật hồ sơ người dùng
const updateProfile = async (profileData) => {
  const {
    account_id,
    name,
    email,
    birthday,
    gender,
    mycolor,
    avatar,
    bio,
    location,
  } = profileData;

  // Gọi repository để cập nhật
  return await updateProfileInDB({
    account_id,
    name,
    email,
    birthday,
    gender,
    mycolor,
    avatar,
    bio,
    location,
  });
};

module.exports = { updateProfile };