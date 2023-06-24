/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */

import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import PlmLoading from "../components/PlmLoading";
import { Outlet } from "react-router-dom";
import Head from "./head";
import Foot from "./foot";
import Left from "./left";
interface LayoutProps {
  children?: React.ReactNode;
}
const PageLayout: React.FC<LayoutProps> = (data) => {
  const { value: user } = useSelector((state: any) => state.user);

  if (!user.id) {
    return <PlmLoading loading={true}></PlmLoading>;
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 头部 */}
      <Head></Head>
      <div className="h-full w-full flex overflow-hidden">
        <Left></Left>
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
