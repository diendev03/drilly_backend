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

  // 🔔 Notification
  NOTIFY: "notify",

  // 💰 Transaction
  TRANSACTION_CREATED: "transaction_created",
  TRANSACTION_UPDATED: "transaction_updated",
  TRANSACTION_DELETED: "transaction_deleted",
  BALANCE_UPDATED: "balance_updated",
  CHART_UPDATED: "chart_updated",

  // 📂 Category
  CATEGORY_CREATED: "category_created",
  CATEGORY_UPDATED: "category_updated",
  CATEGORY_DELETED: "category_deleted",
});