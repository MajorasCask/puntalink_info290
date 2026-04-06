const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function resolvePath(rootDir, requestPath) {
  const cleanedPath = requestPath.split('?')[0].split('#')[0];
  const normalized = path.normalize(cleanedPath).replace(/^([.][.][/\\])+/, '');
  const withoutLeadingSlash = normalized.replace(/^[/\\]+/, '');
  const relativePath = withoutLeadingSlash === '' ? 'index.html' : withoutLeadingSlash;
  return path.join(rootDir, relativePath);
}

function createStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const filePath = resolvePath(rootDir, req.url || '/');

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });

  return {
    listen(port) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, () => {
          const address = server.address();
          resolve(typeof address === 'object' && address ? address.port : port);
        });
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
  };
}

module.exports = { createStaticServer };
