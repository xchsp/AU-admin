import axios from 'axios';
import { notification } from 'antd';
import { createBrowserHistory } from 'history';
import { getToken, removeToken } from './token';
// import loading from './loading';
import permission from './permission';

let history = createBrowserHistory({
  forceRefresh: true,
});
/*
  开发文件中的定义的变量可由webpack.DefinePlugin()中定义他会在webpack执行编译中添加变量
*/

// create an axios instance
/*
  WEBPACK_ENV由webpack.DefinePlugin()中定义
*/
const service = axios.create({
  baseURL:
    // eslint-disable-next-line no-undef
    WEBPACK_ENV === 'development' ? '/api' : '/api', // api的base_url：生产环境http://47.108.85.34/api */,
  // eslint-disable-next-line no-undef
  // WEBPACK_ENV === 'development' ? '/api' : 'http://localhost:8888/api', // 测试用,
  timeout: 20000,
  withCredentials: true,
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // 接口级权限效验
    if (!permission.check(config)) {
      return Promise.reject(new Error('403'));
    }
    // loading.show(config);
    let token = getToken();
    // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    Promise.reject(error);
  },
);

// respone interceptor
service.interceptors.response.use(
  (response) => {
    // loading.hide(response.config);
    const res = response;
    if (res.status !== 200 || res.data.statusCode !== 200) {
      notification.error({
        message: res.msg ? res.msg : res.data.msg,
      });
      // 可提前拦截请求错误
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ msg: res.msg ? res.msg : res.data.msg });
    }
    return response.data;
  },
  (error) => {
    // loading.hide(error.config);
    if (error.response && error.response.status === 401) {
      removeToken();
      if (error.config.url.indexOf('logout') === -1) {
        notification.error('登陆信息已过期,请重新登陆!');
      }
      setTimeout(() => {
        history.push('/login');
      }, 1000);
    } else if (error.response && error.response.status === 500) {
      notification.error({ message: '系统错误!' });
    } else if (error.message && error.message.indexOf('timeout') > -1) {
      notification.error({ message: '网络超时!' });
    } else if (error.message === '403') {
      notification.error({ message: '没有请求权限!' });
    } else {
      notification.error({ message: '网络错误!' });
    }
    return Promise.reject(error);
  },
);

export default service;
