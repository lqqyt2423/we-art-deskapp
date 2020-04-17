import { ipcRenderer, shell } from 'electron';

declare global {
  interface Window {
    electron: {
      ipcRenderer: typeof ipcRenderer;
      shell: typeof shell;
    }
  }
}

