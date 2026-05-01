const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = path.join(__dirname, "build/index.html");
  console.log("Loading React Build From:", startUrl);

  mainWindow.loadFile(startUrl);

  mainWindow.on("closed", () => {
    mainWindow = null;

    if (backendProcess) {
      backendProcess.kill();
    }
  });
}

app.whenReady().then(() => {
  const backendPath = path.join(__dirname, "api/index.js");
  console.log("Backend Path:", backendPath);

  backendProcess = spawn(
    process.execPath,
    [backendPath],
    {
      shell: false,
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    }
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`Backend Error: ${data}`);
  });

  // small delay so backend starts first
  setTimeout(() => {
    createWindow();
  }, 3000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});