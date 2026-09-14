#!/usr/bin/env python3
"""
ADJP Creative — Local Development Server
Supports clean URLs (e.g. /about -> about.html) with correct text/html MIME types.
Usage:
    python3 serve.py [port]
"""

import http.server
import mimetypes
import os
import sys

# Ensure .html MIME type is registered
mimetypes.add_type('text/html', '.html')

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean_path = super().translate_path(path)
        if not os.path.exists(clean_path):
            html_candidate = clean_path.rstrip('/') + '.html'
            if os.path.isfile(html_candidate):
                return html_candidate
        return clean_path

    def end_headers(self):
        if self.path.endswith(('.html', '.css', '.js')) or '.' not in self.path:
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, CleanURLHandler)
    print("=" * 60)
    print(f"  ADJP Creative local server running at:")
    print(f"  --> http://localhost:{port}/")
    print(f"  Clean URLs (/about, /contact, etc.) are enabled.")
    print("  Press Ctrl+C to stop.")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()
