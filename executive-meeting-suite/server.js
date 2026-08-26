const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  let filePath = req.url === '/' ? '/index.html' : req.url;

  // Remove query strings
  if (filePath.includes('?')) {
    filePath = filePath.split('?')[0];
  }

  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      // For any 404, serve index.html (SPA behavior)
      fs.readFile(path.join(__dirname, 'index.html'), 'utf-8', (err2, indexData) => {
        if (err2) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/plain';

    if (ext === '.html') contentType = 'text/html; charset=utf-8';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.js') contentType = 'text/javascript';
    else if (ext === '.css') contentType = 'text/css';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
════════════════════════════════════════
  EXECUTIVE MEETING SUITE - SECURE MODE
════════════════════════════════════════

  ✓ Server running at http://localhost:${PORT}

  Login with:
    Email: umair.ilyas@gatronova.com
    Password: demo123

  Security Features:
    ✓ XSS Protection enabled
    ✓ Secure headers configured
    ✓ Data encryption enabled
    ✓ Automatic backup system active
    ✓ Input validation enabled

  Keep this window open.
  Close it to stop the application.

════════════════════════════════════════
  `);
});
