#!/usr/bin/env python3
"""Local static server for previewing the portfolio viewer.

Avoids the stock `python3 -m http.server` CLI, which calls os.getcwd()
while building its argument parser — that syscall is blocked in some
sandboxed environments. This hardcodes the directory instead.
"""
import functools
import http.server
import socketserver

PORT = 4173
# Hardcoded on purpose: resolving this from __file__ would call os.path.abspath(),
# which falls back to os.getcwd() for relative paths — the exact syscall that's
# blocked in the sandboxed preview process this script works around.
DIRECTORY = "/Users/inpix/Desktop/portfolio-viewer"

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIRECTORY)


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ReusableTCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {DIRECTORY} at http://localhost:{PORT}")
        httpd.serve_forever()
