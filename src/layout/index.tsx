/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 所有页面通用布局
 */

import { useAsyncEffect } from "ahooks";
import React, { Fragment } from "react";
import { homeDir } from "@tauri-apps/api/path";
import {
  writeFile,
  readTextFile,
  createDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { BasicConfig } from "../constant/config";
import { fetchUserByToken } from "../models/user";
import { useDispatch } from "react-redux";
import Request from "../utils/request";
import { removeFile } from "@tauri-apps/api/fs";
import { writeNetWork } from "../models/network";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { Command } from "@tauri-apps/api/shell";


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();

  useAsyncEffect(async () => {
    const ffmpeg = Command.sidecar("binaries/OnChain_DesignFusion", ['-t','solidworks','-m','create-cube'], {encoding: "GBK"});
    ffmpeg.on('error', (...args) => {
      console.log(args,'error-args');
    })
    ffmpeg.on('close', (...args) => {
      console.log(args,'close-args');
    })

    ffmpeg.stdout.addListener("data", (data) => console.log("CMD_OUT: " + data))
    ffmpeg.stderr.addListener("data", (data) => console.log("CMD_ERR: " + data))
    
    ffmpeg.execute()
    // const aa = await ffmpeg.execute();

    // console.log(aa, 'aa')
    await invoke("init");

    const homeDirPath = await homeDir();
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
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default Layout;
