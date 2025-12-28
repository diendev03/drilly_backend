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
});