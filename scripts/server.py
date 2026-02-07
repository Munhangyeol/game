#!/usr/bin/env python3
"""
MapleQuest RPG - HTTP Server with correct MIME types for ES6 modules
"""
import http.server
import socketserver
import os
import sys

# Windows 콘솔 인코딩 설정
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # ES6 모듈을 위한 MIME type 설정
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        """Override to set correct MIME types for JavaScript modules"""
        mimetype = super().guess_type(path)

        # .js 파일은 application/javascript로 설정
        if path.endswith('.js'):
            return 'application/javascript'
        # .mjs 파일도 지원
        elif path.endswith('.mjs'):
            return 'application/javascript'

        return mimetype

    def log_message(self, format, *args):
        """로그 메시지 간소화"""
        pass  # 로그 출력 생략 (조용한 모드)

# 서버 시작 디렉토리를 게임 루트로 설정
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("=" * 60)
    print("MapleQuest RPG Server")
    print("=" * 60)
    print(f"Server running at: http://localhost:{PORT}")
    print(f"Serving directory: {os.getcwd()}")
    print("")
    print("Open in browser:")
    print(f"   http://localhost:{PORT}/public/index.html")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
