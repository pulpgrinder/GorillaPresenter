#!/usr/bin/env python3
"""Minimal server that serves only dist/index.html."""

import http.server
import os
import socketserver

PORT = 8042
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
INDEX_FILE = os.path.join(DIST_DIR, "index.html")


class SingleFileHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(INDEX_FILE, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Not found")

    def log_message(self, format, *args):
        # Silence per-request logs; remove this override if you want them.
        pass


if __name__ == "__main__":
    if not os.path.isfile(INDEX_FILE):
        print(f"Error: {INDEX_FILE} not found. Run the build first.")
        raise SystemExit(1)

    with socketserver.TCPServer(("", PORT), SingleFileHandler) as httpd:
        print(f"Server started. Connect to http://localhost:{PORT} to test.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
