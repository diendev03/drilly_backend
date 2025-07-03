const { createProfile, updateProfile: updateProfileModel } = require('../models/profile.model');

// Tạo profile sau khi đã có account_id
const createProfileInDB = async (account_id, name, email) => {
  return await createProfile({
    email,
    name,
    account_id,
  });
};

const updateProfileInDB = async (profileData) => {
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

  return await updateProfileModel({
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

module.exports = {
  createProfileInDB,
  updateProfileInDB,
};