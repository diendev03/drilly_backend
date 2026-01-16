const SocketEvent = require("./socket.events");
const { SocketManager } = require("./socket.manager");

module.exports = (io, socket, userId) => {
    // 📞 Call Request (Agora - simplified signaling)
    socket.on(SocketEvent.CALL_USER, (data) => {
        if (!userId) {
            console.warn("⚠️ Call attempt without auth");
            return;
        }
        const { receiverId, channelName, isVideo } = data;

        console.log(`📞 Call Request: ${userId} -> ${receiverId} (channel: ${channelName})`);

        // Notify receiver with channelName (no SDP/ICE needed for Agora)
        SocketManager.emitToUser(receiverId, SocketEvent.CALL_MADE, {
            channelName,
            isVideo: isVideo ?? true,
            senderId: userId,
            socketId: socket.id
        });
    });

    // 📞 Call Accepted (Receiver accepts)
    socket.on(SocketEvent.CALL_ACCEPTED, (data) => {
        const { to, channelName } = data; // to = callerUserId

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
        console.log(`📞 Rejected: ${userId} -> ${to}`);
        SocketManager.emitToUser(to, SocketEvent.CALL_REJECTED, {
            rejecterId: userId
        });
    });

    // ❌ End Call
    socket.on(SocketEvent.CALL_ENDED, (data) => {
        const { to } = data;
        console.log(`❌ End call: ${userId} -> ${to}`);
        if (to) {
            SocketManager.emitToUser(to, SocketEvent.CALL_ENDED, {
                enderId: userId
            });
        }
    });
};
