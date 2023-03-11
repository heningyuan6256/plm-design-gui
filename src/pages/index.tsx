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
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const exist = async () => {
    await invoke("exist", {});
    const mainWindow = WebviewWindow.getByLabel("Home");
    mainWindow?.close();
  };

  const handleMouseDown = (e: { button: number }) => {
    if (e.button === 0) {
      invoke("drag_window");
    }
  };

  return (
    <Fragment>
      <div
        onMouseDown={handleMouseDown}
        className="h-10 bg-primary flex items-center px-4 justify-between"
      >
        <div className="flex gap-1 items-center">
          <img width={72} src={OnChainLogo} alt="" />{" "}
          <div className="text-white text-xs self-end flex">DesignFusion</div>
        </div>
        <div onClick={exist}>
          <PlmIcon
            name="close"
            className="text-xs text-white cursor-pointer opacity-80"
          ></PlmIcon>
        </div>
      </div>
      <div style={{ height: "calc(100% - 40px)" }} className="w-full">
        总页面
      </div>
      <div className="flex items-center fixed bottom-0 w-full h-5 justify-between bg-primary px-2">
        <div className="text-xs flex gap-2">
          <PlmIcon
            name="link"
            className="text-xs text-white opacity-80"
          ></PlmIcon>{" "}
          <div className="text-xs text-white opacity-80">
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
    </Fragment>
  );
};

export default index;
