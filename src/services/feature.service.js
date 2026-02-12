const featureRepository = require('../repositories/feature.repository');

const getAvailableFeatures = async () => {
    return await featureRepository.getAvailableFeatures();
};

const getUserFeatures = async (userId) => {
    return await featureRepository.getUserFeatures(userId);
};

const toggleFeature = async (userId, featureId, enabled) => {
    // Check if feature exists (optional validation)
    // For now we trust the repository foreign key constraint to fail if feature doesn't exist
    return await featureRepository.toggleUserFeature(userId, featureId, enabled);
};

module.exports = {
    getAvailableFeatures,
    getUserFeatures,
    toggleFeature,
};
