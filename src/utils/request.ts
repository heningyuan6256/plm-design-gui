//  request.js
import { http } from "@tauri-apps/api";
import { exists, readTextFile } from "@tauri-apps/api/fs";
import { homeDir, resolveResource } from "@tauri-apps/api/path";
import { Utils } from ".";
import { BasicConfig } from "../constant/config";
import { sse } from "./SSEService";
import { message } from "antd";
import { exitPlugin } from "../pages";
import { getCurrent } from "@tauri-apps/api/window";

const noAuthMessage = '验证超时，请重新登陆！'

export const getUrl = async (str: string) => {
    // const path = await resolveResource('Config.ini')

    // const config = await readTextFile(path)

    // const INIData = Utils.parseINIString(config)
    const homeDirPath = await homeDir();
    const networkAddr = `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`
    const existNet = await exists(networkAddr)
    const networkAddress = existNet ? await readTextFile(networkAddr) : '';
    //@ts-ignore
    let severUrl = `${networkAddress}/api/plm`
    let tenantId = sse.tenantId || BasicConfig.TenantId
    // if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].ServerUrl) {
    //     severUrl = INIData['ONCHAIN'].ServerUrl
    // }
    // if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].TenantId) {
    //     tenantId = INIData['ONCHAIN'].TenantId
    // }

    if (str.startsWith('/opendata')) {
        return {
            // url: 'http://192.168.0.66:19220/plm' + str,
            url: severUrl + str,
            tenantId: tenantId
        }
    } else {
        return {
            url: severUrl + str,
            // url: 'http://192.168.0.66:18080/plm-test' + str,
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
        //@ts-ignore
        baseURL: window.onchain_network + '/api/plm',
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

    post = (url: string, data: any) => {
        return new Promise(async (resolve, reject) => {
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            const requestBody = (data instanceof Array) ? data : { ...data, ...this.interceptors.request.body, tenantId: tenantId };
            console.log(requestBody, 'requestBody')
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "POST",
                    // 常规的json格式请求体发送
                    body: http.Body.json(requestBody),
                })
                .then((res: any) => {
                    console.log(res, 'responseBody')
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }
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
                .then((res: any) => {
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }

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
                .then((res: any) => {
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }

                })
                .catch((err) => {
                    console.log(url, data, headers, err, 'err')
                    reject(err);
                });
        });
    };

    delete = (url: string, data: Record<string, any>, headers: Record<string, any> = {}) => {
        return new Promise(async (resolve, reject) => {
            const requestQuery = { ...data, ...this.interceptors.request.body };
            const requestHeaders = { ...this.interceptors.request.headers };
            this.interceptors.request.use();
            const { url: serverUrl, tenantId: tenantId } = await getUrl(url)
            http
                .fetch(serverUrl, {
                    headers: requestHeaders,
                    method: "DELETE",
                    // 常规的json格式请求体发送
                    query: { ...requestQuery, tenantId: tenantId },
                    ...headers
                })
                .then((res: any) => {
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }
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
                .then((res: any) => {
                    console.log("修改成功之后的返回")
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }

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
                .then((res: any) => {
                    if (res.status == 401) {
                        const win = getCurrent();
                        if (win.label != 'Login') {
                            message.error(noAuthMessage)
                            reject(noAuthMessage);
                            exitPlugin()
                        }
                    } else {
                        if (res?.data?.code == "400" || res?.data?.code == "500") {
                            const errorMsg = res?.data?.message
                            message.error(errorMsg)
                            reject(errorMsg);
                        } else {
                            resolve(this.interceptors.response(res));
                        }
                    }
                })
                .catch((err) => {
                    // message.error(err)
                    console.log(url, data, headers, err, 'err')
                    reject(err);
                });
        });
    };
}

export default Request;
