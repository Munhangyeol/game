// 간단한 로컬 개발 서버 — ES 모듈 MIME 타입 지원
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.wav':  'audio/wav',
    '.mp3':  'audio/mpeg',
    '.ogg':  'audio/ogg',
    '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/phaser.html';

    const filePath = path.join(ROOT, urlPath);

    // 경로 탈출 방지
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500);
            res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
            return;
        }
        const ext  = path.extname(filePath).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': mime,
            'Cache-Control': 'no-cache',
        });
        res.end(data);
        console.log(`[${new Date().toLocaleTimeString()}] 200 ${req.url}`);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n🎮 MapleQuest RPG 개발 서버 시작`);
    console.log(`   http://localhost:${PORT}/phaser.html\n`);
});
