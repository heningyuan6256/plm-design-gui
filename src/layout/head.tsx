/**
 * Author: hny_147
 * Date: 2023/03/12 15:36:01
 * Description: 标注页头
 */

import OnChainLogo from "../assets/image/OnChainLogo.svg";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { FC } from "react";
import PlmIcon from "../components/PlmIcon";

const Head: FC = () => {
  // 退出登录
  const exist = async () => {
    await invoke("exist", {});
    const mainWindow = WebviewWindow.getByLabel("Home");
    mainWindow?.close();
  };

  // 拖拽窗体
  const handleMouseDown = (e: { button: number }) => {
    if (e.button === 0) {
      invoke("drag_window");
    }
  };
  return (
    <div
      onMouseDown={handleMouseDown}
      className="h-10 bg-primary flex items-center px-4 justify-between"
    >
      <div className="flex gap-1 items-center">
        <img width={88} src={OnChainLogo} alt="" />{" "}
        <div className="text-white text-xs self-end flex">DesignFusion</div>
      </div>
      <div onClick={exist}>
        <PlmIcon
          name="close"
          className="text-xs text-white cursor-pointer opacity-80"
        ></PlmIcon>
      </div>
    </div>
  );
};

export default Head;
