import os
import subprocess
import time
import sys
import threading
from urllib.error import URLError
import urllib.request

def check_requirements():
    print("Checking backend dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
    print("Checking launcher dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview"])

def start_backend():
    print("Starting FastAPI backend...")
    env = os.environ.copy()
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd="backend",
        env=env
    )
    return backend_process

def serve_frontend_static():
    # If built, we can just use a simple python http server to serve the dist folder
    print("Serving Vite frontend static files...")
    if not os.path.exists("frontend/dist"):
        print("Error: frontend/dist not found. Please run 'npm run build' inside frontend/")
        sys.exit(1)
        
    frontend_process = subprocess.Popen(
        [sys.executable, "-m", "http.server", "5173"],
        cwd="frontend/dist"
    )
    return frontend_process

def wait_for_server(url, timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            urllib.request.urlopen(url)
            return True
        except URLError:
            time.sleep(0.5)
    return False

def main():
    # Must wait for import until after check_requirements installs it
    check_requirements()
    import webview
    
    # Check if built, if not provide warning
    if not os.path.exists("frontend/dist"):
         print("Building frontend, please wait...")
         subprocess.check_call("npm install && npm run build", cwd="frontend", shell=True)
    
    backend = start_backend()
    frontend = serve_frontend_static()
    
    print("Waiting for servers to initialize...")
    wait_for_server("http://127.0.0.1:5173")
    # Wait for backend specifically if needed
    
    try:
        print("Opening Webview Window...")
        window = webview.create_window(
            'Realtime Dance Aesthetics', 
            'http://127.0.0.1:5173',
            width=1400, 
            height=900,
            background_color='#0F172A',
            resizable=True
        )
        webview.start()
    except Exception as e:
        print(f"Error starting webview: {e}")
    finally:
        print("Shutting down servers...")
        backend.terminate()
        frontend.terminate()

if __name__ == '__main__':
    main()
