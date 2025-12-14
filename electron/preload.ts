import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string, encoding?: string) => ipcRenderer.invoke('write-file', path, content, encoding),
  copyFile: (source: string, dest: string) => ipcRenderer.invoke('copy-file', source, dest),
  deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
  deleteDirectory: (path: string) => ipcRenderer.invoke('delete-directory', path),
  ensureDir: (path: string) => ipcRenderer.invoke('ensure-dir', path),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  getFileUrl: (path: string) => ipcRenderer.invoke('get-file-url', path),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
});

