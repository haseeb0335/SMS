const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true,
    },
  });

  // For offline mode, we load the production build of your React app
  // Ensure your React "build" folder is copied into the backend directory
  mainWindow.loadFile(path.join(__dirname, 'build/index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
    // Kill the backend process when the window closes so the port is released
    if (backendProcess) backendProcess.kill();
  });
}

app.whenReady().then(() => {
  // ✅ IMPORTANT: Start the backend using the relative path to your index.js
  backendProcess = spawn('node', [path.join(__dirname, 'api/index.js')], {
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));

  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});