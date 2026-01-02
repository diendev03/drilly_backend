// src/sockets/socket.manager.js
let ioInstance = null;

// 🧱 Các room chuẩn hoá (có thể thêm tuỳ module)
const ROOM = Object.freeze({
  GLOBAL: "room:global", // toàn hệ thống
  USER: (userId) => `user:${userId}`, // sync dữ liệu user
  NOTIFY: (userId) => `notify:${userId}`, // thông báo riêng
  CONVERSATION: (id) => `conv:${id}`, // chat room
});

class SocketManager {
  static init(io) {
    ioInstance = io;
    console.log("✅ SocketManager initialized");
  }

  static get io() {
    if (!ioInstance) throw new Error("❌ SocketManager not initialized!");
    return ioInstance;
  }

  // --- JOIN ---
  static joinDefaultRooms(socket, userId) {
    socket.join(ROOM.GLOBAL);
    socket.join(ROOM.USER(userId));
    socket.join(ROOM.NOTIFY(userId));
    console.log(`🔌 User ${userId} joined rooms: ${ROOM.GLOBAL}, ${ROOM.USER(userId)}, ${ROOM.NOTIFY(userId)}`);
  }

  // --- EMIT ---
  static emitToGlobal(event, payload) {
    this.io.to(ROOM.GLOBAL).emit(event, payload);
  }

  static emitToUser(userId, event, payload) {
    console.log(`📤 Emitting ${event} to room ${ROOM.USER(userId)}`);
    this.io.to(ROOM.USER(userId)).emit(event, payload);
  }

  static emitToNotify(userId, event, payload) {
    this.io.to(ROOM.NOTIFY(userId)).emit(event, payload);
  }

  static emitToConversation(conversationId, event, payload) {
    this.io.to(ROOM.CONVERSATION(conversationId)).emit(event, payload);
  }
}

module.exports = { SocketManager, ROOM };