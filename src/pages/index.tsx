/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import { OnChainForm, OnChainFormItem, OnChainTable } from "onchain-ui";
import PlmIcon from "../components/PlmIcon";
import PlmToolBar from "../components/PlmToolBar";
import materialSvg from "../assets/image/material.svg";
import cubeSvg from "../assets/image/cube.svg";
import fileCubeSvg from "../assets/image/fileCube.svg";
import fileSvg from "../assets/image/file.svg";
import PageLayout from "../layout/pageLayout";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { CommandConfig } from "../constant/config";
import { useEffect, useState } from "react";
import { mqttClient } from "../utils/MqttService";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const [leftData, setLeftData] = useState<Record<string, any>[]>([]);
  const [centerData, setCenterData] = useState<Record<string, any>[]>([]);
  useEffect(() => {
    mqttClient.publish({
      type: CommandConfig.getCurrentBOM,
    });
  }, []);

  // 监听属性映射
  useMqttRegister(CommandConfig.getCurrentBOM, (res) => {
    const flattenData: Record<string, any>[] = [];
    const loop = (data: any) => {
      for (let i = 0; i < data.length; i++) {
        data[i].property.forEach((item: any) => {
          data[i][item.name] = data[i][item.defaultVal];
        });
        flattenData.push(data[i]);
        if (data[i] && data[i].children && data[i].children.length) {
          loop(data[i].children);
          delete data[i].children
        }
      }
    };
    setCenterData(flattenData);
    loop([res.output_data]);

    setLeftData([res.output_data]);
  });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex flex-col px-3 py-3 overflow-hidden">
        {/* 操作栏 */}
        <PlmToolBar></PlmToolBar>

        <div className="flex-1 flex gap-1.5 pt-1.5">
          {/* 左侧文件 */}
          <div
            style={{ width: "254px" }}
            className="h-full border border-outBorder"
          >
            <div className="pb-1.5 px-1.5 flex flex-col h-full">
              <div className="h-10 flex justify-between items-center">
                <div className="text-xs">产品名称</div>
                <div>
                  <PlmIcon
                    name="develop"
                    className="text-xs scale-85"
                  ></PlmIcon>
                </div>
              </div>
              <div className="flex-1 bg-white border border-outBorder">
                <OnChainTable
                  rowKey={"node_name"}
                  className="tree-table"
                  bordered={false}
                  dataSource={leftData}
                  expandable={{
                    expandIconColumnIndex: 0,
                  }}
                  hideFooter
                  extraHeight={0}
                  columns={[
                    {
                      title: "名称",
                      dataIndex: "node_name",
                      search: {
                        type: "Input",
                      },
                      sorter: true,
                      render: (text, record: Record<string, any>) => {
                        return (
                          <div className="gap-1 inline-flex items-center ml-1">
                            <img
                              width={14}
                              src={
                                (record.children || []).length
                                  ? fileCubeSvg
                                  : fileSvg
                              }
                              alt=""
                            />
                            <div>{text}</div>
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

          {/* 中间详情 */}
          <div className="flex-1 h-full flex flex-col overflow-hidden">
            <div className="flex w-full gap-1.5" style={{ height: "307px" }}>
              {/* 缩略图 */}
              <div
                style={{
                  background: "linear-gradient(180deg,#fafbff 8%, #e9f2fe)",
                }}
                className="flex-1 h-full border border-outBorder"
              >
                <div style={{ height: "500px" }}></div>
              </div>
              {/* 基本信息 */}
              <div
                className="border border-outBorder h-full pt-2.5 px-4 pb-5 flex flex-col"
                style={{ width: "478px" }}
              >
                <div className="flex justify-between h-7 items-start">
                  <div className="text-xs">基本信息</div>
                  <PlmIcon name="edit" className="text-xs"></PlmIcon>
                </div>
                <div className="flex-1 w-full basic-attr">
                  <OnChainForm
                    layout="horizontal"
                    readOnly
                    labelCol={{
                      style: {
                        width: 48,
                      },
                    }}
                  >
                    <div className="grid grid-cols-2 gap-x-8">
                      <OnChainFormItem
                        colon
                        label="编号"
                        name="number"
                        content={{ type: "Input" }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        label="描述"
                        colon
                        name="description"
                        content={{ type: "Input" }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        colon
                        label="设计文件123123123"
                        name="number"
                        content={{ type: "Input" }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        colon
                        label="编号"
                        name="number"
                        content={{ type: "Input" }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        colon
                        label="编号"
                        name="number"
                        content={{ type: "Number" }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        colon
                        label="编号"
                        name="number"
                        content={{
                          type: "Select",
                          props: {
                            options: [{ label: "测试", value: "123" }],
                          },
                        }}
                      ></OnChainFormItem>
                      <OnChainFormItem
                        colon
                        label="日期"
                        name="number1"
                        content={{
                          type: "Date",
                        }}
                      ></OnChainFormItem>
                    </div>
                  </OnChainForm>
                </div>
              </div>
            </div>
            <div className="mt-2 flex-1">
              <OnChainTable
                rowKey={"id"}
                dataSource={centerData}
                extraHeight={30}
                rowSelection={{
                  columnWidth: 19,
                }}
                className="table-checkbox"
                columns={[
                  {
                    title: "名称",
                    dataIndex: "name",
                    search: {
                      type: "Input",
                    },
                    sorter: true,
                    render: (text: string) => {
                      return <a>{text}</a>;
                    },
                  },
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
                    dataIndex: "lifeCycle",
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

          {/* 右侧BOM */}
          <div
            style={{ width: "254px" }}
            className="h-full border border-outBorder"
          >
            <div className="pb-1.5 px-1.5 flex flex-col h-full">
              <div className="h-10 flex justify-between items-center">
                <div className="text-xs">产品名称</div>
                <div>
                  <PlmIcon
                    name="develop"
                    className="text-xs scale-90"
                  ></PlmIcon>
                </div>
              </div>
              <div className="flex-1 bg-white border border-outBorder">
                <OnChainTable
                  rowKey={"id"}
                  className="tree-table"
                  bordered={false}
                  dataSource={[
                    {
                      name: "P100001",
                      id: "123",
                      hasChildren: true,
                      children: [
                        {
                          name: "P100002",
                          id: "123-1",
                        },
                        {
                          name: "P100002",
                          id: "123-2",
                        },
                        {
                          name: "P100002",
                          id: "123-3",
                        },
                        {
                          name: "P100002",
                          id: "123-4",
                        },
                        {
                          name: "P100002",
                          id: "123-5",
                        },
                        {
                          name: "P100002",
                          id: "123-6",
                        },
                        {
                          name: "P100002",
                          id: "123-7",
                        },
                        {
                          name: "P100002",
                          id: "123-8",
                        },
                        {
                          name: "P100002",
                          id: "123-9",
                        },
                        {
                          name: "P100002",
                          id: "123-10",
                        },
                        {
                          name: "P100002",
                          id: "123-11",
                        },
                        {
                          name: "P100002",
                          id: "123-12",
                        },
                        {
                          name: "P100002",
                          id: "123-13",
                        },
                        {
                          name: "P100002",
                          id: "123-14",
                        },
                        {
                          name: "P100002",
                          id: "123-15",
                        },
                        {
                          name: "P100002",
                          id: "123-16",
                        },
                        {
                          name: "P100002",
                          id: "123-17",
                        },
                        {
                          name: "P100002",
                          id: "123-18",
                        },
                        {
                          name: "P100002",
                          id: "123-19",
                        },
                        {
                          name: "P100002",
                          id: "123-20",
                        },
                        {
                          name: "P100002",
                          id: "123-21",
                        },
                        {
                          name: "P100002",
                          id: "123-222",
                        },
                        {
                          name: "P100002",
                          id: "123-2122",
                        },
                        {
                          name: "P100002",
                          id: "123-2123123",
                        },
                        {
                          name: "P100002",
                          id: "123-1123123",
                        },
                        {
                          name: "P100002",
                          id: "123-1231231232",
                        },
                      ],
                    },
                  ]}
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
                      render: (text, record: Record<string, any>) => {
                        return (
                          <div className="gap-1 inline-flex items-center ml-1">
                            <img
                              width={14}
                              src={
                                (record.children || []).length
                                  ? cubeSvg
                                  : materialSvg
                              }
                              alt=""
                            />
                            <div>{text}</div>
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
        </div>
      </div>
    </div>
  );
};

export default index;
