//@ts-ignore
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
window.EventSource = NativeEventSource || EventSourcePolyfill;

class SSEService {
  /**
   * 单例 保证拿到的都是同一个实例
   */
  static instance: SSEService;
  static get Instance() {
    if (!this.instance) {
      this.instance = new SSEService();
    }
    return this.instance;
  }
  baseUrl: string;
  es: EventSourcePolyfill;
  callBackMapping: Record<string, any>;
  userId: string;
  token: string;
  constructor(url: string = 'http://localhost:8080/sse') {
    this.baseUrl = url;
    this.es = {} as EventSourcePolyfill;
    this.callBackMapping = {};
    this.userId = ''
    this.token = ''
  }

  /**
   * @description: 定义连接SSE服务器的方法
   * @param  {*}
   * @return {*}
   */
  connect(url = 'http://localhost:8080/sse') {
    if (!window.EventSource) {
      return console.log('您的浏览器不支持EventSource');
    }
    url = url ? url : this.baseUrl;

    this.es = new EventSourcePolyfill(url, {
      headers: {
        Authorization: this.token,
      },
    });
    this.es.onopen = (res: any) => {
      console.log('SSE在连接中');
    };
    // this.es.close = () => {
    //   console.log("SSE连接失败/关闭");
    // };
    this.es.onmessage = async (res: any) => {
      // console.log('接收到SEE数据', res);
      const result = JSON.parse(res.data).seq_context;
      const toUserList = result.msg.target ? result.msg.target.split(',') : [];
      // 如果是退出挤用户的情况，则判断消息的源头如果等于当前的则不挤用户，否则挤用户
      // console.log(, 'document.Browser.Agent');
      // if(){

      // }
      if (
        (result.cmd === 'global.instanceNumberCreated' ||
          result.cmd === 'instance.workflowUpdate') &&
        result.msg.from === this.userId
      ) {
        return;
      }
      // 要传给消息的用户为空或者包含了当前用户或者包含*的用户
      if (
        toUserList.length === 0 ||
        toUserList.includes(this.userId) ||
        toUserList.includes('*')
      ) {
        // 如果存在，直接调用
        const callBack = this.callBackMapping[result.cmd]; //执行订阅的回调
        if (callBack) {
          if (result.cmd) {
            callBack.call(this, result.msg.msg);
          }
        }
      }
    };

    this.es.addEventListener('stats', (res: any) => {
      // 测试超过1000s
      // if (
      //   StorageController.isScreen.get() == '0' &&
      //   new Date().getTime() -
      //     Number(StorageController.latestOperateTime.get()) >
      //     Number(StorageController.screenWaitTime.get()) * 60 * 60 * 1000
      // ) {
      //   // SNBUtils.sendMessage(
      //   //   'global.lockScreen',
      //   //   StorageController.userId.get(),
      //   // );
      // }
    });

    this.es.addEventListener('end', () => {
      console.log('结束');
    });
  }

  /**
   * @description: SSE关闭方法
   * @param  {*}
   * @return {*}
   */
  close() {
    this.es.close && this.es.close();
  }

  /**
   * @description: 注册回调函数
   * @param  {*}
   * @return {*}
   */
  registerCallBack(
    socketType: string,
    callBack: (data: Record<string, any>) => void,
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

const sse = SSEService.Instance;

export { sse };

// const generateSseUrl = (params: Record<string, any>) => {
//   // http://192.168.0.143:8080/?eventType=program:1234:views,program:1234:poll,program:1234:annotation
//   return `http://192.168.0.143:18080/plm/sse/subscribe/${params.userId}?clientIds=${params.clientIds}`
// }
