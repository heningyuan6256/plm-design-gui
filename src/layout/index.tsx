import { useAsyncEffect } from "ahooks";
import React, { Fragment } from "react";
import { homeDir } from "@tauri-apps/api/path";
import { writeFile, readTextFile } from "@tauri-apps/api/fs";
import { BasicConfig } from "../constant/config";
import { fetchUserByToken } from "../models/user";
import { useDispatch } from "react-redux";
import Request from "../utils/request";
import { removeFile } from "@tauri-apps/api/fs";
import { writeNetWork } from "../models/network";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";

/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();

  useAsyncEffect(async () => {
    const homeDirPath = await homeDir();

    const networkAddress = await readTextFile(
      `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`
    );

    if (networkAddress) {
      // 写入address
      const NewRequest = new Request({});

      const homeDirPath = await homeDir();
      await writeFile(
        `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`,
        networkAddress
      );
      dispatch(writeNetWork(networkAddress));

      // 从本地获取token，如果能获取到token信息，则直接登录，token信息正确，则登录成功，否则重新输入，清空本地token文件
      const tokenTxt = await readTextFile(
        `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.TokenCache}`
      );
      if (tokenTxt) {
        NewRequest.initAddress(networkAddress, tokenTxt);
        dispatch(fetchUserByToken(tokenTxt) as any);
      }
    } else {
      const homeDirPath = await homeDir();
      await removeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/token.txt`);
      await removeFile(
        `${homeDirPath}${BasicConfig.APPCacheFolder}/network.txt`
      );
      await invoke("exist", {});
    }
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default Layout;
