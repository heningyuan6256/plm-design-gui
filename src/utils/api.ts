//  api.js
import Request, { getUrl } from "./request.js";
import { sse } from "./SSEService.js";

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
   * 获取产品数据
   * */
  getProductList: (params: Record<string, any>) => {
    return NewRequest.get("/pdm/product/list", params);
  },
  /**
   * 获取列表值
   * */
  getList: (data: any) => {
    return NewRequest.post("/pdm/listbycodes", {
      warpper: data,
      tenantId: "719",
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
   * 根据实例Id获取实例详情
   * */
  getInstanceInfoById: (data: Record<string, any>) => {
    return NewRequest.get("/opendata/instance", data).catch((e) => {
      console.log(e);
    });
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
    return NewRequest.post("/opendata/condition/searchDsl", {
      ...data,
      tenantId: "719",
    });
  },

  /**
   * PDM搜索dsl
   * */
  getPDMConditionDsl: (data: any) => {
    return NewRequest.post("/pdm/search/getSearchData", {
      ...data,
      tenantId: "719",
    });
  },
  /**
   * 获取搜索列头
   */
  getQueryColumns: (data: any) => {
    return NewRequest.get("/pdm/search/getField", {
      ...data,
      tenantId: "719",
    });
  },

  /**
   * 获取映射表
   */

  getMapptingAttrs: (data: any) => {
    return NewRequest.get("/pdm/cad/mapping/attrs", {
      tenantId: "719",
      ...data,
    });
  },

  /**
   * 获取Cad属性
   */

  getCadAttrs: (data: any) => {
    return NewRequest.get("/pdm/cad/attrs", {
      tenantId: "719",
      ...data,
    });
  },

  /**
   * 获取Cad属性
   */
  getCadFormats: () => {
    return NewRequest.get("/pdm/config/formats", {
      tenantId: "719",
      pageNo: "1",
      pageSize: "500",
      column: "format",
    });
  },

  /**
   * 获取所有的格式
   */
  getCadFormat: (data: any) => {
    return NewRequest.get("/pdm/cad/attrs", {
      tenantId: "719",
      ...data,
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

  /**
   * 获取实例属性
   */
  getInstanceAttrs: ({ itemCode, tabCode }: { itemCode: string; tabCode: string }) => {
    return NewRequest.get("/pdm/attributes", {
      tenantId: "719",
      pageNo: "1",
      pageSize: "1000",
      itemCode: itemCode,
      tabCode: tabCode,
      column: "sort",
      order: "asc",
    });
  },

  /**
   * 分配编码
   */
  allcateCode: (data: { numberOfItemCode: string; fileTypeCountMap: Record<string, any> }) => {
    return NewRequest.post("/pdm/cad/pre/numbers", data);
  },

  /**
   * 获取cad类型对应的文件
   */
  getAllCadFileTypeMap: () => {
    return NewRequest.get("/pdm/cad/formats", { pageNo: "1", pageSize: "500" });
  },

  /**
   * 下载文件
   */
  downloadFile: (url: string) => {
    return NewRequest.get(url, {}, { responseType: 3 });
  },

  /**
   * 根据产品查询型谱
   */
  getProductSpectrumList: (rootNodeId: string) => {
    return NewRequest.get("/pdm/productSpectrumList/getList", { tenantId: "719", rootNodeId: rootNodeId });
  },

  /**
   * 批量创建实例
   */
  createInstances: (instances: any) => {
    return NewRequest.post("/pdm/instances", { tenantId: "719", instances: instances });
  },

  /**
   * 根据产品和文件名判断文件是否存在
   */
  judgeFileExist: ({
    productId,
    fileCheckList,
    userId,
    itemCodes,
  }: {
    productId: string;
    fileCheckList: any[];
    userId: string;
    itemCodes: string[];
  }) => {
    return NewRequest.post("/opendata/cad/exist/files", {
      tenantId: "719",
      productId: productId,
      fileCheckList: fileCheckList,
      userId: userId,
      itemCodes: itemCodes,
    });
  },
  /**
   * 取消签出
   */
  cancelCheckout: ({ insId, changeInsId }: { insId: string; changeInsId?: string }) => {
    return NewRequest.put("/pdm/affected/cancel/checkout", { tenantId: "719", insId, changeInsId });
  },
  /**
   * 签出
   */
  checkout: ({
    insId,
    insSize,
    insName,
    checkoutBy,
    changeInsId,
  }: {
    changeInsId?: string;
    insId: string;
    insSize: string;
    insName: string;
    checkoutBy: string;
  }) => {
    return NewRequest.put("/pdm/affected/checkout", {
      tenantId: "719",
      insId: insId,
      insSize: insSize,
      insName: insName,
      checkoutBy: checkoutBy,
      changeInsId,
    });
  },
  /**
   * 签入
   */
  checkIn: ({
    insId,
    insSize,
    insName,
    insUrl,
    changeInsId
  }: {
    insId: string;
    insSize?: string;
    insName?: string;
    changeInsId?:string;
    insUrl?: string;
  }) => {
    return NewRequest.put(
      "/pdm/affected/checkin",
      insSize
        ? { tenantId: "719", insId: insId, insSize: insSize, insName: insName, insUrl: insUrl,changeInsId }
        : { tenantId: "719", insId: insId,changeInsId }
    );
  },

  /**
   * 批量修改
   */
  batchUpdate: (data: any) => {
    return NewRequest.postPut("/pdm/instances", data);
  },

  /**
   * 单个修改
   */
  singleUpdate: (data: any) => {
    return NewRequest.postPut("/pdm/instance", data);
  },
  /**
   * 批量创建实例结构
   */
  batchCreateStructure: (data: any) => {
    return NewRequest.postPut("/pdm/instances/tab", data);
  },
  /**
   * 根据文件类型判断所对应的物料的类型
   */
  getMaterialTypeMap: (params: { itemCode: string }) => {
    return NewRequest.get("/pdm/objects", { ...params, tenantId: "719", pageNo: "1", pageSize: "500" });
  },
  /**
   * 绑定物料和设计文件
   */
  bindFileAndMaterial: (data: any) => {
    return NewRequest.postPut("/pdm/instances/bind/files", data);
  },
  /**
   * 实例页签的保存接口
   */
  insatnceTabsave: (data: any) => {
    return NewRequest.post("/pdm/replace/save", data);
  },
  /**
   * 实例红线页签的保存接口
   */ 
  insatnceProcessTabsave: (data: any) => {
    return NewRequest.post("/pdm/inprocess/save", data);
  },
  /**
   * 实施页签查询
   */
  queryInstanceTab: (data: any) => {
    return NewRequest.post("/opendata/instance/tab", data);
  },
  /**
   * 实施页签红线查询
   */
  queryInProcessInstanceTab: (data: any) => {
    return NewRequest.post("/opendata/instance/inprocess/tab", data);
  },
  queryInsVersionOrder: (ids: string) => {
    return NewRequest.get("/pdm/ins/versions", { tenantId: "719", ids: ids });
  },
  /**
   * 上传附件
   */
  addInstanceAttributeAttachment: (data: any) => {
    return NewRequest.post("/pdm/attachment/batchImportInstanceAttributeAttachment", data);
  },
  /**
   * 发送消息
   */
  sendMessage: (cmd: string, to: string, userId: string, message: string) => {
    return new Promise(async (resolve, reject) => {
      const formData = new FormData();
      formData.append("cmd", cmd);
      formData.append("to", to);
      formData.append("userId", userId);
      formData.append("message", message);
      const { tenantId: tenantId } = await getUrl("/sse");
      resolve(NewRequest.postFormData(`/event/send/${tenantId}`, formData));
    });
  },
  /**
   * 获取聊天数据
   */
  getChatData: (data: { parInsId: string; pageNo: string; pageSize: string }) => {
    return NewRequest.get("/pdm/cad/msgs", data);
  },

  /**
   * 添加聊天消息
   */
  postMessageData: (
    data: {
      createBy: string;
      msgContent: string;
      msgStatus: boolean;
      parInsId: string;
    }[]
  ) => {
    return NewRequest.post("/pdm/cad/msg", data);
  },

  /**
   * 已读聊天消息
   */
  readMessageData: (ids: string) => {
    return NewRequest.put("/pdm/cad/msgs", { ids: ids });
  },

  /**
   * 删除聊天消息
   */
  delMessageData: (ids: string) => {
    return NewRequest.delete("/pdm/cad/msgs", { ids: ids });
  },

  /**
   *
   */
  checkAuth: (insId: string, itemCode: string, userId: string) => {
    return NewRequest.get("/opendata/instance/btns", {
      instanceId: insId,
      module: "instance",
      tabCode: "10002002",
      itemCode: itemCode,
      tenantId: sse.tenantId,
      userId: userId,
    });
  },

  //  /**
  // * 删除聊天消息
  // */
  //  readMessageData: (ids: string) => {
  //   return NewRequest.put('/pdm/cad/msgs', {ids: ids})
  // },
};

export default API;
