const { spawn } = require('child_process');
const path = require('path');
const app = require('./app');
require('dotenv').config();
const sockets = require('./sockets');


const PORT = process.env.PORT || 3000;

// Đường dẫn tới cloudflared
const tunnelPath = '"C:\\Program Files\\cloudflared\\cloudflared.exe"';

// Tạo server
const server = app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);

  sockets.initSocket(server);

  // Cloudflare Tunnel
  const tunnel = spawn(`${tunnelPath} tunnel run drill-tunnel`, { shell: true });

  tunnel.stdout.on('data', (data) => {
    const text = data.toString();
    process.stdout.write(text);

    if (text.includes('Registered tunnel connection')) {
      console.log(`🌐 Cloudflare Tunnel đã kết nối!`);
      console.log(`➡️ API Public tại: https://drilly.io.vn`);
    }
  });

  tunnel.stderr.on('data', (data) => {
    const err = data.toString();
    if (err.toLowerCase().includes('error') || err.toLowerCase().includes('failed')) {
      console.error('❌ Tunnel lỗi thực sự:', err);
    } else {
      console.log(`[TUNNEL] ${err}`);
    }
  });

  tunnel.on('close', (code) => {
    console.warn(`⚠️ Tunnel kết thúc (mã: ${code})`);
  });
});

// ✅ Cấu hình timeout quan trọng
server.setTimeout(30 * 1000);         // timeout xử lý request
server.keepAliveTimeout = 60 * 1000;  // TCP giữ kết nối lâu hơn
server.headersTimeout = 65 * 1000;    // chờ headers từ client
