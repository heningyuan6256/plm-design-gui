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
    return NewRequest.get("/opendata/instance", data);
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

  getMapptingAttrs: (data: any) => {
    return NewRequest.get("/pdm/cad/mapping/attrs", {
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
  getInstanceAttrs: ({
    itemCode,
    tabCode,
  }: {
    itemCode: string;
    tabCode: string;
  }) => {
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
  allcateCode: (data: {
    numberOfItemCode: string;
    fileTypeCountMap: Record<string, any>;
  }) => {
    return NewRequest.post("/pdm/cad/pre/numbers", data);
  },

  /**
 * 获取cad类型对应的文件
 */
  getAllCadFileTypeMap: () => {
    return NewRequest.get("/pdm/cad/formats", { pageNo: '1', pageSize: '500' });
  },

  /**
* 下载文件
*/
  downloadFile: (url: string,) => {
    return NewRequest.get(url, {}, { responseType: 3 });
  },

  /**
  * 根据产品查询型谱
  */
  getProductSpectrumList: (rootNodeId: string) => {
    return NewRequest.get('/pdm/productSpectrumList/getList', { tenantId: '719', rootNodeId: rootNodeId });
  },

  /**
  * 批量创建实例
  */
  createInstances: (instances: any) => {
    return NewRequest.post('/pdm/instances', { tenantId: '719', instances: instances });
  },

  /**
 * 根据产品和文件名判断文件是否存在
 */
  judgeFileExist: ({ productId, fileNameList, userId, itemCodes }: { productId: string, fileNameList: string[], userId: string, itemCodes: string[] }) => {
    return NewRequest.post('/opendata/cad/exist/files', { tenantId: '719', productId: productId, fileNameList: fileNameList, userId: userId, itemCodes: itemCodes });
  },
  /**
  * 取消签出
  */
  cancelCheckout: ({ insId }: { insId: string }) => {
    return NewRequest.put('/pdm/affected/cancel/checkout', { tenantId: '719', insId: insId });
  },
  /**
  * 签出
  */
  checkout: ({ insId, insSize, insName, checkoutBy }: { insId: string, insSize: string, insName: string, checkoutBy: string }) => {
    return NewRequest.put('/pdm/affected/checkout', { tenantId: '719', insId: insId, insSize: insSize, insName: insName, checkoutBy: checkoutBy });
  },
  /**
* 签入
*/
  checkIn: ({ insId, insSize, insName, insUrl }: { insId: string, insSize: string, insName: string, insUrl: string }) => {
    return NewRequest.put('/pdm/affected/checkin', { tenantId: '719', insId: insId, insSize: insSize, insName: insName, insUrl: insUrl });
  },

  /**
* 批量修改
*/
  batchUpdate: (data: any) => {
    return NewRequest.postPut('/pdm/instances', data);
  },
  /**
  * 批量创建实例结构
  */
  batchCreateStructure: (data: any) => {
    return NewRequest.postPut('/pdm/instances/tab', data);
  },
  /**
  * 根据文件类型判断所对应的物料的类型
  */
  getMaterialTypeMap: (params: {itemCode: string }) => {
    return NewRequest.get('/pdm/objects', { ...params, tenantId: '719', pageNo: '1', pageSize: '500' });
  },
};

export default API;
