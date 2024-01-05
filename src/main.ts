// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, Menu, MenuItem, clipboard, shell } from 'electron';
import * as path from 'path';
import { generatePdfByLinks, saveImgs } from './utils/wx-spider';
import logger from './utils/logger';
import { initMkdirp } from './utils/index';
import { getIsVip, setIsVip } from './utils/services';

const env = process.env.NODE_ENV;
const isDev = env === 'development';

app.setName('力气强微信离线助手');

const isMac = process.platform === 'darwin';

let menu: Menu;

// mac 中如果直接设置空菜单，会出现不能用复制粘贴快捷键的问题
if (isMac) {
  const template = [{ role: 'appMenu' }, { role: 'fileMenu' }, { role: 'editMenu' }, { role: 'viewMenu' }] as any;
  menu = Menu.buildFromTemplate(template);
}
// windows 设置空菜单
else {
  menu = new Menu();
}

Menu.setApplicationMenu(menu);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile('./front/dist/index.html');
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainWindow = createWindow();
  initMkdirp();

  ipcMain.handle('generatePdf', generatePdf);
  ipcMain.handle('saveImgsFn', saveImgsFn);
  ipcMain.handle('openFile', openFile);
  ipcMain.handle('openDir', openDir);

  // 右键菜单
  ipcMain.on('textarea-right-click', (event, hasVal: boolean) => {
    const rightMenu = new Menu();

    rightMenu.append(
      new MenuItem({
        label: '粘贴',
        enabled: !!clipboard.readText(),
        click() {
          const text = clipboard.readText();
          mainWindow.webContents.send('textarea-right-click-action', 'paste', text);
        },
      })
    );

    rightMenu.append(new MenuItem({ type: 'separator' }));

    rightMenu.append(
      new MenuItem({
        label: '清空',
        enabled: hasVal,
        click() {
          mainWindow.webContents.send('textarea-right-click-action', 'clear');
        },
      })
    );

    rightMenu.popup({});
  });

  ipcMain.handle('getIsVip', (event) => getIsVip());
  ipcMain.handle('setIsVip', (event, code: string) => setIsVip(code));
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function generatePdf(event, urls: string[]) {
  try {
    const pathname = await generatePdfByLinks(urls);
    return pathname;
  } catch (err) {
    logger.error(err);

    if ((err.message as string).includes('command not found')) {
      throw new Error('请安装 wkhtmltopdf 软件');
    } else {
      throw err;
    }
  }
}

async function openFile(event, file: string) {
  shell.openExternal('file://' + file);
}

async function openDir(event, file: string) {
  shell.showItemInFolder(file);
}

async function saveImgsFn(event, urls: string[]) {
  try {
    const pathname = await saveImgs(urls);
    return pathname;
  } catch (err) {
    logger.error(err);
    throw err;
  }
}
