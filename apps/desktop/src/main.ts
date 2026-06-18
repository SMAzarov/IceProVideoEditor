import { app, BrowserWindow, Menu, shell } from "electron";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function getDemoUrl(): string {
  if (isDev) {
    // In development, demo runs on localhost:3000
    return "http://localhost:3000";
  }
  // In production, load the static export from extraResources
  const resourcesPath = process.resourcesPath;
  const demoPath = path.join(resourcesPath, "demo/out/index.html");
  console.log("[Kutlass Desktop] resourcesPath:", resourcesPath);
  console.log("[Kutlass Desktop] demoPath:", demoPath);
  return demoPath;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    title: "Kutlass Video Editor",
    backgroundColor: "#09090b",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  const url = getDemoUrl();

  if (isDev) {
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(url);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── Application Menu ──────────────────────────────────────────────────────────

function createMenu(): void {
  const isMac = process.platform === "darwin";
  const template: Electron.MenuItemConstructorOptions[] = [];

  // App menu (macOS only)
  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  // File
  template.push({
    label: "File",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  });

  // Edit
  template.push({
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  });

  // View
  template.push({
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  });

  // Window
  const windowSubmenu: Electron.MenuItemConstructorOptions[] = [
    { role: "minimize" },
    { role: "zoom" },
  ];
  if (isMac) {
    windowSubmenu.push(
      { type: "separator" },
      { role: "front" },
      { type: "separator" },
      { role: "window" }
    );
  } else {
    windowSubmenu.push({ role: "close" });
  }
  template.push({
    label: "Window",
    submenu: windowSubmenu,
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ── Handle external links ─────────────────────────────────────────────────────

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
});
