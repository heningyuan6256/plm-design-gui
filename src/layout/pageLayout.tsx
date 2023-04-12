/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:07
 * Description: 通用布局
 */


import React, {Fragment} from "react";
import {useSelector} from "react-redux";
import PlmLoading from "../components/PlmLoading";
import {Outlet} from "react-router-dom";

interface LayoutProps {
    children?: React.ReactNode;
}

const PageLayout: React.FC<LayoutProps> = (data => {
    const {value: user} = useSelector((state: any) => state.user)

    if (!user.id) {
        return <PlmLoading loading={true}></PlmLoading>
    }

    return <Fragment><Outlet></Outlet></Fragment>;
});

export default PageLayout;
