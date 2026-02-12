const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

// Get all available active features
const getAvailableFeatures = async () => {
    const query = `
    SELECT id, name, icon_url, description 
    FROM features 
    WHERE is_active = true
    ORDER BY created_at ASC
  `;
    try {
        const db = await getConnection();
        const [rows] = await db.execute(query);
        return rows;
    } catch (error) {
        console.error('❌ Error getAvailableFeatures:', error.message);
        throw error;
    }
};

// Get user enabled features
const getUserFeatures = async (userId) => {
    const query = `
    SELECT f.id, f.name, f.icon_url, f.description, uf.enabled
    FROM features f
    LEFT JOIN user_features uf ON f.id = uf.feature_id AND uf.user_id = ?
    WHERE f.is_active = true
  `;
    try {
        const db = await getConnection();
        const [rows] = await db.execute(query, [userId]);
        return rows;
    } catch (error) {
        console.error('❌ Error getUserFeatures:', error.message);
        throw error;
    }
};

// Toggle user feature
const toggleUserFeature = async (userId, featureId, enabled) => {
    const query = `
    INSERT INTO user_features (user_id, feature_id, enabled)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)
  `;
    try {
        const db = await getConnection();
        await db.execute(query, [userId, featureId, enabled]);
        return { userId, featureId, enabled };
    } catch (error) {
        console.error('❌ Error toggleUserFeature:', error.message);
        throw error;
    }
};

module.exports = {
    getAvailableFeatures,
    getUserFeatures,
    toggleUserFeature,
};
