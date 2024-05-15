//  request.js
import { http } from "@tauri-apps/api";
import { readTextFile } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { Utils } from ".";
import { BasicConfig } from "../constant/config";
import { sse } from "./SSEService";

export const getUrl = async (str: string) => {
    const path = await resolveResource('Config.ini')

    const config = await readTextFile(path)

    const INIData = Utils.parseINIString(config)
    let severUrl = BasicConfig.ServerUrl
    let tenantId = sse.tenantId || BasicConfig.TenantId
    if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].ServerUrl) {
        severUrl = INIData['ONCHAIN'].ServerUrl
    }
    // if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].TenantId) {
    //     tenantId = INIData['ONCHAIN'].TenantId
    // }

    if (str.startsWith('/opendata')) {
        return {
            url: severUrl + str,
            tenantId: tenantId
        }
    } else {
        return {
            url: severUrl + str,
            tenantId: tenantId
        }
    }
}

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
        baseURL: BasicConfig.ServerUrl,
        token: '',
        request: {
            headers: {
                Authorization: '',
                'User-Agent': 'OnChain-DesingFusion'
            },
            body: {},
            use: () => {
            },
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

    initAddress = (str: string, token: string) => {
        // this.interceptors.baseURL = `http://${str}:8000/plm`;
        this.interceptors.request.headers.Authorization = token
    };

    post = (url: string, data: Record<string, any>) => {
        return new Promise(async (resolve, reject) => {
            const requestBody = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            console.log({ ...requestBody, tenantId: tenantId }, "postData")
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "POST",
                    // 常规的json格式请求体发送
                    body: http.Body.json({ ...requestBody, tenantId: tenantId }),
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

    postFormData = (url: string, data: FormData) => {
        return new Promise(async (resolve, reject) => {
            const requestBody = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "POST",
                    // 常规的json格式请求体发送
                    body: http.Body.form(data),
                })
                .then((res) => {
                    // res为请求成功的回调数据
                    resolve(this.interceptors.response(res));
                })
                .catch((err) => {
                    console.log(err, 'errr')
                    reject(err);
                });
        });
    };

    put = (url: string, data: Record<string, any>, headers: Record<string, any> = {}) => {
        return new Promise(async (resolve, reject) => {
            const requestQuery = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "PUT",
                    // 常规的json格式请求体发送
                    query: { ...requestQuery, tenantId: tenantId },
                    ...headers
                })
                .then((res) => {
                    resolve(this.interceptors.response(res));
                })
                .catch((err) => {
                    console.log(url, data, headers, err, 'err')
                    reject(err);
                });
        });
    };

    postPut = (url: string, data: Record<string, any>, headers: Record<string, any> = {}) => {
        return new Promise(async (resolve, reject) => {
            const requestQuery = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "PUT",
                    // 常规的json格式请求体发送
                    body: http.Body.json({ ...requestQuery, tenantId: tenantId }),
                    // query: requestQuery,
                    ...headers
                })
                .then((res) => {
                    resolve(this.interceptors.response(res));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    get = (url: string, data: Record<string, any>, headers: Record<string, any> = {}) => {
        return new Promise(async (resolve, reject) => {
            const requestQuery = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "GET",
                    // 常规的json格式请求体发送
                    query: { ...requestQuery, tenantId: tenantId },
                    ...headers
                })
                .then((res) => {
                    resolve(this.interceptors.response(res));
                })
                .catch((err) => {
                    console.log(url, data, headers, err, 'err')
                    reject(err);
                });
        });
    };
}

export default Request;
