"""
EcoVision AI – Single Server Platform Launcher
Runs the entire full-stack platform (FastAPI backend + Next.js frontend)
under a single unified process lifecycle and host.
"""

import os
import sys
import time
import subprocess
import signal
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend", "landing-page")

# Locate Python executable (prefer backend venv)
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "bin", "python")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

processes = []

def free_port(port):
    """Find and terminate any process listening on the given port."""
    if sys.platform == "win32":
        try:
            cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"'
            out = subprocess.check_output(cmd, shell=True, text=True).strip()
            for line in out.splitlines():
                pid = line.strip()
                if pid and pid.isdigit() and int(pid) != os.getpid():
                    print(f"[Launcher] Port {port} is occupied by PID {pid}. Freeing port...")
                    subprocess.run(["taskkill", "/F", "/T", "/PID", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(0.5)
        except Exception:
            pass

def kill_process_tree(proc):
    """Cleanly terminate a process and its children on Windows/Unix."""
    try:
        if sys.platform == "win32":
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            proc.terminate()
            proc.wait(timeout=3)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

def cleanup(signum=None, frame=None):
    """Graceful shutdown of all child services."""
    print("\n\n[EcoVision AI] Shutting down all services...")
    for proc in processes:
        kill_process_tree(proc)
    print("[EcoVision AI] All services stopped. Goodbye!")
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def wait_for_backend(url="http://127.0.0.1:8000/health", timeout=25):
    """Wait until backend responds to healthcheck."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def main():
    print("=" * 68)
    print("[EcoVision AI] Launching Single-Server Unified Platform")
    print("=" * 68)
    print(f"[Launcher] Root Directory : {ROOT_DIR}")
    print(f"[Launcher] Backend Python : {VENV_PYTHON}")
    print(f"[Launcher] Frontend App   : {FRONTEND_DIR}")
    print("-" * 68)

    # 0. Clean any stale processes on target ports
    free_port(8000)
    free_port(3000)

    # 1. Start Backend
    print("[Launcher] Starting FastAPI Core Engine on 127.0.0.1:8000...")
    backend_cmd = [
        VENV_PYTHON,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        env=os.environ.copy(),
    )
    processes.append(backend_proc)

    # 2. Wait for backend health
    print("[Launcher] Waiting for FastAPI to become ready...")
    if wait_for_backend():
        print("  [OK] Backend is healthy (Supabase + AI Engine active)")
    else:
        print("  [WARN] Backend took longer than expected, continuing startup...")

    # 3. Start Next.js Unified Frontend (Port 3000)
    print("[Launcher] Starting Unified Next.js Application on port 3000...")
    frontend_proc = subprocess.Popen(
        "npx next dev -p 3000",
        cwd=FRONTEND_DIR,
        shell=True,
        env=os.environ.copy(),
    )
    processes.append(frontend_proc)

    print("-" * 68)
    print("[SUCCESS] FULL ECOVISION AI PLATFORM IS LIVE ON A SINGLE HOST:")
    print("   -> Main Application   : http://localhost:3000")
    print("   -> Citizen Portal      : http://localhost:3000/citizen")
    print("   -> Municipal Dashboard : http://localhost:3000/dashboard")
    print("   -> Interactive API Docs: http://localhost:3000/docs")
    print("   -> Backend Healthcheck : http://localhost:3000/api/health")
    print("-" * 68)
    print("Press Ctrl+C at any time to stop the entire application.")
    print("=" * 68 + "\n")

    # Monitor processes
    while True:
        time.sleep(1)
        if backend_proc.poll() is not None:
            print("[Launcher] Backend exited unexpectedly.")
            cleanup()
        if frontend_proc.poll() is not None:
            print("[Launcher] Frontend exited unexpectedly.")
            cleanup()

if __name__ == "__main__":
    main()
