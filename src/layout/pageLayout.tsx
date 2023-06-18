/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */

import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import PlmLoading from "../components/PlmLoading";
import { Outlet, useNavigate } from "react-router-dom";
import { BasicConfig, CommandConfig } from "../constant/config";
import Head from "./head";
import Foot from "./foot";
import PlmIcon from "../components/PlmIcon";
import { useMqttRegister } from "../hooks/useMqttRegister";
interface LayoutProps {
  children?: React.ReactNode;
}
const PageLayout: React.FC<LayoutProps> = (data) => {
  // 左侧按钮
  const leftToolBar = [
    {
      title: "首页",
      icon: "home",
      path: "/home",
    },
    {
      title: "物料库",
      icon: "stock",
      path: "/stock",
    },
    {
      title: "搜索",
      icon: "query",
      path: "/query",
    },
    {
      title: "属性设置",
      icon: "att-map",
      path: "/att-map",
    },
  ];
  const { value: user } = useSelector((state: any) => state.user);

  const navigate = useNavigate();

  // // 监听路由
  useMqttRegister(CommandConfig.onchain_path, async (res) => {
    navigate(`/${res.input_data}`);
  });

  if (!user.id) {
    return <PlmLoading loading={true}></PlmLoading>;
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 头部 */}
      <Head></Head>
      <div className="h-full w-full flex overflow-hidden">
        <div
          className="bg-primary flex flex-col items-center w-10"
          style={{ minWidth: "40px" }}
        >
          {leftToolBar.map((item) => {
            return (
              <div
                key={item.path}
                onClick={() => {
                  navigate(`${item.path}`);
                }}
              >
                <PlmIcon
                  className="h-7 flex items-center text-white transition cursor-pointer opacity-60 hover:shadow-2xl hover:bg-hoverHeadButton"
                  name="a-Materialwarehouse"
                ></PlmIcon>
              </div>
            );
          })}
        </div>
        <div className="h-full w-full">
          <Outlet></Outlet>
        </div>
      </div>
      {/* 尾部 */}
      <Foot></Foot>
    </div>
  );
};

export default PageLayout;
