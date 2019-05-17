const { FunctionModel } = require('../model/model');
const _ = require('lodash');
// const { businessError, success } = require('../lib/responseTemplate');

// 查询功能列表
const findFunctionList = (selector = {}) => {
  return FunctionModel.find(selector);
};

module.exports = {
  findFunctionList,
  FunctionPagedList: (
    doc,
    req,
    res,
    pageIndex,
    pageSize,
    sortBy,
    descending,
    filter,
  ) => {
    console.log('前端数据filter', filter);
    let resultList = doc;
    if (filter.module) {
      resultList = _.filter(resultList, (o) => {
        return o.module.indexOf(filter.module) > -1;
      });
    }
    if (filter.name) {
      resultList = _.filter(resultList, (o) => {
        return o.name.indexOf(filter.name) > -1;
      });
    }
    if (filter.code) {
      resultList = _.filter(resultList, (o) => {
        return o.code.indexOf(filter.code) > -1;
      });
    }
    let totalCount = resultList.length;
    if (sortBy) {
      resultList = _.sortBy(resultList, [sortBy]);
      if (descending === 'true') {
        resultList = resultList.reverse();
      }
    } else {
      resultList = _.sortBy(resultList, ['module', 'name']);
      if (descending === 'true') {
        resultList = resultList.reverse();
      }
    }
    let start = (pageIndex - 1) * pageSize;
    let end = pageIndex * pageSize;
    resultList = _.slice(resultList, start, end);
    return {
      totalCount: totalCount,
      rows: resultList,
    };
  },
  //   getFunctionList: async () => {
  //     let db = await model.init(context)
  //     return db.value()
  //   },
  //   getFunctionListByIds: async (ids) => {
  //     let db = await model.init(context)
  //     let list = db.value()
  //     let functions = list.filter(s => {
  //       return ids.indexOf(s.id) > -1
  //     })
  //     return functions
  //   },
  //   delFuntion: async (id) => {
  //     let db = await model.init(context)
  //     await db.remove({ id: id }).write()
  //   },
  saveFunction: (func) => {
    // 查询一条
    FunctionModel.findOne({ code: func.code }, (err, rs) => {
      if (!err) {
        console.log('保存功能', rs);
        if (rs && rs.id !== func.id) {
          return {
            success: false,
            msg: '功能编码已经存在',
          };
        }
      }
    });
    FunctionModel.findOne(
      { moduleId: func.moduleId, name: func.name },
      (err, rs) => {
        if (!err) {
          if (rs && rs.id !== func.id) {
            return {
              success: false,
              msg: '当前模块功能名称已经存在',
            };
          }
          console.log('保存功能saveFunction 查询数据库', rs);
        }
      },
    );
    if (func.id) {
      FunctionModel.where({ id: func.id }).updateOne(
        { $set: { ...func } },
        (err, d) => {
          if (!err) {
            console.log('function 更新数据库');
          }
        },
      );
    }
  },
  // if (exist && exist.id !== func.id) {
  //   return {
  //     success: false,
  //     msg: '功能编码已经存在',
  //   };
  // }
  // let exist1 = db.find({ moduleId: func.moduleId, name: func.name }).value();
  // if (exist1 && exist1.id !== func.id) {
  //   return {
  //     success: false,
  //     msg: '当前模块功能名称已经存在',
  //   };
  // }
  // if (func.id) {
  //   db.find({ id: func.id })
  //     .assign(func)
  //     .write();
  // } else {
  //   db.insert(func).write();
  // }
  // return {
  //   success: true,
  //   msg: '',
  // };
};
