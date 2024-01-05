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
  return <Fragment>{children}</Fragment>;
};

export default Layout;
