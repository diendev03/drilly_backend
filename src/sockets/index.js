const { Server } = require("socket.io");
const { SocketManager } = require("./socket.manager");
const chatSocket = require("./chat.socket");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for Desktop app support
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"], // Add polling fallback for web
    pingInterval: 5000,
    pingTimeout: 10000,
  });

  // ✅ Khởi tạo SocketManager 1 lần
  SocketManager.init(io);

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };