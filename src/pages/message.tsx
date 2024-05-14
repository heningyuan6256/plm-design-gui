/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 搜索
 */
import PlmIcon from "../components/PlmIcon";
import { OnChainSelect, OnChainTable } from "onchain-ui";
import { FC, useEffect, useMemo, useState } from "react";
import checkout from "../assets/image/checkin.svg";
import checkin from "../assets/image/checkout.svg";
import API from "../utils/api";
import { Input, message } from "antd";
import { useSelector } from "react-redux";
import { useKeyPress, useReactive, useRequest } from "ahooks";
import PlmLifeCycle from "../components/PlmLifeCycle";
import { OnChainTableColumnProps } from "onchain-ui/dist/esm/OnChainTable";
import { Utils } from "../utils";
import { createDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import { BasicConfig, CommandConfig } from "../constant/config";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { getClient, ResponseType } from "@tauri-apps/api/http";
import { BasicsItemCode, ItemCode } from "../constant/itemCode";
import { openDesign } from "../layout/pageLayout";
import { cloneDeep } from "lodash";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { mqttClient } from "../utils/MqttService";
import { Command } from "@tauri-apps/api/shell";
import { invoke } from "@tauri-apps/api";
import PlmTabToolBar from "../components/PlmTabToolBar";
import PlmToolBar from "../components/PlmToolBar";
import PlmMessageToolBar from "../components/PlmMessageToolBar";
// import { dealMaterialData } from 'plm-wasm'

const Message: FC = () => {
    const columns = useMemo(() => {
        return [
            {
                title: '日期',
                dataIndex: 'date'
            },
            {
                title: '内容',
                dataIndex: 'content'
            }
        ]
    }, [])
    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <PlmMessageToolBar onClick={() => { }}></PlmMessageToolBar>
            <div className='px-2 py-2'>
                <OnChainTable
                    rowSelection={{
                        selectedRowKeys: [],
                        columnWidth: 24,
                        onChange: () => { }
                    }}
                    columns={columns}
                    extraHeight={24}

                    hideFooter
                >
                </OnChainTable>
            </div>
        </div>
    );
};

export default Message;
