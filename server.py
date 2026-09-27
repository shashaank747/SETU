import http.server
import socketserver
import os
import sys
import mimetypes
import threading
import time

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
PORT_TRAINER = 5501
PORT_ADMIN = 5502

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
STUDENT_DIR = os.path.join(ROOT_DIR, 'Student')
TRAINER_DIR = os.path.join(ROOT_DIR, 'Trainer')
ADMIN_DIR = os.path.join(ROOT_DIR, 'Admin')

class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

# 1. Main Unified & Student Handler
class StudentPortalHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def translate_path(self, path):
        clean_path = path.split('?', 1)[0].split('#', 1)[0]

        # Root '/' -> serve Student/index.html
        if clean_path in ('/', ''):
            return os.path.join(STUDENT_DIR, 'index.html')

        # /gateway or /portal -> serve root index.html
        if clean_path in ('/gateway', '/gateway.html', '/portal', '/portal.html'):
            return os.path.join(ROOT_DIR, 'index.html')

        # /Admin or /Admin/ -> serve Admin/index.html
        if clean_path in ('/Admin', '/Admin/'):
            return os.path.join(ADMIN_DIR, 'index.html')

        # /Trainer or /Trainer/ -> serve Trainer/index.html
        if clean_path in ('/Trainer', '/Trainer/'):
            return os.path.join(TRAINER_DIR, 'index.html')

        # If path explicitly starts with /Student/
        if clean_path.startswith('/Student/'):
            sub_path = clean_path[len('/Student/'):]
            if not sub_path or sub_path == 'index.html':
                return os.path.join(STUDENT_DIR, 'index.html')
            target = os.path.join(STUDENT_DIR, sub_path.replace('/', os.sep))
            if os.path.exists(target):
                return target

        # If requested relative path exists in Student/
        rel = clean_path.lstrip('/')
        student_target = os.path.join(STUDENT_DIR, rel.replace('/', os.sep))
        if os.path.exists(student_target):
            return student_target

        # Fallback to root directory (for Admin, Trainer, root assets, etc.)
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
        sys.stdout.write(f"[PORTAL {self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

# 2. Dedicated Portal Handler Factory (for Trainer ERP and Admin ERP)
def make_dedicated_handler(portal_name, portal_dir):
    class DedicatedPortalHandler(http.server.SimpleHTTPRequestHandler):
        protocol_version = "HTTP/1.0"

        def end_headers(self):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Access-Control-Allow-Origin', '*')
            super().end_headers()

        def translate_path(self, path):
            clean_path = path.split('?', 1)[0].split('#', 1)[0]

            # Root '/' -> serve portal's index.html
            if clean_path in ('/', ''):
                return os.path.join(portal_dir, 'index.html')

            # If path prefixed with self folder name e.g. /Trainer/ or /Admin/
            prefix = f'/{portal_name}/'
            if clean_path.startswith(prefix):
                sub = clean_path[len(prefix):]
                if not sub or sub == 'index.html':
                    return os.path.join(portal_dir, 'index.html')
                target = os.path.join(portal_dir, sub.replace('/', os.sep))
                if os.path.exists(target):
                    return target

            # Check inside portal dir
            rel = clean_path.lstrip('/')
            target = os.path.join(portal_dir, rel.replace('/', os.sep))
            if os.path.exists(target):
                return target

            # Fallback to root dir
            root_target = os.path.join(ROOT_DIR, rel.replace('/', os.sep))
            if os.path.exists(root_target):
                return root_target

            return target

        def copyfile(self, source, outputfile):
            try:
                super().copyfile(source, outputfile)
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
                pass

        def log_message(self, format, *args):
            sys.stdout.write(f"[{portal_name.upper()} {self.log_date_time_string()}] {format % args}\n")
            sys.stdout.flush()

    return DedicatedPortalHandler

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

    # Start Unified Server on 5500
    unified_server, p_unified = start_server_thread('127.0.0.1', PORT_STUDENT, StudentPortalHandler, 'Student & Gateway')

    # Start Dedicated Trainer ERP Server on 5501
    trainer_handler = make_dedicated_handler('Trainer', TRAINER_DIR)
    trainer_server, p_trainer = start_server_thread('127.0.0.1', PORT_TRAINER, trainer_handler, 'Trainer ERP')

    # Start Dedicated Admin ERP Server on 5502
    admin_handler = make_dedicated_handler('Admin', ADMIN_DIR)
    admin_server, p_admin = start_server_thread('127.0.0.1', PORT_ADMIN, admin_handler, 'Admin ERP')

    print("=======================================================")
    print("  SETU CampusOS - Multi-ERP Local Development Servers")
    print("=======================================================")
    if p_trainer:
        print(f"  [TRAINER ERP] (Dedicated Server: Port {p_trainer})")
        print(f"     Dashboard:   http://localhost:{p_trainer}/dashboard.html")
        print(f"     Portal Home: http://localhost:{p_trainer}/")
        print(f"     Login:       http://localhost:{p_trainer}/login.html")
        print(f"     Proctoring:  http://localhost:{p_trainer}/assessments.html")
        print(f"     Grading:     http://localhost:{p_trainer}/assignments.html")
        print(f"     Studio:      http://localhost:{p_trainer}/Class_recordings.html")
        print("-------------------------------------------------------")
    if p_admin:
        print(f"  [ADMIN ERP] (Dedicated Server: Port {p_admin})")
        print(f"     Dashboard:   http://localhost:{p_admin}/dashboard.html")
        print(f"     Portal Home: http://localhost:{p_admin}/")
        print(f"     Login:       http://localhost:{p_admin}/login.html")
        print(f"     Bio-Vault:   http://localhost:{p_admin}/assessments.html")
        print(f"     Governance:  http://localhost:{p_admin}/assignments.html")
        print(f"     Archive:     http://localhost:{p_admin}/Class_recordings.html")
        print("-------------------------------------------------------")
    if p_unified:
        print(f"  [STUDENT ERP & GATEWAY] (Port {p_unified})")
        print(f"     Student Dash: http://localhost:{p_unified}/dashboard.html")
        print(f"     Multi-Gateway:http://localhost:{p_unified}/gateway.html")
        print("-------------------------------------------------------")
        print(f"  [ALL ERPs UNIFIED ROUTING ON PORT {p_unified}]")
        print(f"     Trainer ERP: http://localhost:{p_unified}/Trainer/dashboard.html")
        print(f"     Admin ERP:   http://localhost:{p_unified}/Admin/dashboard.html")
        print(f"     Student ERP: http://localhost:{p_unified}/Student/dashboard.html")
    print("=======================================================")
    print(f"All servers running. Listening on ports 5500, 5501, 5502...")
    sys.stdout.flush()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down all servers...")
        if unified_server: unified_server.shutdown()
        if trainer_server: trainer_server.shutdown()
        if admin_server: admin_server.shutdown()
