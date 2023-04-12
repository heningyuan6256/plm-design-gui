/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 库
 */
import Foot from "../layout/foot";
import Head from "../layout/head";
import PlmIcon from "../components/PlmIcon";
import {OnChainTable} from "onchain-ui";
import {useEffect, useState} from "react";
import API from "../utils/api";
import PageLayout from "../layout/pageLayout";
// import { dealMaterialData } from 'plm-wasm'

const stock = () => {
    const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([])

    useEffect(() => {
        API.getStock('719').then(res => {
            console.log(res, 'res')
        })
    }, [])

    return (
            <div className="h-full w-full flex flex-col overflow-hidden">
                {/* 头部 */}
                <Head></Head>

                <div className="w-full bg-base flex-1 flex flex-col px-3 py-3 overflow-hidden">
                    <div
                        style={{width: "254px"}}
                        className="h-full border border-outBorder"
                    >
                        <div className="pb-1.5 px-1.5 flex flex-col h-full">
                            <div className="h-10 flex justify-between items-center">
                                <div className="text-xs">搜索 <PlmIcon
                                    name="develop"
                                    className="text-xs scale-85"
                                ></PlmIcon></div>
                            </div>
                            <div className="flex-1 bg-white border border-outBorder">
                                <OnChainTable
                                    rowKey={"id"}
                                    className="tree-table"
                                    bordered={false}
                                    dataSource={leftTreeData}
                                    expandable={{
                                        expandIconColumnIndex: 0,
                                    }}
                                    hideFooter
                                    extraHeight={0}
                                    columns={[
                                        {
                                            title: "名称",
                                            dataIndex: "name",
                                            search: {
                                                type: "Input",
                                            },
                                            sorter: true,
                                        },
                                    ]}
                                    selectedCell={{
                                        dataIndex: "",
                                        record: {},
                                    }}
                                ></OnChainTable>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 尾部 */}
                <Foot></Foot>
            </div>

    );
};

export default stock;
