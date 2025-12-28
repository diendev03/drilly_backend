const jwt = require("jsonwebtoken");
const { SocketManager } = require("./socket.manager");
const { userSockets } = require("./chat.socket");

/**
 * 🔔 Socket thông báo realtime
 */
module.exports = (io, socket) => {
  console.log(`🔔 Notify socket initialized for ${socket.id}`);

  // --- Xác thực user ---
  const token = socket.handshake.headers.authorization?.split(" ")[1];
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.account_id;

      if (userId) {
        if (!userSockets.has(userId)) userSockets.set(userId, new Set());
        userSockets.get(userId).add(socket.id);

        // ✅ Join các room mặc định liên quan đến notify
        SocketManager.joinDefaultRooms(socket, userId);
        socket.join(`notify:${userId}`);

        console.log(`📢 User ${userId} joined notify room`);
      }
    } catch (err) {
      console.warn("⚠️ Invalid token in notify socket handshake");
    }
  }

  /**
   * 📨 Khi backend muốn push thông báo tới user
   * data = { userId, title, message, type }
   */
  socket.on("send_notify", (data) => {
    if (!data?.userId) return;
    console.log(`📨 Send notify to user ${data.userId}: ${data.title}`);

    SocketManager.emitToUser(data.userId, "receive_notify", {
      title: data.title,
      message: data.message,
      type: data.type || "info",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * ✅ Khi client đánh dấu thông báo đã đọc
   */
  socket.on("mark_notify_read", (data) => {
    console.log(`👁️ User ${userId} marked notify read: ${JSON.stringify(data)}`);
    // Có thể cập nhật DB tại đây nếu cần
  });

  /**
   * 🔌 Khi disconnect
   */
  socket.on("disconnect", () => {
    if (userId && userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);
      if (userSockets.get(userId).size === 0) userSockets.delete(userId);
    }
    console.log(`❌ Notify socket ${socket.id} disconnected for user ${userId}`);
  });
};