import React, { useEffect, useState } from 'react';
import wxImg from './image/wx.jpg';
const { getIsVip, setIsVip } = window.electron;

function Vip({ initVipState = false }) {
  const [vipState, setVipState] = useState(initVipState);
  const [code, setCode] = useState('');
  const [alertMsg, setAlertMsg] = useState({ level: 'info', text: '' });

  useEffect(() => {
    setVipState(initVipState);
  }, [initVipState]);

  const onAuthCode = () => {
    if (!code) {
      setAlertMsg({ level: 'error', text: '请输入兑换码' });
      return;
    }
    setIsVip(code).then((resState) => {
      setVipState(resState);
      if (!resState) setAlertMsg({ level: 'error', text: '兑换失败' });
    });
  };

  return (
    <div className="panel panel-default" style={{ margin: '0 auto', maxWidth: '1000px' }}>
      <div className="panel-body markdown-body">
        <p>当前软件状态：{vipState ? '高级版' : '普通版'}</p>
        {vipState ? null : (
          <>
            <p style={{ display: 'flex', gap: '20px' }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="form-control"
                style={{ width: '250px' }}
                placeholder="请输入高级版兑换码..."
              />
              <button className="btn btn-primary" onClick={onAuthCode}>
                兑换
              </button>
            </p>
            {!alertMsg.text ? '' : <p className={alertMsg.level === 'info' ? 'text-info' : 'text-danger'}>{alertMsg.text}</p>}
          </>
        )}
        <p>高级版功能：</p>
        <ul>
          <li>生成PDF时，生成的文档最后一页不会包含此软件的广告信息</li>
          <li>后续开发的所有高级功能也都可使用</li>
        </ul>
        <p>购买：</p>
        <p>联系作者购买高级版兑换码，一次性付费50元，即可永久使用。</p>
        <p className="can-user-select">添加好友时请备注购买力气强微信离线助手。</p>
        <p>
          <img style={{ maxWidth: '200px' }} src={wxImg} />
        </p>
      </div>
    </div>
  );
}

export default Vip;
