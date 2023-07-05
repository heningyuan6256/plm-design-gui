import mqtt, { MqttClient } from "mqtt";
import { BasicConfig } from "../constant/config";
import { Utils } from ".";
import { getCurrent,appWindow } from "@tauri-apps/api/window";

class MqttService {
  /**
   * 单例 保证拿到的都是同一个实例
   */
  static instance: MqttService;
  clientId: string;
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
    // 生成客户端id
    const uniqueId = Math.random().toString();
    this.clientId = `client_onchain_${uniqueId}`;
  }

  /**
   * @description: 定义连接Mqtt服务器的方法
   * @param  {*}
   * @return {*}
   */
  connect(url = BasicConfig.MqttConnectUrl, topic = "") {
    // 建立连接
    this.mqtt = mqtt.connect(url, {
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      clientId: this.clientId,
    });
    // this.mqtt.subscribe(`${BasicConfig.onchain_topic}${topic}`);

    this.mqtt.subscribe(`${BasicConfig.onchain_topic}`);

    this.mqtt.on("connect", () => {
      console.log("成功建立连接");
    });

    this.mqtt.on("message", (topic, data: any) => {
      console.log(data, '收到消息')
      const type = JSON.parse(data).type;
      console.log(JSON.parse(data), '收到消息')
      // 如果存在，直接调用
      const callBack = this.callBackMapping[type]; //执行订阅的回调
      if (callBack) {
        const currentWindow = getCurrent();
        currentWindow.setFocus()
        callBack.call(this, JSON.parse(data));
      }
    });
  }

  /**
   * @description: 发送消息
   * @param  {*}
   * @return {*}
   */
  publish(data: {
    type: string;
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    extra?: string;
  }) {
    const structData = {
      input_data: {},
      output_data: {},
      topic: BasicConfig.pubgin_topic,
      to: "",
      from: this.clientId,
      ...data,
      type: Utils.instruction(data.type),
    };
    console.log('发送消息')
    this.mqtt.publish(BasicConfig.pubgin_topic, JSON.stringify(structData));
  }

  /**
   * @description: 发送页面消息
   * @param  {*}
   * @return {*}
   */
  commonPublish(data: {
    type: string;
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    extra?: string;
  }) {
    const structData = {
      input_data: {},
      output_data: {},
      topic: BasicConfig.pubgin_topic,
      to: "",
      from: this.clientId,
      ...data,
      type: data.type,
    };
    this.mqtt.publish(BasicConfig.pubgin_topic, JSON.stringify(structData));
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
