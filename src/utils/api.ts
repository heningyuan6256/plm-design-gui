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

  /**
   * 获取搜索页面左侧文件夹
   * */
  getQueryFolder: () => {
    return NewRequest.get("/pdm/searchFolder/getList", { tenantId: "719" });
  },

  /**
   * 搜索dsl
   * */
  getConditionDsl: (data: any) => {
    return NewRequest.post("/pdm/condition/searchDsl", {
      ...data,
      tenantId: "719",
    });
  },

  /**
   * 获取搜索列头
   */
  getQueryColumns: (data: any) => {
    return NewRequest.get("/pdm/condition/getField", {
      ...data,
      tenantId: "719",
    });
  },

  /**
   * 获取映射表
   */

  getMapptingAttrs: () => {
    return NewRequest.get("/pdm/cad/mapping/attrs", {
      tenantId: "719",
    });
  },

  /**
   * 塞入映射表
   */
  postMapptingAttrs: (data: any) => {
    return NewRequest.post("/pdm/cad/mapping/attrs", {
      ...data,
      tenantId: "719",
    });
  },
};

export default API;
