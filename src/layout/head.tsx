/**
 * Author: hny_147
 * Date: 2023/03/12 15:36:01
 * Description: 标注页头
 */

import OnChainLogo from "../assets/image/OnChainLogo.svg";
import { invoke } from "@tauri-apps/api";
import { removeFile } from "@tauri-apps/api/fs";
import { WebviewWindow, appWindow, getCurrent } from "@tauri-apps/api/window";
import { FC, useEffect, useState } from "react";
import PlmIcon from "../components/PlmIcon";
import { homeDir } from "@tauri-apps/api/path";
import { BasicConfig } from "../constant/config";
import { exit } from "@tauri-apps/api/process";
import { listen } from "@tauri-apps/api/event";
import { useMount } from "ahooks";

const Head: FC = () => {
  const [isMaximized, setisMaximized] = useState<boolean>(false);

  // useEffect(() => {
  //   const win = getCurrent();
  //   win.listen("tauri://resize", async (e) => {
  //     // const maxed = await appWindow.isMaximized();
  //     // setisMaximized(maxed);
  //   });
  // }, []);

  // 退出登录
  const logOut = async () => {
    const homeDirPath = await homeDir();
    await removeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/token.txt`);
    const mainWindow = WebviewWindow.getByLabel("Home");
    mainWindow?.close();
    await invoke("exist", {});
  };

  const exist = async () => {
    exit();
  };

  // 拖拽窗体
  const handleMouseDown = (e: { button: number }) => {
    if (e.button === 0) {
      invoke("drag_window");
    }
  };
  // 最大化
  const handleWinMax = async () => {
    console.log(123);

    // const resizable = await appWindow.isResizable();
    // if (!resizable) return;
    // await
    await appWindow.toggleMaximize();
    // const maxed = await appWindow.isMaximized();
    // console.log(maxed, "maxed");

    // setisMaximized(maxed);
  };

  // 最小化
  const handleWinMin = async () => {
    await appWindow.minimize();
  };

  return (
    <div
      // data-tauri-drag-region
      onMouseDown={handleMouseDown}
      onDoubleClick={() => {
        handleWinMax();
      }}
      className="h-10 bg-primary flex items-center px-4 justify-between"
    >
      <div className="flex gap-1 items-center">
        <img width={88} src={OnChainLogo} alt="" />{" "}
        <div className="text-white text-xs self-end flex">DesignFusion</div>
      </div>
      <div></div>
      <div></div>
      <div>
        <PlmIcon
          name="minimize"
          onClick={handleWinMin}
          className="text-xs text-white cursor-pointer opacity-80 mr-3 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
        <PlmIcon
          name={!isMaximized ? "reduce" : "amplify"}
          onClick={handleWinMax}
          className="text-xs text-white cursor-pointer opacity-80 mr-3 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
        <PlmIcon
          name="close"
          onClick={exist}
          className="text-xs text-white cursor-pointer opacity-80 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
      </div>
    </div>
  );
};

export default Head;
