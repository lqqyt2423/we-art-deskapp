import React from 'react';
import gzhImg from './image/gzh.jpg';
import sponsorMeImg from './image/sponsor-me.jpg';

function Contact() {
  return (
    <div className="panel panel-default" style={{ margin: '0 auto', maxWidth: '1000px' }}>
      <div className="panel-body markdown-body">
        <p>欢迎关注公众号，及时获取软件更新信息。</p>
        <p>
          <img style={{ maxWidth: '500px' }} src={gzhImg} />
        </p>
        <p>若此软件对您有所帮助，欢迎赞赏。赞赏时请备注力气强微信离线助手。</p>
        <p>
          <img style={{ maxWidth: '300px' }} src={sponsorMeImg} />
        </p>
      </div>
    </div>
  );
}

export default Contact;
