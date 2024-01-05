import React from 'react';
const { generatePdf, saveImgsFn, openFile, openDir, textareaRightClick, onTextareaRightClickAction } = window.electron;

interface ToPdfState {
  textareaValue: string;
  alertMsg: {
    level: null | 'info' | 'error';
    text: string;
  };
  generatingPdf: boolean;
  showPdf: boolean;
  pdfPathname: string;
}

class ToPdf extends React.Component<{}, ToPdfState> {
  constructor(props: any) {
    super(props);

    this.state = {
      textareaValue: '',
      alertMsg: { level: null, text: '' },
      generatingPdf: false,
      showPdf: false,
      pdfPathname: '',
    };

    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleGeneratePdf = this.handleGeneratePdf.bind(this);
  }

  componentDidMount() {
    // 右键菜单
    onTextareaRightClickAction((action, value) => {
      if (action === 'paste') {
        this.setState({ textareaValue: (this.state.textareaValue || '') + value });
      } else if (action === 'clear') {
        this.setState({ textareaValue: '' });
      }
    });
  }

  handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ textareaValue: event.target.value });
  }

  getUrls() {
    const { textareaValue } = this.state;
    if (!textareaValue) return this.alertMsg('请确认输入微信文章链接', 'error');

    const urls = textareaValue.trim().split('\n');
    const isWechatArticle = urls.every((url) => {
      return /http.+?mp.weixin.qq.com.+/.test(url);
    });
    if (!isWechatArticle) return this.alertMsg('请输入正确的微信文章链接', 'error');

    const isRepeat = urls.some((url, index) => urls.indexOf(url) !== index);
    if (isRepeat) return this.alertMsg('请勿重复输入微信文章链接', 'error');

    return urls;
  }

  handleGeneratePdf() {
    this.hideMsg();
    this.setState({ showPdf: false });

    const urls = this.getUrls();
    if (urls) {
      this.setState({ generatingPdf: true });
      generatePdf(urls)
        .then((pdfPathname) => {
          this.setState({ showPdf: true, pdfPathname });
        })
        .catch((err) => {
          this.alertMsg('错误：' + err.message, 'error');
        })
        .finally(() => {
          this.setState({ generatingPdf: false });
        });
    }
  }

  alertMsg(text: string, level: 'info' | 'error' = 'info') {
    this.setState({ alertMsg: { level, text } });
  }

  hideMsg() {
    this.alertMsg('');
  }

  render() {
    const { alertMsg, generatingPdf, showPdf, pdfPathname } = this.state;

    return (
      <div className="panel panel-default" style={{ margin: '0 auto', maxWidth: '1000px', minHeight: '467px' }}>
        <div className="panel-body markdown-body">
          <p>输入微信文章链接，将微信文章转为可离线阅读的PDF。可支持多个文章链接，将多篇文章合并为一个PDF。</p>
          <p>完美转换文章中的样式，完全保留文章内所有的图片。</p>
          <p>请在下面文本框内输入文章链接。如有多个文章链接，请用回车隔开，每行一个。</p>
          <p>
            <textarea
              value={this.state.textareaValue}
              placeholder="必填"
              className="form-control"
              rows={8}
              style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
              onChange={this.handleTextareaChange}
              onContextMenu={(event) => {
                event.preventDefault();
                const hasVal = !!this.state.textareaValue;
                textareaRightClick(hasVal);
              }}
            />
          </p>

          <p>
            <button disabled={generatingPdf ? true : false} className="btn btn-primary" onClick={this.handleGeneratePdf}>
              {generatingPdf ? '生成PDF中...' : '确认生成PDF'}
            </button>
          </p>

          {!alertMsg.text ? '' : <p className={alertMsg.level === 'info' ? 'text-info' : 'text-danger'}>{alertMsg.text}</p>}

          {!(showPdf && pdfPathname) ? (
            ''
          ) : (
            <div className="alert alert-success">
              <div style={{ wordBreak: 'break-all' }} className="can-user-select">
                成功：{pdfPathname}
              </div>
              <div style={{ marginTop: '10px' }}>
                <button
                  className="btn btn btn-outline-primary btn-sm"
                  style={{ marginRight: '10px' }}
                  onClick={() => {
                    openFile(pdfPathname);
                  }}
                >
                  打开文件
                </button>
                <button
                  className="btn btn btn-outline-primary btn-sm"
                  onClick={() => {
                    openDir(pdfPathname);
                  }}
                >
                  打开文件夹
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ToPdf;
