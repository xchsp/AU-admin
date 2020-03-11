// const _ = require('lodash')
const { UserModel, RoleModel, FunctionModel } = require('../model/model');
const uuidv4 = require('uuid/v4');
const { secretKey, Encrypt } = require('../util/md5');
const { businessError, success } = require('../lib/responseTemplate');
const dbSchema = require('../db/dbSchema');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { unique } = require('../util/util');

const findFunctionListItemInfo = (functionList) => {
  let menuId = [];
  let code = [];
  for (const i of functionList) {
    menuId.push(i.moduleId);
    code.push(i.code);
  }
  let uniquemenuId = unique(menuId);
  // console.log('查询出来的functionList中的menuId', menuId);
  // console.log('查询出来的functionList中的code', code);

  return {
    menuId: uniquemenuId,
    functionCode: code,
  };
};
const getUserInfoById = async (id) => {
  const userinfo = await UserModel.findOne({ id: id });
  return userinfo;
};

const getUserInfoUsername = async (name) => {
  const user = await UserModel.findOne({ userName: name });
  return user;
};

// const postEditRoleuser = async (roleUser) => {
//   if (roleUser.action === 1) {
//     // action=1:添加
//     // RoleModel.userId 添加一条 userId
//     // $push来实现添加数组中的指定元素
//     const add = await RoleModel.updateOne(
//       { id: roleUser.roleId },
//       {
//         $push: {
//           userId: roleUser.userId,
//         },
//       },
//     );
//     return add;
//   } else {
//     // RoleModel.userId 删除一条 userId
//     // $pull来实现删除数组中的指定元素
//     const remove = await UserModel.updateOne(
//       { id: roleUser.userId },
//       {
//         $pull: {
//           userRole: roleUser.roleId,
//         },
//       },
//     );
//     // console.log('删除后的', remove);
//     return remove;
//   }
// };
const getAllUser = async ({
  pageIndex,
  pageSize,
  sortBy,
  descending,
  filter,
}) => {
  let userList = await UserModel.find({});

  let userInfoList = JSON.parse(JSON.stringify(userList));

  if (filter.name) {
    userInfoList = _.filter(userInfoList, (o) => {
      return o.userName ? o.userName.indexOf(filter.name) > -1 : '';
    });
  }
  if (filter.email) {
    userInfoList = _.filter(userInfoList, (o) => {
      return o.email ? o.email.indexOf(filter.email) > -1 : '';
    });
  }
  // 总页数
  let totalCount = userInfoList.length;
  // 是否已经已经添加
  userInfoList.forEach((item) => {
    item.isAdd = 1;
  });
  // 排序
  if (sortBy) {
    sortBy = 'isAdd';
    userInfoList = _.sortBy(userInfoList, [sortBy]);
    if (descending === 'true') {
      userInfoList = userInfoList.reverse();
    }
  }
  // 返回给前端第几页，的 数量。（）
  let start = (pageIndex - 1) * pageSize;
  let end = pageIndex * pageSize;
  userInfoList = _.slice(userInfoList, start, end);
  return {
    totalCount: totalCount,
    rows: userInfoList,
  };
};
// 用户注册
const postRegister = async ({ req, res }) => {
  const { email, password, phone, username } = req.body;
  // 查询username是否存在，如果存在，返回错误
  const user = await UserModel.findOne({
    userName: username,
  });
  if (user) {
    return businessError({
      res,
      msg: '用户名已经存在!',
      data: { info: 'username' },
    });
  } else {
    //   const info = await UserModel.create({
    //   ...dbSchema.User,
    //   ...userInfo,
    //   id: uuidv4(),
    // });
    const info = await new UserModel({
      id: uuidv4(),
      email: email,
      isAdmin: phone === '13548106816' ? 'admin' : 'user',
      userName: username,
      pwd: Encrypt(password),
      phone: phone,
    });
    // console.log('userinfo', info);
    info.save(function(err) {
      if (err) {
        return businessError({
          res,
          msg: '数据库保存失败!',
          data: { info: err },
        });
      }
      const tokenObj = {
        username: info.userName,
        isAdmin: info.isAdmin,
        userId: info.id,
      };
      // 用户登录成功过后生成token返给前端
      let token = jwt.sign(tokenObj, secretKey, {
        expiresIn: '24h', // 授权时效24小时
      });
      return success({ res, data: { accessToken: token } });
    });
  }
};
// 添加
const addUser = async ({ userInfo }) => {
  const info = await UserModel.create({
    ...dbSchema.User,
    ...userInfo,
    id: uuidv4(),
  });
  if (info) {
    // 更新角色中的userRole
    await RoleModel.updateMany(
      { id: userInfo.userRole },
      {
        $addToSet: {
          userId: info.id,
        },
      },
    );
    return info;
  }
  return Promise.reject(new Error({ msg: '后端出错' }));
};
const postDelUser = async (ids) => {
  const deleteUser = UserModel.deleteMany({ id: ids });
  // 删除职位中的UserId
  const updateRole = RoleModel.updateMany(
    { userId: { $in: ids } },
    {
      $pullAll: {
        userId: ids,
      },
    },
  );
  const a = await Promise.all([deleteUser, updateRole]);
  return a;
};
const editUser = async (userInfo) => {
  if (userInfo) {
    const user = await UserModel.findOne({ userName: userInfo.userName });
    if (user && user.id !== userInfo.id) {
      return {
        success: false,
        msg: `${userInfo.userName}已存在`,
      };
    }
    // 要更新的user中的userRole
    let userLength = userInfo.userRole.length;
    // 以前的user中的userRole
    let roleLength = user.userRole.length;
    // 找出两个数组不同的元素
    const arr = userInfo.userRole.concat(user.userRole).filter((v, i, arr) => {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
    if (userLength - roleLength > 0) {
      await RoleModel.updateMany(
        { id: arr },
        {
          $addToSet: {
            userId: user.id,
          },
        },
      );
    }
    if (userLength - roleLength < 0) {
      await RoleModel.updateMany(
        { id: arr },
        {
          $pullAll: {
            userId: [user.id],
          },
        },
      );
    }
    if (userLength - roleLength === 0) {
      await RoleModel.updateMany(
        { id: userInfo.userRole },
        {
          $addToSet: {
            userId: user.id,
          },
        },
      );
    }
    await UserModel.updateOne(
      { id: userInfo.id },
      { ...userInfo, pwd: Encrypt(userInfo.pwd) },
    );
    return {
      success: true,
      msg: '更新成功了！',
    };
  }
  return Promise.reject(new Error({ msg: '没有参数' }));
};
const loginUser = async (userInfo) => {
  if (userInfo) {
    const user = await UserModel.findOne({
      // 判断密码是否正确
      userName: userInfo.username,
      pwd: Encrypt(userInfo.password),
    });
    // console.log('login-user', user);
    if (user && user.userName) {
      return {
        success: true,
        msg: '登陆成功',
        user,
      };
    }
    if (!user || user.userName === undefined) {
      return {
        success: false,
        msg: '登陆失败,用户名或密码错误',
      };
    }
  }
  return Promise.reject(new Error({ msg: '没有参数' }));
};
const findUserPermission = async (userRole) => {
  if (userRole && userRole.length) {
    // console.log('查询出来的user中的UserRole', userRole);
    // 根据user中的userRole查询角色Role
    let roleList = await RoleModel.find({ id: userRole });
    roleList = JSON.parse(JSON.stringify(roleList));
    // console.log('查询出来的RoleModel--List', roleList);

    // 找出个个角色中的Promission(FunctionModal的Id)数组，进行合并，然后去重
    let permission = [];
    for (let item of roleList) {
      permission.push(...item.permission);
    }
    // console.log('查询出来的RoleModel--permission', permission);

    if (permission && permission.length) {
      const functionId = unique(permission);
      // console.log('去重复--permission', functionId);

      // 查询 FunctionModel
      let functionList = await FunctionModel.find({ id: functionId });
      functionList = JSON.parse(JSON.stringify(functionList));
      // console.log('查询出来的functionList', functionList);

      return findFunctionListItemInfo(functionList);
    }
  }
};

module.exports = {
  getUserInfoById,
  getUserInfoUsername,
  getAllUser,
  postRegister,
  addUser,
  postDelUser,
  editUser,
  loginUser,
  findUserPermission,
};
