#!/usr/bin/env python3
"""로컬 개발 서버 — ES Module MIME 타입 강제 설정"""
import http.server
import os

MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
    '.wasm': 'application/wasm',
}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/':
            path = '/phaser.html'

        file_path = os.path.join(os.getcwd(), path.lstrip('/').replace('/', os.sep))

        if not os.path.isfile(file_path):
            self.send_response(404)
            self.end_headers()
            return

        ext = os.path.splitext(file_path)[1].lower()
        content_type = MIME.get(ext, 'application/octet-stream')

        with open(file_path, 'rb') as f:
            data = f.read()

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        status = args[1] if len(args) > 1 else '?'
        path = args[0] if args else '?'
        ext = os.path.splitext(path.split('?')[0])[1].lower()
        ct = MIME.get(ext, 'application/octet-stream')
        print(f'  [{status}] {path}  →  {ct}')

server = http.server.HTTPServer(('localhost', 8000), Handler)
print('서버 실행 중: http://localhost:8000/')
print('종료: Ctrl+C')
server.serve_forever()
