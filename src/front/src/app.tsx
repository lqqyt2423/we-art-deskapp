import React, { useState } from 'react';
import ToPdf from './toPdf';
import SaveImg from './saveImg';
import Contact from './contact';
import Vip from './vip';
const { getIsVip } = window.electron;

const pages = [
  { id: 'pdf', name: '微信文章转 PDF' },
  { id: 'image', name: '微信文章内图片下载' },
  { id: 'contact', name: '联系作者 & 赞赏' },
  { id: 'vip', name: '升级高级版' },
];

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [pageId, setPageId] = useState('pdf');
  const [vipState, setVipState] = useState(false);

  const onChangePage = (id) => {
    setPageId(id);
    if (id === 'vip') {
      getIsVip().then((resState) => {
        setVipState(resState);
      });
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexFlow: 'column',
          height: '100%',
          borderRight: '2px solid #ccc',
          width: `${sidebarWidth}px`,
        }}
      >
        {pages.map((page) => {
          const style = { padding: '8px 8px' };
          if (page.id === pageId) {
            style.backgroundColor = 'rgb(63, 134, 255)';
            style.color = 'white';
          }
          return (
            <div key={page.id} style={style} onClick={() => onChangePage(page.id)}>
              {page.name}
            </div>
          );
        })}
      </div>
      <div
        style={{
          flex: '1',
          height: '100%',
          width: `calc(100% - ${sidebarWidth}px)`,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {pageId !== 'pdf' ? null : <ToPdf />}
        {pageId !== 'image' ? null : <SaveImg />}
        {pageId !== 'contact' ? null : <Contact />}
        {pageId !== 'vip' ? null : <Vip initVipState={vipState} />}
      </div>
    </div>
  );
}

export default App;
