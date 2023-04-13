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
import { useSelector } from "react-redux";
import { useRequest } from "ahooks";
// import { dealMaterialData } from 'plm-wasm'

const stock = () => {
  const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { value } = useSelector((state: any) => state.user);

  const { run, loading } = useRequest((data) => API.getStockByType(data), {
    manual: true,
    onSuccess(data: any) {
      setTableData(data.result.records);
    },
  });

  useEffect(() => {
    API.getStock("719").then((res: any) => {
      const result = res.result.filter((item: any) => {
        return item.apicode === "ItemAdmin";
      });
      setLeftTreeData(result);
      if (result.length > 0) {
        setSelectedRows([result[0]]);
        const data = {
          libraryId: result[0].id,
          pageNo: 1,
          pageSize: 50,
          sort: "",
          andQuery: "",
          tenantId: "719",
          userId: value.id,
          isAll: false,
          fields: [{}],
        };
        run(data);
      }
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
                  expandIconColumnIndex: 2,
                  indentSize: 22,
                  defaultExpandedRowKeys: selectedRows.map((item) => item.id),
                }}
                rowSelection={{
                  columnWidth: 0,
                  selectedRowKeys: selectedRows.map((item) => item.id),
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
                      return (
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedRows([record]);
                            const data = {
                              libraryId: record.id,
                              pageNo: 1,
                              pageSize: 50,
                              sort: "",
                              andQuery: "",
                              tenantId: "719",
                              userId: value.id,
                              isAll: false,
                              fields: [{}],
                            };
                            run(data);
                          }}
                        >
                          <PlmIcon
                            className={"text-primary text-base mr-1"}
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
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="请输入编号或描述"
              style={{ width: "360px" }}
            ></Input>
            <div className="w-7 h-7 rounded-sm bg-secondary flex items-center justify-center">
              <PlmIcon name="search"></PlmIcon>
            </div>
          </div>
          <div className="bg-tabTitleBg w-full h-6 text-xs flex items-center pl-2.5 mb-4">
            搜索结果
          </div>
          <div className="flex-1 bg-white">
            <OnChainTable
              rowKey={"insId"}
              loading={loading}
              //   bordered={true}
              dataSource={tableData}
              rowSelection={{
                columnWidth: 19,
              }}
              expandable={{
                expandIconColumnIndex: 0,
              }}
              hideFooter
              extraHeight={22}
              columns={[
                {
                  title: "编号",
                  dataIndex: "number",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "描述",
                  dataIndex: "insDesc",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "类型",
                  dataIndex: "objectName",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "生命周期",
                  dataIndex: "statusName",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "版本",
                  dataIndex: "insVersion",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "生效时间",
                  dataIndex: "publishTime",
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

      {/* 尾部 */}
      <Foot></Foot>
    </div>
  );
};

export default stock;
