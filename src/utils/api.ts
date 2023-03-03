//  api.js
import Request from "./request.js";

const NewRequest = new Request({});

export type loginUserProps = {
  email: string;
  password: string;
  userAgent: string;
};

export type listQuery = {
  code: number;
  warpper?: string;
}[];

const API = {
  /**
   * 登陆
   * */
  login: (data: loginUserProps) => {
    return NewRequest.post("/sys/user/login", data);
  },

  /**
   * 获取列表值
   * */
  getList: (data: listQuery) => {
    return NewRequest.post("/pdm/listbycodes", {
      warpper: data,
    });
  },
};

export default API;
