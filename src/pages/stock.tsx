/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 库
 */
import Foot from "../layout/foot";
import Head from "../layout/head";
import PlmIcon from "../components/PlmIcon";
import { OnChainTable } from "onchain-ui";
import { useEffect, useState } from "react";
import API from "../utils/api";
import PageLayout from "../layout/pageLayout";
import { Input } from "antd";
// import { dealMaterialData } from 'plm-wasm'

const stock = () => {
  const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    API.getStock("719").then((res: any) => {
      const result = res.result.filter((item: any) => {
        return item.apicode === "ItemAdmin";
      });
      setLeftTreeData(result);
    });
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 头部 */}
      <Head></Head>

      <div className="w-full bg-base flex-1 flex px-3 py-3 overflow-hidden gap-1.5">
        <div
          style={{ width: "254px" }}
          className="h-full border border-outBorder"
        >
          <div className="pb-1.5 px-1.5 flex flex-col h-full">
            <div className="h-10 flex justify-between items-center">
              <div className="text-xs">
                搜索{" "}
                <PlmIcon name="develop" className="text-xs scale-85"></PlmIcon>
              </div>
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
                    render: (text, record: any) => {
                      console.log(record, "record");

                      return (
                        <div className="flex items-center">
                          <PlmIcon
                            className={"m-0.5 text-primary text-base"}
                            name={
                              record.apicode === "ItemAdmin"
                                ? "a-Materialwarehouse"
                                : "file"
                            }
                          ></PlmIcon>
                          {text}
                        </div>
                      );
                    },
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
        <div className="flex-1">
          <div className="bg-tabTitleBg w-full h-6 text-xs flex items-center pl-2.5 mb-4">
            <span className="mr-1">物料库</span> <span className="mr-1">/</span>{" "}
            <span className="text-primary">电子件库</span>
          </div>
          <div className="mb-4">
            <Input
              placeholder="请输入编号或描述"
              style={{ width: "360px" }}
            ></Input>
          </div>
          <div className="bg-tabTitleBg w-full h-6 text-xs flex items-center pl-2.5 mb-4">
            搜索结果
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
                  render: (text, record: any) => {
                    console.log(record, "record");

                    return (
                      <div className="flex items-center">
                        <PlmIcon
                          className={"m-0.5 text-primary text-base"}
                          name={
                            record.apicode === "ItemAdmin"
                              ? "a-Materialwarehouse"
                              : "file"
                          }
                        ></PlmIcon>
                        {text}
                      </div>
                    );
                  },
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

      {/* 尾部 */}
      <Foot></Foot>
    </div>
  );
};

export default stock;
