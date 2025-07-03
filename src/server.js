const { spawn } = require('child_process');
const path = require('path');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Đường dẫn tuyệt đối đến cloudflared.exe
const tunnelPath = '"C:\\Program Files\\cloudflared\\cloudflared.exe"'; // phải thêm dấu " "

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);

  // Dùng shell để chạy file có khoảng trắng trong đường dẫn
  const tunnel = spawn(`${tunnelPath} tunnel run drill-tunnel`, {
    shell: true
  });

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
