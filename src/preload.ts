// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const electron = require('electron');
window.electron = {
  ipcRenderer: electron.ipcRenderer,
  shell: electron.shell,
};
