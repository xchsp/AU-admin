import React from 'react';
import { Layout, Icon } from 'antd';

const { Footer } = Layout;
// eslint-disable-next-line react/prefer-stateless-function
export default class Foot extends React.PureComponent {
  render() {
    return (
      <Footer>
        <div
          style={{
            // padding: '10px 24px 24px',
            textAlign: 'center',
            color: '#bebebe',
            // backgroundColor: 'pink',
            fontSize: '12px',
          }}
        >
          <a
            href='https://github.com/songtianen'
            target='_blank'
            rel='noopener noreferrer'
          >
            AU-admin&nbsp;&nbsp;&nbsp;&nbsp;
            <Icon type='github' size='large' />
          </a>
          <div>
            Copyright
            <Icon
              type='copyright'
              style={{ paddingRight: '2px', paddingLeft: '1px' }}
            />
            <span>2019&nbsp;多元宇宙科技有限公司</span>
            <div>
              Email:
              <a
                style={{ color: '#bebebe' }}
                href='mailto:songten@icloud.com?subject=test&cc=抄送人邮箱&subject=主题&body=内容'
              >
                songten@icloud.com
              </a>
            </div>
            <div>WeChat:13548106816</div>
            <div>QQ:715298152</div>
          </div>
        </div>
      </Footer>
    );
  }
}
