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
   * 根据token获取用户信息
   * */
  getUserInfo: (params: Record<string, any>) => {
    return NewRequest.get("/pdm/user/token", params);
  },
  /**
   * 获取列表值
   * */
  getList: (data: listQuery) => {
    return NewRequest.post("/pdm/listbycodes", {
      warpper: data,
    });
  },
  /**
   * 获取物料库列表
   * */
  getStock: (tenantId: string) => {
    return NewRequest.get("/pdm/user/getInstanceMenu", {
      tenantId: tenantId,
    });
  },

  /**
   * 获取某个物料库列表下面的物料库
   * */
  getStockByType: (data: Record<string, any>) => {
    return NewRequest.post("/opendata/findItemLibraryIns", data);
  },
};

export default API;
