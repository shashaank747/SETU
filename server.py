import http.server
import socketserver
import os
import sys
import mimetypes
import threading
import time
import json
import socket
import urllib.parse

# Set correct MIME types for Windows
mimetypes.init()
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')

PORT_STUDENT = 5500

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
STUDENT_DIR = os.path.join(ROOT_DIR, 'Student')

# In-memory session store for dual-cam proctoring telemetry and signals
PROCTOR_SESSIONS = {}
PROCTOR_FRAMES = {}

def get_lan_ip():
    """Detect LAN IP address for QR code mobile phone scanning on the same Wi-Fi."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return '127.0.0.1'

class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

# Main Student Portal Handler
class StudentPortalHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path

        # API: Get LAN IP & protocol for dynamic QR code rendering
        if clean_path == '/api/lan-ip':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            data = {'ip': get_lan_ip(), 'port': PORT_STUDENT, 'protocol': 'http'}
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return

        # API: Get Proctoring Session Telemetry / Status
        if clean_path == '/api/proctor/status':
            query = urllib.parse.parse_qs(parsed.query)
            session_id = query.get('session', [''])[0]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            session_data = PROCTOR_SESSIONS.get(session_id, {'status': 'WAITING', 'connected': False})
            self.wfile.write(json.dumps(session_data).encode('utf-8'))
            return

        # API: Get Latest Mobile Video Frame
        if clean_path == '/api/proctor/frame':
            query = urllib.parse.parse_qs(parsed.query)
            session_id = query.get('session', [''])[0]
            frame_data = PROCTOR_FRAMES.get(session_id, '')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'frame': frame_data, 'time': time.time()}).encode('utf-8'))
            return

        # Standard static file handling
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path

        # API: Stream video frame from mobile
        if clean_path == '/api/proctor/frame':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_len).decode('utf-8')
                payload = json.loads(body) if body else {}
                session_id = payload.get('sessionId', 'default')
                frame = payload.get('frame', '')
                if frame:
                    PROCTOR_FRAMES[session_id] = frame
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return

        # API: Receive Proctoring Signals & Telemetry from Mobile / Desktop
        if clean_path == '/api/proctor/signal':
            try:
                content_len = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_len).decode('utf-8')
                payload = json.loads(body) if body else {}

                session_id = payload.get('sessionId', 'default')
                if session_id not in PROCTOR_SESSIONS:
                    PROCTOR_SESSIONS[session_id] = {
                        'sessionId': session_id,
                        'connected': True,
                        'status': 'CONNECTED',
                        'lastSeen': time.time(),
                        'events': []
                    }

                curr = PROCTOR_SESSIONS[session_id]
                curr['lastSeen'] = time.time()
                curr['status'] = payload.get('status', payload.get('type', curr.get('status')))
                curr['lastEvent'] = payload
                curr['events'].append({'time': time.time(), 'event': payload})

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'session': curr}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return

        return super().do_GET()

    def translate_path(self, path):
        clean_path = path.split('?', 1)[0].split('#', 1)[0]

        if clean_path in ('/', ''):
            return os.path.join(STUDENT_DIR, 'dashboard.html')

        if clean_path.startswith('/Student/'):
            sub_path = clean_path[len('/Student/'):]
            if not sub_path or sub_path == 'index.html':
                return os.path.join(STUDENT_DIR, 'dashboard.html')
            target = os.path.join(STUDENT_DIR, sub_path.replace('/', os.sep))
            if os.path.exists(target):
                return target

        rel = clean_path.lstrip('/')
        student_target = os.path.join(STUDENT_DIR, rel.replace('/', os.sep))
        if os.path.exists(student_target):
            return student_target

        root_target = os.path.join(ROOT_DIR, rel.replace('/', os.sep))
        if os.path.exists(root_target):
            return root_target

        return student_target

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
            pass

    def log_message(self, format, *args):
        sys.stdout.write(f"[SETU {self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

def start_server_thread(host, port, handler, label):
    try:
        httpd = ReusableTCPServer((host, port), handler)
        t = threading.Thread(target=httpd.serve_forever, daemon=True)
        t.start()
        return httpd, port
    except OSError as e:
        sys.stderr.write(f"Could not bind {label} to port {port}: {e}\n")
        return None, None

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

    lan_ip = get_lan_ip()

    # Start Student ERP Server on 0.0.0.0 (Port 5500)
    student_server, p_student = start_server_thread('0.0.0.0', PORT_STUDENT, StudentPortalHandler, 'SETU Student Portal')

    print("==================================================================")
    print("  SETU CampusOS - Student ERP Server Running")
    print("==================================================================")
    print(f"  🌐 [LOCAL WI-FI IP] : http://{lan_ip}:{PORT_STUDENT}")
    print("------------------------------------------------------------------")
    if p_student:
        print(f"  [STUDENT ERP] (Port {p_student})")
        print(f"     Dashboard   : http://localhost:{p_student}/Student/dashboard.html")
        print(f"     Timetable   : http://localhost:{p_student}/Student/timetable.html")
        print(f"     Assessments : http://localhost:{p_student}/Student/assessments.html")
        print(f"     Mobile Link : http://{lan_ip}:{p_student}/Student/mobile_proctor.html")
    print("==================================================================")
    sys.stdout.flush()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down server...")
        if student_server: student_server.shutdown()
