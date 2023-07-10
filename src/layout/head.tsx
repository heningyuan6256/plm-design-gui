/**
 * Author: hny_147
 * Date: 2023/03/12 15:36:01
 * Description: 标注页头
 */

import OnChainLogo from "../assets/image/singlelogo.svg";
import { invoke } from "@tauri-apps/api";

import { WebviewWindow, appWindow, getCurrent } from "@tauri-apps/api/window";
import { FC, useEffect, useState } from "react";
import PlmIcon from "../components/PlmIcon";
import { homeDir } from "@tauri-apps/api/path";
import { BasicConfig } from "../constant/config";
import { exit } from "@tauri-apps/api/process";

const Head: FC = () => {
  const [isMaximized, setisMaximized] = useState<boolean>(false);

  useEffect(() => {
    const win = getCurrent();
    win.listen("tauri://resize", async (e) => {
      const maxed = await appWindow.isMaximized();
      setisMaximized(maxed);
    });
  }, []);

  // const exist = async () => {
  //   exit();
  // };

  // 拖拽窗体
  const handleMouseDown = (e: { button: number }) => {
    if (e.button === 0) {
      invoke("drag_window");
    }
  };
  // 最大化
  const handleWinMax = async () => {
    // const resizable = await appWindow.isResizable();
    // if (!resizable) return;x
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
      data-tauri-drag-region
      // onMouseDown={handleMouseDown}
      onDoubleClick={async () => {
        handleWinMax();
      }}
      className="h-10 bg-primary flex items-center pr-4 justify-between"
    >
      <div className="flex gap-1 items-center">
        <img
          width={16}
          style={{ marginLeft: "12px" }}
          src={OnChainLogo}
          alt=""
        />
        {/* <div className="text-white text-xs self-end flex">DesignFusion</div> */}
      </div>
      <div></div>
      <div></div>
      <div>
        <PlmIcon
          name="minimize"
          onClick={async () => {
            // const data = await invoke("call_dynamic");

            // console.log(data, 'data');
            appWindow.minimize();
          }}
          className="text-xs text-white cursor-pointer opacity-80 mr-3 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
        <PlmIcon
          name={isMaximized ? "reduce" : "amplify"}
          onClick={() => appWindow.toggleMaximize()}
          className="text-xs text-white cursor-pointer opacity-80 mr-3 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
        <PlmIcon
          name="close"
          // onClick={() => exit()}
          onClick={() => appWindow.close()}
          className="text-xs text-white cursor-pointer opacity-80 hover:shadow-2xl hover:bg-hoverHeadButton"
        ></PlmIcon>
      </div>
    </div>
  );
};

export default Head;
