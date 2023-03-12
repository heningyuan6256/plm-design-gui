/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { Fragment } from "react";
import OnChainLogo from "../assets/image/OnChainLogo.svg";
import PlmIcon from "../components/PlmIcon";
import PlmToolBar from "../components/PlmToolBar";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
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
    <div className="h-full w-full flex flex-col">
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
      <div className="w-full bg-base flex-1 flex flex-col px-3 py-3">
        <PlmToolBar></PlmToolBar>
        <div className="flex-1 flex gap-1.5 pt-1.5">
          <div
            style={{ width: "254px" }}
            className="h-full border border-outBorder"
          >
            <div className="pb-1.5 px-1.5 flex flex-col h-full">
              <div className="h-10 flex justify-between items-center">
                <div className="text-xs">产品名称</div>
                <div>
                  <PlmIcon
                    name="develop"
                    className="text-xs scale-90"
                  ></PlmIcon>
                </div>
              </div>
              <div className="flex-1 bg-white border border-outBorder"></div>
            </div>
          </div>
          <div className="flex-1 h-full border border-outBorder"></div>
          <div
            style={{ width: "254px" }}
            className="h-full border border-outBorder"
          >
            <div className="pb-1.5 px-1.5 flex flex-col h-full">
              <div className="h-10 flex justify-between items-center">
                <div className="text-xs">产品名称</div>
                <div>
                  <PlmIcon
                    name="develop"
                    className="text-xs scale-90"
                  ></PlmIcon>
                </div>
              </div>
              <div className="flex-1 bg-white border border-outBorder"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center bottom-0 w-full justify-between bg-primary px-2 h-6">
        <div className="text-xs flex gap-2">
          <PlmIcon
            name="link"
            className="text-xs text-white opacity-80"
          ></PlmIcon>{" "}
          <div className="text-xs text-white opacity-80 scale-90">
            SSH: 192.168.0.112
          </div>
        </div>
        <div className="text-xs flex gap-2">
          {/* <PlmIcon name="user" className="text-xs text-white"></PlmIcon>{" "} */}
          <PlmIcon
            name="notice"
            className="text-xs text-white opacity-80"
          ></PlmIcon>
        </div>
      </div>
    </div>
  );
};

export default index;
