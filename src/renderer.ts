// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron');

window.addEventListener('load', () => {
  const btnEle = document.getElementById('generate-btn');
  const valEle = document.getElementById('links-value') as HTMLTextAreaElement;
  const errorEle = document.getElementById('show-error');
  const infoEle = document.getElementById('show-info');

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
      show.info(res.data.pathname);
    }

    btnEle.innerText = '确认生成PDF';
    btnEle.removeAttribute('disabled');
  });

  btnEle.addEventListener('click', () => {
    show.clear();
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
});
