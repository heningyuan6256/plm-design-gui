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
import { CommandConfig, PathConfig } from "../constant/config";
import { Fragment, useEffect, useRef, useState } from "react";
import { mqttClient } from "../utils/MqttService";
import { Tabs, TabsProps } from "antd";
import PlmTabToolBar from "../components/PlmTabToolBar";
import cancelcheckin from "../assets/image/cancelcheckin.svg";
import checkout from "../assets/image/checkin.svg";
import checkin from "../assets/image/checkout.svg";
import { useAsyncEffect } from "ahooks";
import API from "../utils/api";
import { Utils } from "../utils";
import { BasicsItemCode } from "../constant/itemCode";
import { PlmFormForwardRefProps } from "onchain-ui/dist/esm/OnChainForm";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const [leftData, setLeftData] = useState<Record<string, any>[]>([]);
  const [centerData, setCenterData] = useState<Record<string, any>[]>([]);
  const dynamicFormRef = useRef<PlmFormForwardRefProps>();
  const [Attrs, setAttrs] = useState<Record<string, any>[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [selectNode, setSelectNode] = useState<Record<string, any>>();

  useEffect(() => {
    mqttClient.publish({
      type: CommandConfig.getCurrentBOM,
    });
  }, []);

  //test
  // useAsyncEffect(async () => {
  //   const {
  //     result: { records: PublicAttrs },
  //   }: any = await API.getInstanceAttrs({
  //     itemCode: BasicsItemCode.file,
  //     tabCode: "10002001",
  //   });

  //   const {
  //     result: { records: PrivateAttrs },
  //   }: any = await API.getInstanceAttrs({
  //     itemCode: BasicsItemCode.file,
  //     tabCode: "10002002",
  //   });

  //   // 获取所有属性映射
  //   const { result: attrsArray }: any = await API.getMapptingAttrs();
  //   const attrsMap = Utils.transformArrayToMap(
  //     attrsArray,
  //     "sourceAttr",
  //     "targetAttr"
  //   );
  //   const sourceAttrPlugin = attrsArray.map((item: any) => item.sourceAttr);

  //   const sourceAttrOnchain = attrsArray.map((item: any) => item.targetAttr);

  //   const totalAttrs = [...PublicAttrs, ...PrivateAttrs].filter((item) => {
  //     return sourceAttrOnchain.includes(item.apicode);
  //   });

  //   setAttrs(totalAttrs);

  //   let res = {
  //     input_data: {},
  //     output_data: {
  //       node_name: "assem_top",
  //       pic_path: "",
  //       file_path: "D:\\SWFiles\\assem_top.SLDASM",
  //       model_type: "assembly",
  //       property: [
  //         {
  //           name: "Description",
  //           type: "string",
  //           defaultVal: "",
  //         },
  //         {
  //           name: "Weight",
  //           type: "string",
  //           defaultVal: '"SW-质量@assem_top.SLDASM"',
  //         },
  //         {
  //           name: "质量",
  //           type: "string",
  //           defaultVal: '"SW-质量@assem_top.SLDASM"',
  //         },
  //         {
  //           name: "审定",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "设计",
  //           type: "string",
  //           defaultVal: "   ",
  //         },
  //         {
  //           name: "零件号",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "版本",
  //           type: "string",
  //           defaultVal: "   ",
  //         },
  //         {
  //           name: "图幅",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "备注",
  //           type: "string",
  //           defaultVal: "   ",
  //         },
  //         {
  //           name: "替代",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "代号",
  //           type: "string",
  //           defaultVal: "“图样代号”",
  //         },
  //         {
  //           name: "名称",
  //           type: "string",
  //           defaultVal: "“图样名称”",
  //         },
  //         {
  //           name: "共X张",
  //           type: "string",
  //           defaultVal: "1",
  //         },
  //         {
  //           name: "第X张",
  //           type: "string",
  //           defaultVal: "1",
  //         },
  //         {
  //           name: "阶段标记S",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "阶段标记A",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "阶段标记B",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "标准审查",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "工艺审查",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "批准",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "日期",
  //           type: "string",
  //           defaultVal: "2007,12,3",
  //         },
  //         {
  //           name: "校核",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "主管设计",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "审核",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //         {
  //           name: "校对",
  //           type: "string",
  //           defaultVal: " ",
  //         },
  //       ],
  //       children: [
  //         {
  //           node_name: "block<1>",
  //           pic_path: "",
  //           file_path: "D:\\SWFiles\\block.SLDPRT",
  //           model_type: "part",
  //           property: [
  //             {
  //               name: "零件号",
  //               type: "string",
  //               defaultVal: "block",
  //             },
  //             {
  //               name: "VendorNo",
  //               type: "string",
  //               defaultVal: "1.0",
  //             },
  //             {
  //               name: "attr_name_test",
  //               type: "int",
  //               defaultVal: "3.140000",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     from: "111111",
  //     to: "111111",
  //     type: "sw.2019.getCurrentBOM",
  //     extra: "读取BOM结构",
  //     topic: "sw",
  //   };
  //   const flattenData: Record<string, any>[] = [];
  //   const loop = (data: any) => {
  //     for (let i = 0; i < data.length; i++) {
  //       data[i].property.forEach((item: any) => {
  //         if (sourceAttrPlugin.includes(item.name)) {
  //           // data[i][item.name] = item.defaultVal;
  //           data[i][attrsMap[item.name]] = item.defaultVal;
  //         }
  //       });
  //       const flattenedItem = { ...data[i] }; // Create a copy of the current item
  //       delete flattenedItem.children; // Remove the "children" property from the copy
  //       delete flattenedItem.property;
  //       flattenData.push(flattenedItem);

  //       if (data[i].children && data[i].children.length) {
  //         loop(data[i].children);
  //       }
  //     }
  //   };

  //   loop([res.output_data]);
  //   setSelectNode(res.output_data);
  //   setCenterData(flattenData);
  //   setLeftData([res.output_data]);
  // }, []);

  useEffect(() => {
    if (selectNode) {
      dynamicFormRef.current?.setFieldsValue(selectNode);
    }
  }, [selectNode]);

  // 监听属性映射
  useMqttRegister(CommandConfig.getCurrentBOM, async (res) => {
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002001",
    });

    const {
      result: { records: PrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002002",
    });

    // 获取所有属性映射
    const { result: attrsArray }: any = await API.getMapptingAttrs();
    const attrsMap = Utils.transformArrayToMap(
      attrsArray,
      "sourceAttr",
      "targetAttr"
    );
    const sourceAttrPlugin = attrsArray.map((item: any) => item.sourceAttr);

    const sourceAttrOnchain = attrsArray.map((item: any) => item.targetAttr);

    const totalAttrs = [...PublicAttrs, ...PrivateAttrs].filter((item) => {
      return sourceAttrOnchain.includes(item.apicode);
    });

    setAttrs(totalAttrs);

    const flattenData: Record<string, any>[] = [];
    const loop = (data: any) => {
      for (let i = 0; i < data.length; i++) {
        data[i].property.forEach((item: any) => {
          if (sourceAttrPlugin.includes(item.name)) {
            // data[i][item.name] = item.defaultVal;
            data[i][attrsMap[item.name]] = item.defaultVal;
          }
        });
        const flattenedItem = { ...data[i] }; // Create a copy of the current item
        delete flattenedItem.children; // Remove the "children" property from the copy
        delete flattenedItem.property;
        flattenData.push(flattenedItem);

        if (data[i].children && data[i].children.length) {
          loop(data[i].children);
        }
      }
    };

    loop([res.output_data]);
    setSelectNode(res.output_data);
    setCenterData(flattenData);
    setLeftData([res.output_data]);
  });
  const items: TabsProps["items"] = [
    {
      key: "file",
      label: `文件清单`,
      children: (
        <Fragment>
          <div className="ml-1">
            <PlmTabToolBar
              list={[
                { name: "签出", icon: checkout },
                { name: "取消签出", icon: cancelcheckin },
                { name: "签入", icon: checkin },
              ]}
            ></PlmTabToolBar>
          </div>
          <OnChainTable
            key={"file"}
            rowKey={"node_name"}
            dataSource={centerData}
            extraHeight={30}
            rowSelection={{
              columnWidth: 19,
            }}
            className="table-checkbox"
            columns={[
              {
                title: "名称",
                dataIndex: "node_name",
                search: {
                  type: "Input",
                },
                sorter: true,
                // render: (text: string) => {
                //   return <a>{text}</a>;
                // },
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
        </Fragment>
      ),
    },
    {
      key: "material",
      label: `物料清单`,
      children: (
        <Fragment>
          <div className="ml-1">
            <PlmTabToolBar
              list={[
                { name: "分配编码", icon: "" },
                { name: "保存", icon: "" },
              ]}
            ></PlmTabToolBar>
          </div>

          <OnChainTable
            key={"material"}
            rowKey={"node_name"}
            dataSource={centerData}
            extraHeight={30}
            rowSelection={{
              columnWidth: 19,
            }}
            className="table-checkbox"
            columns={[
              {
                title: "物料名称",
                dataIndex: "node_name",
                search: {
                  type: "Input",
                },
                sorter: true,
                // render: (text: string) => {
                //   return <a>{text}</a>;
                // },
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
        </Fragment>
      ),
    },
  ];

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
                    expandIconColumnIndex: 2,
                    expandedRowKeys: expandedKeys,
                    onExpandedRowsChange: (expandedKeys) => {
                      setExpandedKeys(expandedKeys);
                    },
                  }}
                  rowSelection={{
                    columnWidth: 0,
                    selectedRowKeys: [selectNode?.node_name],
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
                          <div
                            className={`gap-1 inline-flex items-center cursor-pointer ${
                              !(record.children && record.children.length)
                                ? "ml-3"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectNode(record);
                            }}
                          >
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
            <div className="flex w-full gap-1.5" style={{ height: "240px" }}>
              {/* 缩略图 */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg,#ffffff 0%, #e8e8e8 100%)",
                }}
                className="flex-1 h-full border border-outBorder"
              >
                <div style={{ height: "500px" }}></div>
              </div>
              {/* 基本信息 */}
              <div
                className="border bg-white border-outBorder h-full pt-2.5 px-4 pb-5 flex flex-col"
                style={{ width: "478px" }}
              >
                {/* <div className="flex justify-between h-7 items-start">
                  <div className="text-xs">基本信息</div>
                  <PlmIcon name="edit" className="text-xs"></PlmIcon>
                </div> */}
                <div className="flex-1 w-full basic-attr">
                  <OnChainForm
                    ref={dynamicFormRef}
                    layout="horizontal"
                    readOnly
                    labelCol={{
                      style: {
                        width: 48,
                      },
                    }}
                  >
                    <div className="grid grid-cols-2 gap-x-8">
                      {Attrs.map((item) => {
                        return (
                          <OnChainFormItem
                            key={item.apicode}
                            colon
                            readOnly
                            label={item.name}
                            name={item.apicode}
                            content={{ type: "Input" }}
                          ></OnChainFormItem>
                        );
                      })}
                    </div>
                  </OnChainForm>
                </div>
              </div>
            </div>
            <div className="mt-2 flex-1">
              <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
            </div>
          </div>

          {/* 右侧BOM */}
          <div
            style={{ width: "254px" }}
            className="h-full border border-outBorder"
          >
            <div className="bg-white h-full">
              {/* <div className="h-10 flex justify-between items-center">
                <div className="text-xs">产品名称</div>
                <div>
                  <PlmIcon
                    name="develop"
                    className="text-xs scale-90"
                  ></PlmIcon>
                </div>
              </div> */}
              {/* <div className="flex-1 bg-white h-full"> */}
              <OnChainTable
                rowKey={"node_name"}
                style={{ height: "100%" }}
                className="tree-table"
                bordered={false}
                dataSource={leftData}
                expandable={{
                  expandIconColumnIndex: 2,
                  expandedRowKeys: expandedKeys,
                  onExpandedRowsChange: (expandedKeys) => {
                    setExpandedKeys(expandedKeys);
                  },
                }}
                rowSelection={{
                  columnWidth: 0,
                  selectedRowKeys: [selectNode?.node_name],
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
                        <div
                          className={`gap-1 inline-flex items-center ${
                            !(record.children && record.children.length)
                              ? "ml-3"
                              : ""
                          }`}
                        >
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
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
