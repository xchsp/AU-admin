import { actionTypes } from './actions';

// import * as common from "../../redux/constants"; // 公共状态

export default function(state, action) {
  if (!state) {
    state = {
      isLogin: false,
    };
  }
  switch (action.type) {
    case actionTypes.REGISTER_CLEARERROR_OK:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.LOGIN_SUCCESS:
      // 获取用户信息
      return {
        ...state,
        ...action.payload.data,
      };
    case actionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        token: action.payload.data.accessToken,
        ...action.payload,
        isLogin: true,
      };
    case actionTypes.LOGIN_ERROR:
      // 登出
      return {
        ...state,
        ...action.payload,
        error: true,
      };
    case actionTypes.LOGOUT_SUCCESS:
      // 登出
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
