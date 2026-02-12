const jwt = require("jsonwebtoken");
const { SocketManager } = require("./socket.manager");
const SocketEvent = require("./socket.events");
const callHandler = require("./call.handler");

const userSockets = new Map();

module.exports = (io, socket) => {

  const token = socket.handshake.headers.authorization?.split(" ")[1];
  let userId = null;

  // ✅ Xác thực token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.account_id;

      if (userId) {
        if (!userSockets.has(userId)) userSockets.set(userId, new Set());
        userSockets.get(userId).add(socket.id);

        SocketManager.joinDefaultRooms(socket, userId);

        // Broadcast user online status to all users
        SocketManager.emitToGlobal(SocketEvent.USER_ONLINE, {
          userId,
          timestamp: new Date().toISOString()
        });
        console.log(`🟢 User ${userId} is now ONLINE`);

        // ✅ Initialize Call Handler
        callHandler(io, socket, userId);
      }
    } catch {
      console.warn("⚠️ Invalid token in socket handshake");
    }
  }

  // ✅ Khi user join room chat cụ thể
  socket.on(SocketEvent.JOIN_ROOM, (conversationId) => {
    socket.join(`conv:${conversationId}`);
    console.log(`👥 User ${userId} joined room conv:${conversationId}`);
  });

  // ✅ Manual join user room (fallback if auto-join failed)
  socket.on('join_user_room', (requestedUserId) => {
    const targetUserId = requestedUserId || userId;
    if (targetUserId) {
      SocketManager.joinDefaultRooms(socket, targetUserId);
      console.log(`📌 Manual join: User ${targetUserId} joined default rooms`);
    }
  });

  // ✅ Check if a user is online
  socket.on('check_user_status', (targetUserId) => {
    const isOnline = userSockets.has(targetUserId);
    socket.emit('user_status_response', {
      userId: targetUserId,
      isOnline,
      timestamp: new Date().toISOString()
    });
    console.log(`🔍 Status check: User ${targetUserId} is ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  });

  // ✅ Batch check users status
  socket.on('check_users_status', (userIds) => {
    if (!Array.isArray(userIds)) return;

    // Filter active users from the requested list
    const activeUsers = userIds.filter(id => userSockets.has(id));

    // Send response back to requester
    socket.emit('users_status_response', {
      activeUsers,
      timestamp: new Date().toISOString()
    });

    console.log(`🔍 Batch status check for ${userIds.length} users. Active: ${activeUsers.length}`);
  });


  const profileRepo = require("../repositories/profile.repository");
  //...

  // ✅ Khi user gửi tin nhắn
  socket.on(SocketEvent.SEND_MESSAGE, async (data) => {
    const { roomId, senderId, receiverId, content } = data;
    if (!roomId || !content) return;

    // Get Sender Profile
    let senderName = '';
    let senderAvatar = null;
    try {
      const profile = await profileRepo.getProfile(senderId);
      if (profile) {
        senderName = profile.name;
        senderAvatar = profile.avatar;
      }
    } catch (e) {
      console.error("Socket getProfile error:", e);
    }

    const message = {
      senderId,
      receiverId,
      content,
      roomId,
      timestamp: new Date().toISOString(),
      senderName,
      senderAvatar
    };

    console.log(`💌 Message from ${senderId} → conv:${roomId}:`, content);

    // 1️⃣ Gửi tin nhắn tới room chat
    SocketManager.emitToConversation(roomId, SocketEvent.RECEIVE_MESSAGE, message);

    // 2️⃣ Cập nhật last message
    SocketManager.emitToUser(senderId, SocketEvent.UPDATE_LAST_MESSAGE, message);
    SocketManager.emitToUser(receiverId, SocketEvent.UPDATE_LAST_MESSAGE, message);
  });

  // ✅ Khi user đang nhập (typing)
  socket.on(SocketEvent.TYPING, (data) => {
    const { conversationId, senderId } = data;
    if (!conversationId || !senderId) return;

    const typingEvent = {
      conversationId,
      senderId,
      timestamp: new Date().toISOString(),
    };

    SocketManager.emitToConversation(conversationId, SocketEvent.TYPING, typingEvent);
  });

  // ✅ Khi user ngắt kết nối
  socket.on(SocketEvent.DISCONNECT, () => {
    if (userId && userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);

      // If user has no more active sockets, broadcast offline status
      if (!userSockets.get(userId).size) {
        userSockets.delete(userId);

        SocketManager.emitToGlobal(SocketEvent.USER_OFFLINE, {
          userId,
          timestamp: new Date().toISOString()
        });
        console.log(`⚫ User ${userId} is now OFFLINE`);
      }
    }
    console.log(`❌ Socket ${socket.id} disconnected from user ${userId}`);
  });
};

module.exports.userSockets = userSockets;