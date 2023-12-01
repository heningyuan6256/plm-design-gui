export enum BasicConfig {
  APPCacheFolder = ".onChain",
  NetworkCache = "network.txt",
  Active = "active",
  TokenCache = "token.txt",
  setting = 'setting.json',
  User = "user.txt",
  /**设计工具连接地址*/
  MqttConnectUrl = "ws://124.71.151.153/:8085/mqtt",
  /**设计工具dll名称*/
  pubgin_topic = "sw",
  /**设计工具dll版本*/
  plugin_version = "2019",
  /**onchain topic*/
  onchain_topic = "client_plugin",
  /**server url*/
  ServerUrl = "http://124.71.151.153:8058/plm",
   /**文件服务器 url*/
  TusUrl = "http://124.71.151.153:1080/plm/files",
  /**租户Id*/
  TenantId = "719",
}

export enum PathConfig {
  /**打开属性设置页面*/
  openAttrMap = "open_attr_map",
  /**打开查找图纸页面*/
  openSearchFile = "open_stock",
  /**打开上传界面*/
  openUpload = "open_home",
  /**退出*/
  exit = "exit",
  /**登陆*/
  login = "open_login",
  /**关于*/
  openInfo = "open_info",
  /**首选项*/
  preference = "open_preference",
  /**登录状态改变 */
  loginStatusChanged = "loginStatusChanged",
}

export enum CommandConfig {
  /**路由指令*/
  onchain_path = "onchain_path",
  /**获取配置属性*/
  getProductTypeAtt = "getProductTypeAtt",
  /**
   * 获取当前BOM
   * 1.获取指定的bom结构及其节点属性(缩略图/文件地址)
   * 2.获取当前bom结构及其节点属性（缩略图/文件地址）
   * 3.获取用户选择的bom结构及其节点属性（缩略图/文件地址）
   */
  getCurrentBOM = "getCurrentBOM",
  /**传入ID往文件写入属性值，如若文件没有属性值则添加属性再赋值*/
  setProductAttVal = "setProductAttrVal",
  /**将基础库中的零件插入到选中节点中*/
  insertPart = "insertPart",
  /**solidworks进程退出登录*/
  cadShutDown = "cad_shutdown"
}
