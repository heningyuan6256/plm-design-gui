/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */

import React, { Fragment, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlmLoading from "../components/PlmLoading";
import { Outlet, useNavigate } from "react-router-dom";
import Head from "./head";
import Foot from "./foot";
import Left from "./left";
import { TauriEvent, listen } from "@tauri-apps/api/event";
import { mqttClient } from "../utils/MqttService";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { sse } from "../utils/SSEService";
import API from "../utils/api";
import { Utils } from "../utils";
import { getClient, ResponseType } from "@tauri-apps/api/http";
import { homeDir } from "@tauri-apps/api/path";
import { createDir, exists, readTextFile, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { BasicsItemCode, ItemCode } from "../constant/itemCode";
import { Command, open } from "@tauri-apps/api/shell";
import { message } from "antd";
import { setLoading } from "../models/loading";
import { useAsyncEffect, useMemoizedFn, useMount } from "ahooks";
import { invoke } from "@tauri-apps/api";
import { fetchMessageData } from "../models/message";
import { readPermission } from "../components/PlmMosaic";
import RecLocation from "../utils/upload/recLocation";
import { confirm } from "@tauri-apps/api/dialog";
interface LayoutProps {
  children?: React.ReactNode;
}

export const openDesign = async ({
  loading,
  cancelLoading,
  insId,
  userId,
  network,
  itemCode,
  extra
}: {
  loading: () => void;
  cancelLoading: () => void;
  insId: string;
  network: string;
  userId: string;
  itemCode: string;
  extra?: {
    onEvent?: (path: string) => any
  }
}) => {
  if (ItemCode.isMaterial(itemCode)) {
    const {
      result: { records },
    }: any = await API.queryInstanceTab({
      instanceId: insId,
      itemCode: BasicsItemCode.material,
      pageNo: "1",
      pageSize: "1000",
      tabCode: "10002028",
      tabCodes: "10002028",
      tenantId: sse.tenantId || "719",
      userId: userId,
    }).catch(() => {
      cancelLoading();
    });;
    insId = records ? records[0]?.insId : '';
  }
  if (!insId) {
    message.error("该物料没有对应的设计文件");
    return;
  }

  loading();
  const currentWindow = getCurrent();
  await currentWindow.unminimize();

  currentWindow.setFocus();
  const versionOrderResult: any = await API.queryInsVersionOrder(insId).catch(() => {
    cancelLoading();
  });
  const orders = versionOrderResult.result[insId].orders;
  const versions = versionOrderResult.result[insId].versions;
  API.getInstanceInfoById({
    instanceId: insId,
    authType: "read",
    tabCode: "10002001",
    tenantId: sse.tenantId || "719",
    userId: userId,
    versionOrder: orders[orders.length - 1],
    version: versions[versions.length - 1],
  })
    .then(async (ins: any) => {
      const attrMap = Utils.transformArrayToMap(
        ins.result.pdmAttributeCustomizedVoList,
        "apicode",
        "id"
      );
      const instance = ins.result.readInstanceVo;
      const fileUrl = instance.attributes[attrMap["FileUrl"]];
      const fileName = instance.attributes[attrMap["Description"]];
      const client = await getClient();

      try {
        const homeDirPath = await homeDir();
        const existSetting = await exists(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`)
        const defaultSettingStr = existSetting ? await readTextFile(
          `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`
        ) : '';

        const defaultSetting = defaultSettingStr ? JSON.parse(defaultSettingStr) : {}

        let downloadFolder = defaultSetting?.default || `${homeDirPath}${BasicConfig.APPCacheFolder}`

        downloadFolder = `${downloadFolder}\\${instance.productName}`

        if (!readPermission(instance.number)) {
          message.error("无当前实例查看权限")
          cancelLoading && cancelLoading()
          return
        }

        if (!readPermission(instance.productName)) {
          message.error("无当前实例的产品查看权限")
          cancelLoading && cancelLoading()
          return
        }

        if (!(await exists(downloadFolder))) {
          // 不存在产品的文件夹的话则创建产品文件夹
          await createDir(
            `${downloadFolder}`,
            { recursive: true }
          ).catch(() => {
            cancelLoading();
          });
        }

        const locationData = await RecLocation.getLocation(instance.insId)
        let openpath = `${downloadFolder +
          "\\" +
          fileName +
          "\\" +
          instance.insDesc}`;

        // 如果文件在本地有对应的映射位置，则判断版次
        if (locationData && locationData.location) {
          openpath = locationData.location
          if (locationData.revision != instance.insVersionOrderUnbound) {
            const comfirmed = await confirm(`${instance.insDesc}最新的版次为${instance.insVersionOrderUnbound},而本地的版次为${locationData.revision},是否覆盖本地文件？`, { title: '冲突', type: 'warning' });
            if (comfirmed) {
              let successed = true
              const parentFile: any = await client.get(
                `${network}/api/plm${fileUrl.split("/plm")[1]}`,
                {
                  responseType: ResponseType.Binary,
                }
              ).catch((err) => {
                message.error(err);
                successed = false
                cancelLoading();
              });
              await writeBinaryFile({
                path: locationData.location,
                contents: parentFile.data,
              }).catch(() => {
                successed = false
                cancelLoading();
              });
              if(successed) {
                await RecLocation.modefiedLocation({
                  insId: instance.insId,
                  fileName: instance.insDesc,
                  location: locationData.location,
                  revision: instance.insVersionOrderUnbound,
                  lastModified: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
                })
              }
            }
          }
        } else {
          const parentFile: any = await client.get(
            `${network}/api/plm${fileUrl.split("/plm")[1]}`,
            {
              responseType: ResponseType.Binary,
            }
          ).catch((err) => {
            message.error(err);
            cancelLoading();
          });

          await createDir(
            `${downloadFolder}\\${fileName}`,
            { recursive: true }
          ).catch(() => {
            cancelLoading();
          });

          await writeBinaryFile({
            path: `${downloadFolder}\\${fileName}\\${instance.insDesc}`,
            contents: parentFile.data,
          }).catch(() => {
            cancelLoading();
          });
        }

        const {
          result: { records },
        }: any = await API.queryInstanceTab({
          instanceId: insId,
          itemCode: BasicsItemCode.file,
          pageNo: "1",
          pageSize: "1000",
          tabCode: "10002016",
          tabCodes: "10002016",
          tenantId: sse.tenantId || "719",
          userId: userId,
          versionOrder: ins.result.readInstanceVo.insVersionOrder,
        }).catch(() => {
          cancelLoading();
        });

        const loop = async (data: any) => {
          for (let i = 0; i < data.length; i++) {
            const locationChildData = await RecLocation.getLocation(data[i].insId)
            if (locationChildData && locationChildData.revision) {
              if (data[i].insVersionOrderUnbound != locationChildData.revision) {
                const comfirmed = await confirm(`${data[i].insDesc}最新的版次为${data[i].insVersionOrderUnbound},而本地的版次为${locationChildData.revision},是否覆盖本地文件？`, { title: '冲突', type: 'warning' });
                if (comfirmed) {
                  let successed = true
                  const response: any = await client.get(
                    `${network}/api/plm${data[i].attributes[attrMap["FileUrl"]].split("/plm")[1]
                    }`,
                    {
                      // the expected response type
                      responseType: ResponseType.Binary,
                    }
                  ).catch(() => {
                    successed = false
                    cancelLoading();
                  });
                  
                  await writeBinaryFile({
                    path: locationChildData.location,
                    contents: response.data,
                  }).catch(() => {
                    successed = false
                    cancelLoading();
                  });;

                  if(successed) {
                    await RecLocation.modefiedLocation({
                      insId: data[i].insId,
                      fileName: data[i].insDesc,
                      location: locationChildData.location,
                      revision: data[i].insVersionOrderUnbound,
                      lastModified: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
                    })
                  }
                }
              }
            } else {
              const response: any = await client.get(
                `${network}/api/plm${data[i].attributes[attrMap["FileUrl"]].split("/plm")[1]
                }`,
                {
                  // the expected response type
                  responseType: ResponseType.Binary,
                }
              );
              await writeBinaryFile({
                path: `${downloadFolder}\\${fileName}\\${data[i].insDesc}`,
                contents: response.data,
              });
            }
            if (data[i].children && data[i].children.length) {
              await loop(data[i].children);
            }
          }
        };

        if (records?.length) {
          await loop(records || []);
        }


        console.log(openpath,'openpathopenpath')
        if (extra && extra.onEvent) {
          extra.onEvent(`"${openpath}"`)
          cancelLoading();
        } else {
          await invoke("open_designer", {
            path: `"${openpath.substring(0, openpath.lastIndexOf("\\"))}"`
          })
          await invoke("open_designer", {
            path: `"${openpath}"`
          })
          cancelLoading()
        }


      } catch (error: any) {
        message.error(error);
        cancelLoading();
      }
    })
    .catch((e) => {
      cancelLoading();
    });
};

const PageLayout: React.FC<LayoutProps> = (data) => {
  const { value: user } = useSelector((state: any) => state.user);
  const { value: loading } = useSelector((state: any) => state.loading);
  const { value: network } = useSelector((state: any) => state.network);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openDesignWarpper = useMemoizedFn((insId: any) => {
    openDesign({
      loading: () => {
        dispatch(setLoading(true));
      },
      cancelLoading: () => {
        dispatch(setLoading(false));
      },
      network: network,
      insId: insId,
      userId: user.id,
      itemCode: "10001006",
    });
  });

  useAsyncEffect(async () => {
    if (user.id) {
      dispatch(fetchMessageData({
        parInsId: user.id,
        pageNo: "1",
        pageSize: "1000"
      }) as any)
    }
  }, [user])

  useMount(() => {
    // const command = new Command(
    //   "start",
    //   [
    //     // installDir + "SOLIDWORKS.exe",
    //     'start',
    //     `D:\\SOLIDWORKS2020\\SOLIDWORKS\\SLDWORKS.exe`,
    //     // homeDirPath +
    //     //   BasicConfig.APPCacheFolder +
    //     //   "\\" +
    //     //   fileName +
    //     //   "\\" +
    //     //   instance.insDesc,
    //   ],
    //   // {cwd: "C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS
    //   { encoding: "GBK" }
    // );
    // command.stderr.on("data", (args) => {
    //   console.log("args", ...args);
    // });

    // command.stdout.on("data", async (line: string) => {
    //   console.log("line", ...line);
    // });
    // command.execute();


    listen("onchain", async (matchUrl: any) => {
      if (mqttClient.publishTopic === 'Altium') {
        navigate(`/home/${Math.random()}`);
        const currentWindow = getCurrent();
        currentWindow.setFocus()
      }
    })
  })

  // useAsyncEffect(async()=>{
  //   const homeDirPath = await homeDir();
  //   const defaultSettingStr = await readTextFile(
  //    `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`
  //  );

  //  const defaultSetting = JSON.parse(defaultSettingStr)

  //  const downloadFolder = defaultSetting?.default || `${homeDirPath}${BasicConfig.APPCacheFolder}`
  //  console.log(downloadFolder,'downloadFolder');
  //  await writeTextFile(`${downloadFolder}\\aaa.txt`,"123")

  // }, [])

  useEffect(() => {
    sse.registerCallBack("open_design", (insId) => {
      openDesignWarpper(insId);
    });
    const currentWindow = getCurrent();
    currentWindow.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (e) => {
      mqttClient.publish({
        type: CommandConfig.onchain_path,
        input_data: PathConfig.login,
        output_data: {
          result: "exit",
        },
      });

      setTimeout(() => {
        currentWindow?.close();
      }, 200);
    });

    return () => {
      sse.unRegisterCallBack("open_design");
    };
  }, []);

  const dataState = useRef(loading);
  dataState.current = loading;

  useEffect(() => {
    mqttClient.loading = dataState;
  }, []);

  if (!user.id) {
    return <PlmLoading loading={true}></PlmLoading>;
  }

  return (
    <PlmLoading loading={loading} warrperClassName="flex">
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* 头部 */}
        <Head></Head>
        <div className="h-full w-full flex overflow-hidden">
          <Left></Left>
          <div className="h-full w-full overflow-hidden">
            <Outlet></Outlet>
          </div>
        </div>
        {/* 尾部 */}
        <Foot></Foot>
      </div>
    </PlmLoading>
  );
};

export default PageLayout;
