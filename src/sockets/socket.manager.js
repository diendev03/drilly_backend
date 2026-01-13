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

  // Smart emit: emit to conv room if user is there, otherwise emit to user room
  static async emitToConversationOrUser(conversationId, userId, event, payload) {
    const convRoom = ROOM.CONVERSATION(conversationId);
    const userRoom = ROOM.USER(userId);

    // Get sockets in the conv room
    const socketsInConvRoom = await this.io.in(convRoom).fetchSockets();
    const userInConvRoom = socketsInConvRoom.some(socket => socket.rooms.has(userRoom));

    if (userInConvRoom) {
      // User is already in conv room, don't emit again (they'll get it from conv broadcast)
      console.log(`📤 User ${userId} in conv:${conversationId}, skipping user room emit`);
    } else {
      // User is NOT in conv room, emit to user room
      console.log(`📤 User ${userId} NOT in conv:${conversationId}, emitting to user room`);
      this.io.to(userRoom).emit(event, payload);
    }
  }
}

module.exports = { SocketManager, ROOM };