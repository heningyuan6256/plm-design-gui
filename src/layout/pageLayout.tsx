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
import { getCurrent } from "@tauri-apps/api/window";
import { sse } from "../utils/SSEService";
import API from "../utils/api";
import { Utils } from "../utils";
import { getClient, ResponseType } from "@tauri-apps/api/http";
import { homeDir } from "@tauri-apps/api/path";
import { createDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { BasicsItemCode, ItemCode } from "../constant/itemCode";
import { Command } from "@tauri-apps/api/shell";
import { message } from "antd";
import { setLoading } from "../models/loading";
import { useMemoizedFn, useMount } from "ahooks";
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
}: {
  loading: () => void;
  cancelLoading: () => void;
  insId: string;
  network: string;
  userId: string;
  itemCode: string;
}) => {
  if (ItemCode.isMaterial(itemCode)) {
    const {
      result: { records },
    }: any = await API.queryInstanceTab({
      instanceId: insId,
      itemCode: BasicsItemCode.material,
      pageNo: "1",
      pageSize: "500",
      tabCode: "10002028",
      tabCodes: "10002028",
      tenantId: "719",
      userId: userId,
    });
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
  const versionOrderResult: any = await API.queryInsVersionOrder(insId);
  const orders = versionOrderResult.result[insId].orders;
  const versions = versionOrderResult.result[insId].versions;
  API.getInstanceInfoById({
    instanceId: insId,
    authType: "read",
    tabCode: "10002001",
    tenantId: "719",
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
        API.downloadFile(fileUrl.split("/plm")[1])
          .then((res) => {})
          .catch(async (res) => {
            const homeDirPath = await homeDir();
            await createDir(
              `${homeDirPath}${BasicConfig.APPCacheFolder}/${fileName}`,
              { recursive: true }
            );
            await writeBinaryFile({
              path: `${homeDirPath}${BasicConfig.APPCacheFolder}/${fileName}/${instance.insDesc}`,
              contents: res,
            });

            const {
              result: { records },
            }: any = await API.queryInstanceTab({
              instanceId: insId,
              itemCode: BasicsItemCode.file,
              pageNo: "1",
              pageSize: "500",
              tabCode: "10002016",
              tabCodes: "10002016",
              tenantId: "719",
              userId: userId,
              versionOrder: ins.result.readInstanceVo.insVersionOrder,
            });

            const loop = async (data: any) => {
              for (let i = 0; i < data.length; i++) {
                const response: any = await client.get(
                  `http://${network}/api/plm${
                    data[i].attributes[attrMap["FileUrl"]].split("/plm")[1]
                  }`,
                  {
                    // the expected response type
                    responseType: ResponseType.Binary,
                  }
                );
                console.log(response);
                await writeBinaryFile({
                  path: `${homeDirPath}${BasicConfig.APPCacheFolder}/${fileName}/${data[i].insDesc}`,
                  contents: response.data,
                });
                if (data[i].children && data[i].children.length) {
                  loop(data[i].children);
                }
              }
            };
            await loop(records || []);
            cancelLoading();

            const fileFormat = instance.insDesc.substring(
              instance.insDesc.indexOf(".") + 1
            );


            if (
              ["CATProduct", "CATPart", "CATPRODUCT", "CATPART"].includes(
                fileFormat
              )
            ) {
              const command = new Command(
                "runCatia",
                [
                  // installDir + "SOLIDWORKS.exe",
                  // 'C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS\\SOLIDWORKS.exe',
                  "-object",
                  homeDirPath +
                    BasicConfig.APPCacheFolder +
                    "\\" +
                    fileName +
                    "\\" +
                    instance.insDesc,
                ]
                // {cwd: "C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS
                // { encoding: "GBK" }
              );
              command.stderr.on("data", (args) => {
                console.log("args", ...args);
              });

              command.stdout.on("data", async (line: string) => {
                console.log("line", ...line);
              });
              command.execute();
            } else if (
              ["sldprt", "sldasm", "SLDPRT", "SLDASM"].includes(fileFormat)
            ) {
              const regCommand = new Command(
                "reg",
                [
                  "query",
                  `HKEY_LOCAL_MACHINE\\SOFTWARE\\SolidWorks\\SOLIDWORKS ${BasicConfig.plugin_version}\\Setup`,
                  "/v",
                  "SolidWorks Folder",
                ],
                { encoding: "GBK" }
              );
              // const homeDirPath = await homeDir();
              regCommand.stdout.on("data", async (line: string) => {
                const installDir = line
                  .replace("REG_SZ", "")
                  .replace("SolidWorks Folder", "")
                  .trim();
                if (
                  installDir &&
                  installDir.indexOf("HKEY_LOCAL_MACHINE") == -1
                ) {
                  // console.log(installDir + "SOLIDWORKS.exe",homeDirPath + BasicConfig.APPCacheFolder + '\\' + fileName + '\\' +  instance.insDesc,'installDir');

                  // let command = new Command('PlayerLogic', ['SOLIDWORKS.exe'], { cwd: 'C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS' })
                  // command.execute()
                  const command = new Command(
                    "rundesign",
                    [
                      // installDir + "SOLIDWORKS.exe",
                      // 'C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS\\SOLIDWORKS.exe',
                      homeDirPath +
                        BasicConfig.APPCacheFolder +
                        "\\" +
                        fileName +
                        "\\" +
                        instance.insDesc,
                    ]
                    // {cwd: "C:\\Program Files\\SOLIDWORKS Corp\\SOLIDWORKS
                    // { encoding: "GBK" }
                  );
                  command.stderr.on("data", (args) => {
                    console.log("args", ...args);
                  });

                  command.stdout.on("data", async (line: string) => {
                    console.log("line", ...line);
                  });
                  command.execute();
                }
              });
              regCommand.stderr.on("data", (err) => {
                message.error(err);
                cancelLoading();
              });
              regCommand.execute();
            }
          })
          .catch((err) => {
            message.error(err);
            cancelLoading();
          });
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

  useMount(() => {
    listen("onchain", async (matchUrl: any) => {
      if(matchUrl.payload === 'Altium'){
        navigate(`/home/${Math.random()}`);
        const currentWindow = getCurrent();
        currentWindow.setFocus()
      }
    })
  })

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
