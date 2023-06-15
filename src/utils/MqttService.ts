import mqtt, { MqttClient } from "mqtt";
import { BasicConfig } from "../constant/config";

class MqttService {
  /**
   * 单例 保证拿到的都是同一个实例
   */
  static instance: MqttService;
  static get Instance() {
    if (!this.instance) {
      this.instance = new MqttService();
    }
    return this.instance;
  }
  baseUrl: string;
  mqtt: MqttClient;
  callBackMapping: Record<string, any>;
  constructor(url: string = BasicConfig.MqttConnectUrl) {
    this.baseUrl = url;
    this.mqtt = {} as MqttClient;
    this.callBackMapping = {};
  }

  /**
   * @description: 定义连接SSE服务器的方法
   * @param  {*}
   * @return {*}
   */
  connect(url = BasicConfig.MqttConnectUrl) {
    const uniqueId = Math.random.toString();
    this.mqtt = mqtt.connect(url, {
      //mqtt客户端的id
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      clientId: `client_onchain${uniqueId}`,
      // username: "admin",
      // password: "public",
    });

    this.mqtt.subscribe("sw");

    this.mqtt.on("connect", () => {
      console.log("连接中");
    });
    // this.es.close = () => {
    //   console.log("SSE连接失败/关闭");
    // };

    this.mqtt.on("message", (topic, data: any) => {
      const type = JSON.parse(data).type;
      // 如果存在，直接调用
      const callBack = this.callBackMapping[type]; //执行订阅的回调
      if (callBack) {
        callBack.call(this, JSON.parse(data));
      }
    });
  }

  /**
   * @description: 注册回调函数
   * @param  {*}
   * @return {*}
   */
  registerCallBack(
    socketType: string,
    callBack: (data: Record<string, any>) => void
  ) {
    this.callBackMapping[socketType] = callBack;
  }

  /**
   * @description: 解除注册函数
   * @param  {*}
   * @return {*}
   * @param {string} socketType
   */
  unRegisterCallBack(socketType: string) {
    this.callBackMapping[socketType] = null;
  }
}

const mqttClient = MqttService.Instance;

export { mqttClient };
