#!/usr/bin/env python3
"""
Local preview server for the PearlOxy site.

    python serve.py            # http://localhost:5173

Plain static files, plus two conveniences the stock http.server lacks:
  * no-store headers, so a rebuild always shows up on reload
  * clean URLs: /about/ resolves to about/index.html
"""

import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "200" not in (args[1] if len(args) > 1 else ""):
            super().log_message(fmt, *args)


class Server(socketserver.ThreadingTCPServer):
    # Threaded: a browser holding a keep-alive connection must not block
    # every other request.
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("", PORT), Handler) as httpd:
        print("PearlOxy preview running at http://localhost:%d" % PORT)
        print("Serving %s  (Ctrl+C to stop)" % ROOT)
        httpd.serve_forever()
