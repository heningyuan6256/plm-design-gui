/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */

import React, { Fragment, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import PlmLoading from "../components/PlmLoading";
import { Outlet } from "react-router-dom";
import Head from "./head";
import Foot from "./foot";
import Left from "./left";
import { TauriEvent } from "@tauri-apps/api/event"
import { mqttClient } from "../utils/MqttService";
import { CommandConfig, PathConfig } from "../constant/config";
import { getCurrent } from "@tauri-apps/api/window";
interface LayoutProps {
  children?: React.ReactNode;
}

const PageLayout: React.FC<LayoutProps> = (data) => {
  const { value: user } = useSelector((state: any) => state.user);
  const { value: loading } = useSelector((state: any) => state.loading);

  useEffect(() => {
    const currentWindow = getCurrent();
    currentWindow.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (e) => {
      mqttClient.publish({
        type: CommandConfig.onchain_path,
        input_data: PathConfig.login,
        output_data: {
          result: "exit",
        },
      });

      setTimeout(() => {
        currentWindow?.close()
      }, 200)
    });
  },[])

  const dataState = useRef(loading)
  dataState.current = loading;


  useEffect(() => {
    mqttClient.loading = dataState
  }, [])

  if (!user.id) {
    return <PlmLoading loading={true}></PlmLoading>;
  }

  return (
    <PlmLoading loading={loading} warrperClassName="flex">
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* 头部 */}
        <Head></Head>
        <div className="h-full w-full flex overflow-hidden">
          <Left></Left>
          <div className="h-full w-full overflow-hidden">
            <Outlet></Outlet>
          </div>
        </div>
        {/* 尾部 */}
        <Foot></Foot>
      </div>
    </PlmLoading>
  );
};

export default PageLayout;
