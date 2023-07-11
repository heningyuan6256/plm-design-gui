import mqtt, { MqttClient } from "mqtt";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
import { Utils } from ".";
import { getCurrent, appWindow } from "@tauri-apps/api/window";
import { getMatches } from '@tauri-apps/api/cli'

type EventFn = () => void;
interface Event {
  updatePid: Set<(pid: string) => void>
}
interface CallbackType {
  (data: ReturnType<MqttService['formatData']>): void;
}
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
  publishTopic: string;
  callBackMapping: Record<string, CallbackType | null>;
  machineId: string;
  pid: string;
  event: Event;
  constructor(url: string = BasicConfig.MqttConnectUrl) {
    this.baseUrl = url;
    this.mqtt = {} as MqttClient;
    this.callBackMapping = {};
    this.pid = ''
    this.machineId = ''
    this.event = {
      updatePid: new Set()
    }
    this.publishTopic = `${BasicConfig.pubgin_topic}`
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
    getMatches().then((matches) => {

      console.log(matches, 'matches')
      // do something with the { args, subcommand } matches
      this.machineId = topic ? `_${topic}` : ''
      const pid: any = matches?.args?.pid?.value || ''
      const tc: any = matches?.args?.topic?.value || ''
      this.pid = pid
      this.publishTopic = tc
      // this.pid = '16796'
      // this.publishTopic = 'sw'
      this.mqtt.subscribe(`${BasicConfig.onchain_topic + this.machineId}`);
      this.mqtt.on("connect", () => {
        console.log("成功建立连接");
      });
      this.mqtt.on("message", (topic, data: any) => {
        const value = this.formatData(data)
        console.log(value, '收到消息')

        const type = value.type;
        this.publishTopic = value.topic

        this.updatePid(data)
        // 如果存在，直接调用
        const callBack = this.callBackMapping[type]; //执行订阅的回调
        if (callBack) {
          const currentWindow = getCurrent();
          currentWindow.setFocus()
          callBack.call(this, value);
        }
      });
    })
  }

  formatData(data: string): { type: string, pid: string, [k: string]: any } {
    return JSON.parse(data)
  }

  updatePid(data: string) {
    this.pid = JSON.parse(data).pid
    this.event.updatePid.forEach(i => i(this.pid))
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
    [k: string]: any
  }) {
    const structData = {
      input_data: {},
      output_data: {},
      topic: this.publishTopic,
      pid: this.pid,
      ...data,
      type: Utils.instruction(data.type),
    };
    console.log('发送消息', `${this.publishTopic + this.machineId}`, structData)
    this.mqtt.publish(`${this.publishTopic + this.machineId}`, JSON.stringify(structData));
  }

  /**
   * @description: 发送页面消息
   * @param  {*}
   * @return {*}
   */
  commonPublish(data: {
    type: string;
    input_data?: Record<string, any> | string;
    output_data?: Record<string, any>;
    extra?: string;
  }) {
    const structData = {
      input_data: {},
      output_data: {},
      topic: BasicConfig.pubgin_topic,
      ...data,
      pid: this.pid,
      type: data.type,
    };
    console.log('发送消息', `${this.publishTopic + this.machineId}`, structData)
    this.mqtt.publish(`${this.publishTopic + this.machineId}`, JSON.stringify(structData));
  }

  /**
   * @description: 注册回调函数
   * @param  {*}
   * @return {*}
   */
  registerCallBack(
    socketType: string,
    callBack: CallbackType
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
