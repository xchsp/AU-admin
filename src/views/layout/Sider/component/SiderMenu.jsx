import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon, Layout } from 'antd';
import { Link } from 'react-router-dom';
import logo from '../../../../resource/assets/logo.jpg';

const { SubMenu } = Menu;
const { Item } = Menu;
const { Sider } = Layout;

class SubMenuList extends React.PureComponent {
  renderMenuItem = ({ path, name, title, icon }) => {
    // 路由跳转到 配置文件中的 value
    return (
      <Item key={name}>
        {
          <Link to={path}>
            <span>
              {icon && <Icon type={icon} style={{ color: '#08c' }} />}
              <span>{title}</span>
            </span>
          </Link>
        }
      </Item>
    );
  };

  renderSubMenu = ({ name, title, icon, children }) => {
    // console.log('renderSubMenu的name', name)
    return (
      <SubMenu
        key={name}
        title={
          <span>
            {icon && <Icon type={icon} style={{ color: '#08c' }} />}
            <span>{title}</span>
          </span>
        }
      >
        {children &&
          children.map((item) =>
            item.children && item.children.length
              ? this.renderSubMenu(item)
              : this.renderMenuItem(item),
          )}
      </SubMenu>
    );
  };

  renderLoadble = (num) => {
    let arr = new Array(num).fill('0');
    return (
      <div
        style={{
          // width: '100%',
          // height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {arr.map((item, index) => (
          <div
            key={index}
            style={{
              width: 150,
              height: 30,
              marginTop: 20,
              backgroundColor: '#F0F2F5',
            }}
          />
        ))}
      </div>
    );
  };

  render() {
    const {
      siderModuleMenu,
      menuOpenchange,
      siderOpenKeys,
      selectedKey,
      menuOnClick,
      responsive,
    } = this.props;
    return (
      <Sider
        breakpoint='lg'
        collapsedWidth={responsive ? 0 : undefined}
        trigger={null}
        collapsible
        collapsed={this.props.collapsed}
        width={180}
        theme={this.props.theme}
        style={{
          borderRight: 'solid 1px #e8e8e8',
        }}
      >
        <Menu
          // className='logo'
          theme={this.props.theme}
          style={{
            height: 49,
            width: 180,
            overflow: 'hidden',
            // border: 'none',
            borderBottom: 'solid 1px #e8e8e8',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 100,
          }}
        >
          <img
            src={logo}
            alt='logo'
            style={{
              height: 34,
              width: 34,
              marginLeft: 22,
            }}
          />
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              paddingLeft: '10px',
              color: 'rgb(97, 218, 251)',
              display: this.props.collapsed ? 'none' : 'block',
            }}
          >
            AU-andmin
          </div>
        </Menu>
        <Menu
          mode='inline'
          theme={this.props.theme}
          onClick={menuOnClick}
          onOpenChange={menuOpenchange}
          selectedKeys={selectedKey}
          openKeys={siderOpenKeys}
          style={{
            height: '100%',
            overflow: 'auto',
            paddingTop: 49,
            border: 'none',
          }}
        >
          {/* {siderModuleMenu &&
            siderModuleMenu.map((item) =>
              item.children && item.children.length
                ? this.renderSubMenu(item)
                : this.renderMenuItem(item),
            )} */}
          {siderModuleMenu.length
            ? siderModuleMenu.map((item) =>
                item.children && item.children.length
                  ? this.renderSubMenu(item)
                  : this.renderMenuItem(item),
              )
            : this.renderLoadble(7)}
        </Menu>
      </Sider>
    );
  }
}

SubMenuList.propTypes = {
  responsive: PropTypes.bool.isRequired,
  collapsed: PropTypes.bool.isRequired,
  siderModuleMenu: PropTypes.array.isRequired,
  menuOpenchange: PropTypes.func.isRequired,
  menuOnClick: PropTypes.func.isRequired,
  selectedKey: PropTypes.array.isRequired,
  siderOpenKeys: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
};
export default SubMenuList;
