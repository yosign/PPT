// 启动方式: node server.js
// 然后浏览器打开 http://localhost:3737/ppt.html

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const PORT = 3737;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // POST /save — 保存 slides.json
  if (req.method === 'POST' && url.pathname === '/save') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        // 验证是合法 JSON
        JSON.parse(body);
        fs.writeFileSync(path.join(DIR, 'slides.json'), body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
        console.log(`[SAVE] slides.json updated`);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(`{"ok":false,"error":"${e.message}"}`);
      }
    });
    return;
  }

  // GET 静态文件
  let filePath = path.join(DIR, url.pathname === '/' ? '/ppt.html' : url.pathname);
  const ext = path.extname(filePath);

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }

}).listen(PORT, () => {
  console.log(`\n✅ 服务已启动: http://localhost:${PORT}/ppt.html`);
  console.log(`📝 演讲稿: http://localhost:${PORT}/script.html`);
  console.log(`\n中键点击任意幻灯片可编辑内容，保存后自动写入 slides.json\n`);
});
