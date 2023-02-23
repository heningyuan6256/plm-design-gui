//  request.js
import { http } from "@tauri-apps/api";

class Request {
  constructor(config: Record<string, any>) {}

  interceptors = {
    baseURL: "http://124.71.151.153:8000/plm",
    requert: {
      headers: {},
      body: {},
      use: () => {},
    },
    response: (response: Record<string, any>) => {
      return new Promise((rec, rej) => {
        if (response.data.code == 200) {
          rec(response.data);
        }
      });
    },
  };
  
  post = (url: string, data: Record<string, any>) => {
    return new Promise((resolve) => {
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
        });
    });
  };
  get = (url: string, data: Record<string, any>) => {
    return new Promise((resolve) => {
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
        });
    });
  };
}

export default Request;
