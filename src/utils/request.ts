//  request.js
import { http } from "@tauri-apps/api";

class Request {
  static single: Request;
  constructor(config: Record<string, any>) {
    if (Request.single) {
      return Request.single;
    } else {
      return (Request.single = this);
    }
  }

  interceptors = {
    baseURL: "http://124.71.151.153:8000/plm",
    requert: {
      headers: {},
      body: {},
      use: () => {},
    },
    response: (response: Record<string, any>) => {
      return new Promise((rec, rej) => {
        if (response.data.success) {
          rec(response.data);
        } else {
          rej(response.data);
        }
      });
    },
  };

  initAddress = (str: string) => {
    this.interceptors.baseURL = `http://${str}:8000/plm`;
  };

  post = (url: string, data: Record<string, any>) => {
    return new Promise((resolve, reject) => {
      const requestBody = { ...data, ...this.interceptors.requert.body };
      const requestHeaders = { ...this.interceptors.requert.headers };
      this.interceptors.requert.use();
      http
        .fetch(this.interceptors.baseURL + url, {
          headers: requestHeaders,
          method: "POST",
          // 常规的json格式请求体发送
          body: http.Body.json(requestBody),
        })
        .then((res) => {
          // res为请求成功的回调数据
          resolve(this.interceptors.response(res));
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  get = (url: string, data: Record<string, any>) => {
    return new Promise((resolve, reject) => {
      const requestQuery = { ...data, ...this.interceptors.requert.body };
      const requestHeaders = { ...this.interceptors.requert.headers };
      this.interceptors.requert.use();
      http
        .fetch(this.interceptors.baseURL + url, {
          headers: requestHeaders,
          method: "GET",
          // 常规的json格式请求体发送
          query: requestQuery,
        })
        .then((res) => {
          // res为请求成功的回调数据
          resolve(this.interceptors.response(res));
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export default Request;
