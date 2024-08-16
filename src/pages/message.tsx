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
import read from "../assets/image/read.svg";
import API from "../utils/api";
import { Input, message as antdMsg } from "antd";
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
import { fetchMessageData } from "../models/message";
// import { dealMaterialData } from 'plm-wasm'

const Message: FC = () => {

    const [tableData, setTableData] = useState([])
    const { value: message, unReadCount } = useSelector((state: any) => state.message);
    const { value: user } = useSelector((state: any) => state.user);
    const [selectRows, setSelectRows] = useState<any[]>([])
    const dispatch = useDispatch()

    useEffect(() => {
        setTableData(JSON.parse(JSON.stringify(message || [])))
    }, [message])


    const columns = useMemo(() => {
        return [
            {
                title: <div style={{ display: 'flex', justifyContent: 'center' }}> <img src={read} width={12} alt="" /> </div>,
                dataIndex: 'msgStatus',
                width: 36,
                render: (text: string, record: any) => {
                    return record.msgStatus ? <div className="flex items-center justify-center">
                        <div
                            className="h-1 w-1 bg-primary"
                            style={{ borderRadius: "50%" }}
                        ></div>
                    </div> : <div></div>
                }
            },
            {
                title: '日期',
                dataIndex: 'createTime',
                render: (text: string, record: any) => {
                    return text
                }
            },
            {
                title: '内容',
                dataIndex: 'msgContent',
            }
        ]
    }, [])

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <PlmMessageToolBar onClick={(val) => {
                if (selectRows.length == 0) {
                    antdMsg.warning("请选择消息行数据")
                    return
                }
                if (val === 'read') {
                    API.readMessageData(selectRows.map((item: any) => item.id).join(',')).then(res => {
                        dispatch(fetchMessageData({
                            parInsId: user.id,
                            pageNo: "1",
                            pageSize: "1000"
                        }) as any)

                        antdMsg.success("操作成功")
                        setSelectRows([])
                    })
                } else if (val === 'delete') {
                    API.delMessageData(selectRows.map((item: any) => item.id).join(',')).then(res => {
                        dispatch(fetchMessageData({
                            parInsId: user.id,
                            pageNo: "1",
                            pageSize: "1000"
                        }) as any)
                        antdMsg.success("操作成功")
                        setSelectRows([])
                    })
                }
            }}></PlmMessageToolBar>
            <div className='px-2 py-2'>
                <OnChainTable
                    rowSelection={{
                        selectedRowKeys: selectRows.map(item => item.id),
                        columnWidth: 24,
                        onChange: (keys, rows) => {
                            setSelectRows(rows)
                        }
                    }}
                    columns={columns}
                    extraHeight={24}
                    dataSource={tableData}
                    hideFooter
                >
                </OnChainTable>
            </div>
        </div>
    );
};

export default Message;
