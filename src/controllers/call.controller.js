const { RtcTokenBuilder, RtcRole } = require('agora-token');

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const generateToken = (req, res) => {
    // 1. Get parameters from request
    const { channelName } = req.body;

    console.log("🔍 Call Token Request - Debug Info:");
    console.log("req.user:", req.user);
    console.log("req.account:", req.account);

    // req.account is set by verifyToken middleware (decoded JWT)
    // Structure: { account_id, email, ... }
    const uid = req.account?.account_id;

    if (!uid) {
        return res.status(401).json({ status: false, message: 'User not authenticated or invalid token payload' });
    }

    if (!APP_ID || !APP_CERTIFICATE) {
        return res.status(500).json({
            status: false,
            message: 'Agora configuration (APP_ID or APP_CERTIFICATE) is missing on server.'
        });
    }

    if (!channelName) {
        return res.status(400).json({ status: false, message: 'Channel name is required' });
    }

    // 2. Define token expiration
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        // 3. Generate Token
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        return res.status(200).json({ status: true, token, uid });
    } catch (error) {
        console.error("Token generation error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = { generateToken };
