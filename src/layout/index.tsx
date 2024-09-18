/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 所有页面通用布局
 */

import { useAsyncEffect } from "ahooks";
import React, { Fragment, useEffect } from "react";
import { homeDir } from "@tauri-apps/api/path";
import {
  writeFile,
  readTextFile,
  createDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
import { fetchUserByToken } from "../models/user";
import { useDispatch } from "react-redux";
import Request from "../utils/request";
import { removeFile } from "@tauri-apps/api/fs";
import { writeNetWork } from "../models/network";
import { invoke } from "@tauri-apps/api";
import { appWindow, getCurrent, WebviewWindow } from "@tauri-apps/api/window";
import { Command } from "@tauri-apps/api/shell";
import { mqttClient } from "../utils/MqttService";
// import CryptoJS from "crypto-js"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();

  useAsyncEffect(async () => {
    document.addEventListener('DOMContentLoaded', () => {
      // This will wait for the window to load, but you could  
      // run this function on whatever trigger you want  
      invoke('close_splashscreen')
    })
    const command = new Command(
      "reg",
      [
        "query",
        "HKEY_Local_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion",
        "/v",
        "ProductId",
      ],
      { encoding: "GBK" }
    );
    command.on("close", (data) => { });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", async (line: string) => {
      const dynamicTopic = line.split(/\s+/)[3];
      if (dynamicTopic) {
        mqttClient?.connect(BasicConfig.MqttConnectUrl, dynamicTopic);
        const homeDirPath = await homeDir();
        await invoke("init");
        let networkAddress = "";
        try {
          networkAddress = await readTextFile(
            `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`
          );
        } catch (error) { }

        if (networkAddress) {
          // 写入address
          const NewRequest = new Request({});

          const homeDirPath = await homeDir();
          await writeFile(
            `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`,
            networkAddress
          );
          dispatch(writeNetWork(networkAddress));

          let tokenTxt = "";
          try {
            // 从本地获取token，如果能获取到token信息，则直接登录，token信息正确，则登录成功，否则重新输入，清空本地token文件
            tokenTxt = await readTextFile(
              `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.TokenCache}`
            );
          } catch (error) { }

          if (tokenTxt) {
            NewRequest.initAddress(networkAddress, tokenTxt);
            dispatch(fetchUserByToken(tokenTxt) as any);
          }
        } else {
          const homeDirPath = await homeDir();
          try {
            await removeFile(
              `${homeDirPath}${BasicConfig.APPCacheFolder}/token.txt`
            );
            await removeFile(
              `${homeDirPath}${BasicConfig.APPCacheFolder}/network.txt`
            );
          } catch (error) { }
          await invoke("exist", {});
          appWindow.close();
        }

      }
    });
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    command.execute();
  }, []);
  return <Fragment>
    <div
      data-tauri-drag-region
      className="absolute top-0 w-full h-4 z-10"
    ></div>
    {children}
  </Fragment>;
};

export default Layout;