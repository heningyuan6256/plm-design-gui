/**
 * Author: hny_147
 * Date: 2023/03/11 17:13:48
 * Description: 菜单按钮
 */
import { FC } from "react";
import cancelcheckin from "../../assets/image/cancelcheckin.svg";
import checkout from "../../assets/image/checkin.svg";
import checkin from "../../assets/image/checkout.svg";

import upload from "../../assets/image/upload.svg";
import record from "../../assets/image/record.svg";
import quit from "../../assets/image/quit.svg";
import encoded from "../../assets/image/encoded.svg";
import about from "../../assets/image/about.svg";
import renovate from "../../assets/image/renovate.svg";
import { homeDir } from "@tauri-apps/api/path";
import { WebviewWindow } from "@tauri-apps/api/window";
import { removeFile } from "@tauri-apps/api/fs";
import { BasicConfig, CommandConfig, PathConfig } from "../../constant/config";
import { invoke } from "@tauri-apps/api";

import { useSelector, useDispatch } from "react-redux";
import { increment } from "../../models/count";
import { mqttClient } from "../../utils/MqttService";
import { Utils } from "../../utils";

export interface PlmToolBarProps {
  onClick: (name: string) => void;
}

const PlmToolBar: FC<PlmToolBarProps> = (props) => {

  // 按钮
  const renderButton = (image: string, txt: string, name: string) => {
    return (
      <div
        onClick={() => {
          props.onClick(name);
        }}
        className="flex flex-col gap-1 items-center cursor-pointer hover:shadow-1xl hover:bg-hoverBg"
      >
        <img width={16} src={image} alt="" />
        <div className="text-xs">{txt}</div>
      </div>
    );
  };

  return (
    <div className="w-full  py-3.5 flex h-76 border-b border-outBorder">
      <div className="px-4 border-r border-r-outBorder">
        <div className="flex gap-3 mb-1">
          {renderButton(checkout, `签出`, "checkout")}
          {renderButton(cancelcheckin, "取消签出", "cancelcheckout")}
          {renderButton(checkin, "签入", "cancelcheckin")}
        </div>
        <div className="scale-90 text-xs text-littleGrey text-center">
          签入/签出
        </div>
      </div>
      <div className="px-4 border-r border-r-outBorder">
        <div className="flex gap-3 mb-1">
          {renderButton(upload, "上传", "upload")}
          {renderButton(encoded, "分配编码", "allocatenumber")}
          {renderButton(renovate, "刷新", "refresh")}
          {renderButton(record, "操作日志", "log")}
        </div>
        <div className="scale-90 text-xs text-littleGrey text-center">操作</div>
      </div>
      <div className="px-4 border-r border-r-outBorder">
        <div className="flex gap-3 mb-1">
          {renderButton(quit, "退出", "logout")}
          {/* info */}
          {renderButton(about, "关于", "open_attr_map")}
        </div>
        <div className="scale-90 text-xs text-littleGrey text-center">其他</div>
      </div>
    </div>
  );
};

export default PlmToolBar;
