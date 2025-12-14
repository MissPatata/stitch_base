import { app, BrowserWindow, ipcMain, shell, dialog, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Resolve paths to user data directory to ensure write access
const resolvePath = (filePath: string) => {
  if (filePath.startsWith('./')) {
    return path.join(app.getPath('userData'), filePath.slice(2));
  }
  return filePath;
};

const createWindow = () => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
    if (isDev) {
      // In dev, try to reload after a short delay
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 1000);
    }
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// IPC Handlers
ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const fullPath = resolvePath(filePath);
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error: any) {
    // Return empty string or null if file doesn't exist (matching localStorage behavior)
    if (error.code !== 'ENOENT') {
      console.error(`Error reading file ${filePath}:`, error);
    }
    return null;
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string, encoding: string = 'utf-8') => {
  const fullPath = resolvePath(filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  
  if (encoding === 'base64') {
    // Write binary data from base64
    const buffer = Buffer.from(content, 'base64');
    await fs.writeFile(fullPath, buffer);
  } else {
    // Write text data
    await fs.writeFile(fullPath, content, encoding as BufferEncoding);
  }
});

ipcMain.handle('copy-file', async (_, source: string, dest: string) => {
  const fullDest = resolvePath(dest);
  await fs.mkdir(path.dirname(fullDest), { recursive: true });
  await fs.copyFile(source, fullDest);
});

ipcMain.handle('delete-file', async (_, filePath: string) => {
  const fullPath = resolvePath(filePath);
  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    // ENOENT means file doesn't exist, which is fine - it's already deleted
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
});

ipcMain.handle('delete-directory', async (_, dirPath: string) => {
  const fullPath = resolvePath(dirPath);
  try {
    await fs.rm(fullPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error);
  }
});

ipcMain.handle('ensure-dir', async (_, dirPath: string) => {
  const fullPath = resolvePath(dirPath);
  await fs.mkdir(fullPath, { recursive: true });
});

ipcMain.handle('open-path', async (_, filePath: string) => {
  const fullPath = resolvePath(filePath);
  console.log('Opening path:', fullPath);
  try {
    await shell.openPath(fullPath);
    console.log('Successfully opened path');
  } catch (error) {
    console.error('Error opening path:', error);
    throw error;
  }
});

// Get file URL for displaying images/files in the renderer
ipcMain.handle('get-file-url', async (_, filePath: string) => {
  // filePath is already like "./data/designs/xxx/image.jpg"
  // Return it with the local:// protocol prefix
  // The protocol handler will resolve it
  return `local://${filePath}`;
});

ipcMain.handle('show-open-dialog', async (_, options) => {
  const result = await dialog.showOpenDialog(options);
  return result.canceled ? null : result.filePaths;
});

// Get user data directory path
ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData');
});

// Register custom protocol for serving local files
function registerLocalProtocol() {
  protocol.registerFileProtocol('local', (request, callback) => {
    try {
      // Remove protocol prefix (local://)
      let filePath = request.url.replace('local://', '');
      // Decode URI component
      filePath = decodeURIComponent(filePath);
      
      const fullPath = resolvePath(filePath);
      
      // Check if file exists and return it
      fs.access(fullPath)
        .then(() => {
          callback({ path: fullPath });
        })
        .catch((error) => {
          // File doesn't exist - this is expected for deleted files
          // Return a 404 error so the browser can handle it (show placeholder)
          console.warn(`File not found (this is OK for deleted files): ${fullPath}`);
          callback({ error: -6 }); // FILE_NOT_FOUND
        });
    } catch (error) {
      console.error('Error in protocol handler:', error, request.url);
      callback({ error: -2 }); // FAILED
    }
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Register custom protocol before creating window
  try {
    registerLocalProtocol();
    console.log('Custom protocol "local" registered successfully');
  } catch (error) {
    console.error('Failed to register custom protocol:', error);
  }
  
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

