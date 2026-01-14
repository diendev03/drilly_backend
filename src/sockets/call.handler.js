const SocketEvent = require("./socket.events");
const { SocketManager } = require("./socket.manager");

module.exports = (io, socket, userId) => {
    // 📞 Call Request
    socket.on(SocketEvent.CALL_USER, (data) => {
        if (!userId) {
            console.warn("⚠️ Call attempt without auth");
            return;
        }
        const { receiverId, offer } = data;

        console.log(`📞 Call Request: ${userId} -> ${receiverId}`);

        // Notify receiver
        SocketManager.emitToUser(receiverId, SocketEvent.CALL_MADE, {
            offer,
            senderId: userId,
            socketId: socket.id
        });
    });

    // 📞 Call Answer (Receiver accepts)
    socket.on(SocketEvent.WEBRTC_ANSWER, (data) => {
        const { to, answer } = data; // to = callerUserId

        console.log(`📞 Answer: ${userId} -> ${to}`);
        SocketManager.emitToUser(to, SocketEvent.ANSWER_MADE, {
            answer,
            answererId: userId,
            socketId: socket.id
        });
    });

    // 🧊 ICE Candidate
    socket.on(SocketEvent.WEBRTC_ICE_CANDIDATE, (data) => {
        const { to, candidate } = data;
        SocketManager.emitToUser(to, SocketEvent.WEBRTC_ICE_CANDIDATE, {
            candidate,
            senderId: userId
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
