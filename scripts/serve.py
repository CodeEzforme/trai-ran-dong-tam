"""Local preview that builds on startup and returns a real 404 page."""
import argparse
import functools
import http.server
import os
import socketserver
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--dist',action='store_true')
parser.add_argument('--port',type=int,default=3000)
args=parser.parse_args()
if not args.dist:
    subprocess.check_call([sys.executable,str(ROOT/'scripts/build.py')],cwd=str(ROOT))
os.chdir(str(ROOT/'dist'))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map={**http.server.SimpleHTTPRequestHandler.extensions_map,'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.json':'application/json'}
    def send_error(self,code,message=None,explain=None):
        if code==404:
            page=(ROOT/'dist/404.html').read_bytes()
            self.send_response(404);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(page)));self.end_headers()
            if self.command!='HEAD':self.wfile.write(page)
        else:super().send_error(code,message,explain)

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address=True

with Server(('127.0.0.1',args.port),Handler) as server:
    print('Dong Tam preview: http://localhost:'+str(args.port),flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
