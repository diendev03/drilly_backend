const SocketEvent = require("./socket.events");
const { SocketManager } = require("./socket.manager");

// Global active calls map
const activeCalls = new Map(); // Key: receiverId, Value: { callerId, channelName, isVideo, timestamp }

module.exports = (io, socket, userId) => {
    // Check for pending calls when user connects
    if (activeCalls.has(userId)) {
        const callData = activeCalls.get(userId);
        console.log(`♻️ Re-emitting pending call for ${userId}`);
        socket.emit(SocketEvent.CALL_MADE, {
            channelName: callData.channelName,
            isVideo: callData.isVideo,
            senderId: callData.callerId,
            socketId: null
        });
    }
    // 📞 Call Request (Agora - simplified signaling)
    // 📞 Call Request (Agora - simplified signaling)
    socket.on(SocketEvent.CALL_USER, async (data) => {
        if (!userId) {
            console.warn("⚠️ Call attempt without auth");
            return;
        }
        const { receiverId, channelName, isVideo } = data;

        console.log(`📞 Call Request: ${userId} -> ${receiverId} (channel: ${channelName})`);

        // Store active call
        activeCalls.set(receiverId, {
            callerId: userId,
            channelName,
            isVideo: isVideo ?? true,
            timestamp: Date.now()
        });

        // Add timeout to clear stale calls (e.g. 60 seconds)
        setTimeout(() => {
            if (activeCalls.has(receiverId) && activeCalls.get(receiverId).channelName === channelName) {
                activeCalls.delete(receiverId);
                console.log(`⏱️ Call timed out for ${receiverId}`);
            }
        }, 60000);

        // Fetch sender profile for push notification
        const profileRepo = require("../repositories/profile.repository");
        const messageEvent = require("../message/message.event");

        let callerName = "User";
        let callerAvatar = "";

        try {
            const profile = await profileRepo.getProfile(userId);
            if (profile) {
                callerName = profile.name;
                callerAvatar = profile.avatar;
            }
        } catch (e) {
            console.error("Error fetching caller profile:", e);
        }

        // Notify receiver with channelName (no SDP/ICE needed for Agora)
        SocketManager.emitToUser(receiverId, SocketEvent.CALL_MADE, {
            channelName,
            isVideo: isVideo ?? true,
            senderId: userId,
            socketId: socket.id
        });

        // Send Push Notification
        await messageEvent.onCallInitiated({
            callerId: userId,
            callerName,
            callerAvatar,
            channelName, // Use channelName as channelId for compatibility
            channelId: channelName,
            isVideo: isVideo ?? true
        }, receiverId);
    });

    // 📞 Call Accepted (Receiver accepts)
    socket.on(SocketEvent.CALL_ACCEPTED, (data) => {
        const { to, channelName } = data; // to = callerUserId
        // Call accepted by user, remove pending state
        activeCalls.delete(userId);

        console.log(`📞 Call Accepted: ${userId} -> ${to} (channel: ${channelName})`);
        SocketManager.emitToUser(to, SocketEvent.CALL_ACCEPTED, {
            channelName,
            accepterId: userId,
            socketId: socket.id
        });
    });

    // ⛔ Reject Call
    socket.on(SocketEvent.CALL_REJECTED, (data) => {
        const { to } = data;
        // Clear active call
        activeCalls.delete(userId);

        console.log(`📞 Rejected: ${userId} -> ${to}`);
        SocketManager.emitToUser(to, SocketEvent.CALL_REJECTED, {
            rejecterId: userId
        });
    });

    // ❌ End Call
    socket.on(SocketEvent.CALL_ENDED, (data) => {
        const { to } = data;
        // Clear active call if exists
        activeCalls.delete(userId);
        if (to) activeCalls.delete(to);

        console.log(`❌ End call: ${userId} -> ${to}`);
        if (to) {
            SocketManager.emitToUser(to, SocketEvent.CALL_ENDED, {
                enderId: userId
            });
        }
    });
};
