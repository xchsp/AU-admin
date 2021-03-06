import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Tree, Tag } from 'antd';
import { getAllMenuWithFunction } from '../../../../api';

const { TreeNode } = Tree;

class EditModal extends React.PureComponent {
  state = {
    // eslint-disable-next-line react/no-unused-state
    id: '',
    menuFunctionList: [],
    checkedKeys: [],
    defaultCheckKeys: [],
  };

  onCancel = () => {
    this.props.onCancel();
    this.setState({
      menuFunctionList: [],
      checkedKeys: [],
      defaultCheckKeys: [],
    });
  };

  onOk = async () => {
    let data = {
      roleId: this.props.formData.id,
      permissions: this.state.checkedKeys,
      moduleId: '0',
    };
    // console.log('角色权限管理，组件提交角色权限', this.props.handFromSubmit);
    await this.props.handFromSubmit(data);
    this.setState({
      menuFunctionList: [],
      defaultCheckKeys: [],
      checkedKeys: [],
    });
  };

  buildMenuListAndFunctions = (menuList) => {
    const changeList = (list) => {
      for (let i of list) {
        i.key = i.id;
        i.selectable = false;
        if (i.moduleId) {
          i.selectable = true;
          i.isPermissionChild = true;
          i.title = i.name;
        }
        if (i.children) {
          changeList(i.children);
        }
      }
      return list;
    };
    return changeList(menuList);
  };

  onCheck = (checkedKeys) => {
    console.log('checkedKeys', checkedKeys);
    console.log('this-checkedKeys', this.state.checkedKeys);
    console.log(
      'filter-checkedKeys',
      checkedKeys.filter((s) => s.indexOf('menu') < 0),
    );

    this.state.checkedKeys = checkedKeys.filter((s) => s.indexOf('menu') < 0);
    // console.log('this-checkedKeys', this.checkedKeys);
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      return;
    }
    let roleId = nextProps.formData.id;
    getAllMenuWithFunction({
      roleId,
    }).then((moduleFunctionsRes) => {
      let menuFunctionList = this.buildMenuListAndFunctions(
        moduleFunctionsRes.data.menuList,
      );
      let rolePermissions = moduleFunctionsRes.data.roleFunctions.permission;

      this.setState({
        menuFunctionList,
        defaultCheckKeys: rolePermissions,
        checkedKeys: rolePermissions,
      });
    });
  }

  renderTreeNode = (menuFunctionList) => {
    let list = [];
    for (let item of menuFunctionList) {
      if (item.children && item.children.length > 0) {
        if (item.isPermissionChild) {
          list.push(
            <TreeNode
              className='permission-tree-node'
              title={item.name}
              key={item.id}
            >
              {this.renderTreeNode(item.children)}
            </TreeNode>,
          );
        } else {
          list.push(
            <TreeNode
              className='clear-both'
              title={
                <span style={{ color: 'rgb(181, 185, 189)' }}>
                  {item.title}
                </span>
              }
              key={`menu${item.id}`}
            >
              {this.renderTreeNode(item.children)}
            </TreeNode>,
          );
        }
      } else if (item.isPermissionChild) {
        list.push(
          <TreeNode
            className='permission-tree-node'
            title={item.name}
            key={item.id}
          />,
        );
      } else {
        list.push(
          <TreeNode
            className='clear-both'
            title={
              <span style={{ color: 'rgb(181, 185, 189)' }}>{item.title}</span>
            }
            key={`menu${item.id}`}
          />,
        );
      }
    }
    return list;
  };

  renderTree = () => {
    return (
      <Tree
        checkable
        multiple
        defaultExpandAll
        defaultCheckedKeys={this.state.defaultCheckKeys}
        onCheck={this.onCheck}
        selectable={false}
        showLine
      >
        {this.renderTreeNode(this.state.menuFunctionList)}
      </Tree>
    );
  };

  render() {
    return (
      <Modal
        width={800}
        visible={this.props.visible}
        cancelText='关闭'
        okText='提交'
        title={
          <span>
            编辑角色&nbsp;&nbsp;
            <Tag color='#2db7f5'>{this.props.formData.name}</Tag>&nbsp;权限
          </span>
        }
        onCancel={this.onCancel}
        onOk={this.onOk}
        destroyOnClose
      >
        {this.state.menuFunctionList.length > 0 ? this.renderTree() : null}
      </Modal>
    );
  }
}

EditModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  handFromSubmit: PropTypes.func.isRequired,
};
export default EditModal;
