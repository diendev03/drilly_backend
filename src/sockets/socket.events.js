// src/sockets/socketEvents.js
module.exports = Object.freeze({
  // 🔗 Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // 💬 Chat
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  UPDATE_LAST_MESSAGE: "update_last_message",
  TYPING: "typing",
  MESSAGE_READ: "message_read",

  // 🔔 Notification
  NOTIFY: "notify",

  // 👤 User Status
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",

  // 👥 Follow/Block
  FOLLOW_UPDATE: "follow_update",
  BLOCK_UPDATE: "block_update",

  // 💰 Transaction
  TRANSACTION_CREATED: "transaction_created",
  TRANSACTION_UPDATED: "transaction_updated",
  TRANSACTION_DELETED: "transaction_deleted",
  BALANCE_UPDATED: "balance_updated",
  CHART_UPDATED: "chart_updated",
  WALLETS_UPDATED: "wallets_updated",

  // 📂 Category
  CATEGORY_CREATED: "category_created",
  CATEGORY_UPDATED: "category_updated",
  CATEGORY_DELETED: "category_deleted",

  // 📞 Agora Call (Simplified - No WebRTC SDP/ICE)
  CALL_USER: "call_user",       // Request call with channelName
  CALL_MADE: "call_made",       // Incoming to Receiver
  CALL_ACCEPTED: "call_accepted", // Callee accepted
  CALL_REJECTED: "call_rejected",
  CALL_ENDED: "call_ended",
});