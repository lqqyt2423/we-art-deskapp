import 'bootstrap/dist/css/bootstrap.css';
import 'github-markdown-css';
import './style/style.css';

import gzhImg from './image/gzh.jpg';
import wxPayImg from './image/wx-pay.jpg';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
const { ipcRenderer, shell } = window.electron;

interface AppState {
  textareaValue: string;
  alertMsg: {
    level: 'info' | 'error';
    text: string;
  };
  generatingPdf: boolean;
  showPdf: boolean;
  pdfPathname: string;
  adHtml: string;
}

class App extends React.Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {
      textareaValue: '',
      alertMsg: { level: null, text: '' },
      generatingPdf: false,
      showPdf: false,
      pdfPathname: '',
      adHtml: '',
    };

    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleGeneratePdf = this.handleGeneratePdf.bind(this);
  }

  componentDidMount() {
    // 右键菜单
    ipcRenderer.on('right-click-paste', (event, content) => {
      this.setState({ textareaValue: (this.state.textareaValue || '') + content });
    });
    ipcRenderer.on('right-click-clear', () => {
      this.setState({ textareaValue: '' });
    });


    ipcRenderer.on('generate-pdf-reply', (event, res) => {
      if (res.status === 2) {
        this.alertMsg('错误：' + res.message, 'error');
      }
      else if (res.status === 0) {
        this.setState({ showPdf: true, pdfPathname: res.data.pathname });
      }

      this.setState({ generatingPdf: false });
    });


    ipcRenderer.on('show-ad', (event, content) => {
      if (!content) return;

      this.setState({ adHtml: content });
    });
    ipcRenderer.send('get-ad');
  }

  handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ textareaValue: event.target.value });
  }

  handleGeneratePdf(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    this.hideMsg();
    this.setState({ showPdf: false });

    const { textareaValue } = this.state;
    if (!textareaValue) return this.alertMsg('请确认输入微信文章链接', 'error');

    const urls = textareaValue.trim().split('\n');
    const isWechatArticle = urls.every(url => {
      return /http.+?mp.weixin.qq.com.+/.test(url);
    });
    if (!isWechatArticle) return this.alertMsg('请输入正确的微信文章链接', 'error');

    const isRepeat = urls.some((url, index) => urls.indexOf(url) !== index);
    if (isRepeat) return this.alertMsg('请勿重复输入微信文章链接', 'error');

    this.setState({ generatingPdf: true });
    ipcRenderer.send('generate-pdf', urls);
  }

  alertMsg(text: string, level: 'info' | 'error' = 'info') {
    this.setState({ alertMsg: { level, text } });
  }

  hideMsg() { this.alertMsg(''); }

  render() {
    const { alertMsg, generatingPdf, showPdf, pdfPathname, adHtml } = this.state;

    return (
      <div className="panel panel-default" style={{ margin: '0 auto', maxWidth: '1000px', minHeight: '467px' }}>
        <div className="panel-body markdown-body">
          <h1>微信文章转PDF</h1>
          <p>输入微信文章链接，将微信文章转为可离线阅读的PDF。可支持多个文章链接，将多篇文章合并为一个PDF。</p>
          <p>完美转换文章中的样式，完全保留文章内所有的图片。</p>
          <p>请在下面文本框内输入文章链接。如有多个文章链接，请用回车隔开，每行一个。</p>

          <p>
            <textarea
              value={this.state.textareaValue}
              placeholder="必填"
              className="form-control"
              rows={5}
              style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
              onChange={this.handleTextareaChange}
              onContextMenu={(event) => {
                event.preventDefault();
                const hasVal = !!this.state.textareaValue;
                ipcRenderer.send('right-click', { hasVal });
              }}
            />
          </p>

          { !alertMsg.text ? '' : (
            <p className={ alertMsg.level === 'info' ? 'text-info' : 'text-danger' }>{alertMsg.text}</p>
          ) }

          <p>
            <button disabled={generatingPdf ? true : false} className="btn btn-primary" onClick={this.handleGeneratePdf}>
              { generatingPdf ? '生成PDF中...' : '确认生成PDF' }
            </button>
          </p>

          {
            !(showPdf && pdfPathname) ? '' : (
              <div className="alert alert-success overflow-auto">
                <span className="align-middle">
                  成功：{ pdfPathname.match(/\w+\.pdf$/)[0] }
                </span>
                <div className="float-right">
                  <button
                    className="btn btn btn-outline-primary btn-sm"
                    onClick={() => { shell.openExternal('file://' + pdfPathname); }}
                  >打开文件</button>
                  <button
                    className="btn btn btn-outline-primary btn-sm"
                    style={{ marginLeft: '10px' }}
                    onClick={() => { shell.showItemInFolder(pdfPathname); }}
                  >打开文件夹</button>
                </div>
              </div>
            )
          }

          <hr />

          { !adHtml ? '' : (
            <div className="alert alert-info" dangerouslySetInnerHTML={{ __html: adHtml }}></div>
          ) }

          <div>
            <p>欢迎关注公众号，及时获取软件更新信息。</p>
            <p><img style={{ maxWidth: '500px' }} src={gzhImg} /></p>
            <p>若此软件对您有所帮助，欢迎赞赏。</p>
            <p><img style={{ maxWidth: '300px' }} src={wxPayImg} /></p>
          </div>

        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
