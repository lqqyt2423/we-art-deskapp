// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer, shell } = window.electron;

window.addEventListener('load', () => {
  const btnEle = document.getElementById('generate-btn');
  const valEle = document.getElementById('links-value') as HTMLTextAreaElement;
  const errorEle = document.getElementById('show-error');
  const infoEle = document.getElementById('show-info');

  const pdfAreaEle = document.getElementById('show-pdf');
  const pdfTextEle = document.getElementById('show-pdf-text');
  const openPdfEle = document.getElementById('open-pdf');
  const openPdfDirEle = document.getElementById('open-pdf-dir');

  const showAdEle = document.getElementById('show-ad');


  // 生成的 pdf 路径
  let pdfPathname = '';

  openPdfEle.addEventListener('click', () => {
    shell.openExternal('file://' + pdfPathname);
  });
  openPdfDirEle.addEventListener('click', () => {
    shell.showItemInFolder(pdfPathname);
  });

  const showPdf = (pathname: string) => {
    pdfPathname = pathname;
    const filename = pathname.match(/\w+\.pdf$/)[0];
    pdfTextEle.innerText = '成功：' + filename;
    pdfAreaEle.classList.remove('d-none');
  };

  const clearPdf = () => {
    pdfAreaEle.classList.add('d-none');
  };


  const show = {
    error(text: string) {
      infoEle.innerText = '';
      errorEle.innerText = text;
    },
    info(text: string) {
      errorEle.innerText = '';
      infoEle.innerText = text;
    },
    clear() {
      infoEle.innerText = '';
      errorEle.innerText = '';
    },
  };


  ipcRenderer.on('generate-pdf-reply', (event, res) => {
    if (res.status === 2) {
      show.error('错误：' + res.message);
    }
    else if (res.status === 0) {
      // show.info(res.data.pathname);
      showPdf(res.data.pathname);
    }

    btnEle.innerText = '确认生成PDF';
    btnEle.removeAttribute('disabled');
  });


  btnEle.addEventListener('click', () => {
    show.clear();
    clearPdf();

    const val = valEle.value;
    if (!val) return show.error('请确认输入微信文章链接');

    const urls = val.trim().split('\n');
    const isWechatArticle = urls.every(url => {
      return /http.+?mp.weixin.qq.com.+/.test(url);
    });
    if (!isWechatArticle) return show.error('请输入正确的微信文章链接');

    const isRepeat = urls.some((url, index) => urls.indexOf(url) !== index);
    if (isRepeat) return show.error('请勿重复输入微信文章链接');

    btnEle.innerText = '生成PDF中...';
    btnEle.setAttribute('disabled', 'disabled');

    ipcRenderer.send('generate-pdf', urls);
  });


  ipcRenderer.on('show-ad', (event, content) => {
    if (!content) return;

    showAdEle.innerHTML = content;
    showAdEle.classList.remove('d-none');
  });
  ipcRenderer.send('get-ad');


  // 右键菜单
  valEle.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const hasVal = !!valEle.value;
    ipcRenderer.send('right-click', { hasVal });
  });

  ipcRenderer.on('right-click-paste', (event, content) => {
    valEle.value = (valEle.value || '') + content;
  });

  ipcRenderer.on('right-click-clear', () => {
    valEle.value = '';
  });
});
