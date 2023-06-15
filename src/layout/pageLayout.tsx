/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */

import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import PlmLoading from "../components/PlmLoading";
import { Outlet } from "react-router-dom";
// import { interceptResponse } from "../models/mqtt";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow, getCurrent } from "@tauri-apps/api/window";
import { mqttClient } from "../utils/MqttService";
import { BasicConfig } from "../constant/config";
interface LayoutProps {
  children?: React.ReactNode;
}
const PageLayout: React.FC<LayoutProps> = (data) => {
  const { value: user } = useSelector((state: any) => state.user);

  if (!user.id) {
    return <PlmLoading loading={true}></PlmLoading>;
  }

  return (
    <Fragment>
      <Outlet></Outlet>
    </Fragment>
  );
};

export default PageLayout;
