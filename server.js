/**
 * EcoVision AI – Node.js Single Server Platform Launcher
 * Spawns both backend (FastAPI) and unified frontend (Next.js) as a single application.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend', 'landing-page');

// Determine Python path
let pythonPath = path.join(BACKEND_DIR, '.venv', 'Scripts', 'python.exe');
if (!fs.existsSync(pythonPath)) {
  pythonPath = path.join(BACKEND_DIR, '.venv', 'bin', 'python');
}
if (!fs.existsSync(pythonPath)) {
  pythonPath = 'python';
}

console.log('='.repeat(68));
console.log('🌍 EcoVision AI – Single Server Platform Launcher (Node.js)');
console.log('='.repeat(68));
console.log(`[Launcher] Python Path : ${pythonPath}`);
console.log(`[Launcher] Frontend App: ${FRONTEND_DIR}`);
console.log('-'.repeat(68));

// 1. Start FastAPI Backend
console.log('[Launcher] Starting FastAPI Core Engine on 127.0.0.1:8000...');
const backendProc = spawn(pythonPath, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
});

// 2. Start Next.js Frontend
console.log('[Launcher] Starting Unified Next.js Application on port 3000...');
const frontendProc = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: FRONTEND_DIR,
  stdio: 'inherit',
  shell: true,
});

console.log('-'.repeat(68));
console.log('🚀 FULL ECOVISION AI PLATFORM RUNNING AT:');
console.log('   👉 Unified Application : http://localhost:3000');
console.log('   👉 Citizen Portal      : http://localhost:3000/citizen');
console.log('   👉 Municipal Dashboard : http://localhost:3000/dashboard');
console.log('   👉 Interactive API Docs: http://localhost:3000/docs');
console.log('   👉 Backend Healthcheck : http://localhost:3000/api/health');
console.log('-'.repeat(68));
console.log('Press Ctrl+C to stop all services.');
console.log('='.repeat(68) + '\n');

function shutdown() {
  console.log('\n[EcoVision AI] Stopping services...');
  if (process.platform === 'win32') {
    if (backendProc.pid) spawn('taskkill', ['/F', '/T', '/PID', backendProc.pid]);
    if (frontendProc.pid) spawn('taskkill', ['/F', '/T', '/PID', frontendProc.pid]);
  } else {
    backendProc.kill('SIGTERM');
    frontendProc.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
