const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer');

contextBridge.exposeInMainWorld('electron', {
  generatePdf: (urls: string[]) => ipcRenderer.invoke('generatePdf', urls),
  saveImgsFn: (urls: string[]) => ipcRenderer.invoke('saveImgsFn', urls),
  openFile: (file: string) => ipcRenderer.invoke('openFile', file),
  openDir: (file: string) => ipcRenderer.invoke('openDir', file),

  textareaRightClick: (hasVal: boolean) => ipcRenderer.send('textarea-right-click', hasVal),
  onTextareaRightClickAction: (callback) => ipcRenderer.on('textarea-right-click-action', (_event, action, value) => callback(action, value)),
});
