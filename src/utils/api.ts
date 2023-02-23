//  api.js
import Request from "./request.js";

const NewRequest = new Request({});

export type loginUserProps = {
    email: string;
    password: string;
    userAgent: string;
}

const API = {
  /**
   * 登陆
   * */
  login: (data: loginUserProps) => {
    return NewRequest.post("/sys/user/login", data);
  },
};

export default API;
