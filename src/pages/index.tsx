/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import {
  OnChainForm,
  OnChainFormItem,
  OnChainSelect,
  OnChainTable,
} from "onchain-ui";
import PlmIcon from "../components/PlmIcon";
import PlmToolBar from "../components/PlmToolBar";
import materialSvg from "../assets/image/childnode.svg";
import cubeSvg from "../assets/image/rootdirectory.svg";
import fileCubeSvg from "../assets/image/cube.svg";
import encodedSvg from "../assets/image/encoded.svg";
import saveSvg from "../assets/image/save.svg";
import fileSvg from "../assets/image/threecubes.svg";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
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
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { homeDir } from "@tauri-apps/api/path";
import { removeFile } from "@tauri-apps/api/fs";
import { WebviewWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import plusImg from "../assets/image/plus.svg";
import { cloneDeep, groupBy } from "lodash";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const [rightData, setRightData] = useState<Record<string, any>[]>([]);
  const [leftData, setLeftData] = useState<Record<string, any>[]>([]);
  const [centerData, setCenterData] = useState<Record<string, any>[]>([]);
  const dynamicFormRef = useRef<PlmFormForwardRefProps>();
  const [Attrs, setAttrs] = useState<Record<string, any>[]>([]);
  const [FormAttrs, setFormAttrs] = useState<Record<string, any>[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [selectNode, setSelectNode] = useState<Record<string, any>>();
  const [productOptions, setProductOptions] = useState<any[]>();
  const [selectProduct, setSelectProduct] = useState<string>("");
  const [cacheItemNumber, setCacheItemNumber] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    mqttClient.publish({
      type: CommandConfig.getCurrentBOM,
    });
  }, []);

  // 获取当前产品数据
  useEffect(() => {
    API.getProductList({
      pageNo: "1",
      pageSize: "1000",
      filter: "1",
      isSensitiveCheck: "true",
      tenantId: "719",
    }).then((res: any) => {
      setProductOptions(
        res.result.records.map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        })
      );
      setSelectProduct(res.result.records[0]?.id);
    });
  }, []);

  useEffect(() => {
    if (selectNode) {
      setFormAttrs(selectNode.property);
      dynamicFormRef.current?.setFieldsValue(
        Utils.transformArrayToMap(selectNode.property, "name", "defaultVal")
      );
    }
  }, [selectNode]);

  useEffect(() => {
    if (leftData.length) {
      setRightData(leftData);
    }
  }, [leftData]);

  const dealCurrentBom = async (res?: any) => {
    dispatch(setLoading(true));
    // 查找公有属性
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002001",
    });
    // 查找私有属性
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
    const loop = (data: any) => {
      for (let i = 0; i < data.length; i++) {
        data[i].itemAttrs = {};
        data[i].property.forEach((item: any) => {
          if (sourceAttrPlugin.includes(item.name)) {
            data[i][attrsMap[item.name]] = item.defaultVal;
          }
        });
        if (data[i].model_type === "assembly") {
          data[i].model_format = "sldasm";
        } else if (data[i].model_type === "part") {
          data[i].model_format = "sldprt";
        }

        if (data[i].children && data[i].children.length) {
          loop(data[i].children);
        }
      }
    };
    loop([res.output_data]);
    setSelectNode(res.output_data);
    setLeftData([res.output_data]);
    dispatch(setLoading(false));
  };

  useEffect(() => {
    if (leftData.length) {
      const flattenData: Record<string, any>[] = [];
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          const flattenedItem = { ...data[i] }; // Create a copy of the current item
          delete flattenedItem.children; // Remove the "children" property from the copy
          delete flattenedItem.property;
          flattenData.push(flattenedItem);
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop(leftData);
      setCenterData(flattenData);
    }
  }, [leftData]);

  useAsyncEffect(async () => {
    await dealCurrentBom({
      input_data: {},
      output_data: {
        node_name: "assem_top",
        pic_path: "",
        file_path: "D:\\SWFiles\\assem_top.SLDASM",
        model_type: "assembly",
        property: [
          {
            name: "Description",
            type: "string",
            defaultVal: "",
          },
          {
            name: "Weight",
            type: "string",
            defaultVal: '"SW-质量@assem_top.SLDASM"',
          },
          {
            name: "质量",
            type: "string",
            defaultVal: '"SW-质量@assem_top.SLDASM"',
          },
          {
            name: "审定",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "设计",
            type: "string",
            defaultVal: "   ",
          },
          {
            name: "零件号",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "版本",
            type: "string",
            defaultVal: "   ",
          },
          {
            name: "图幅",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "备注",
            type: "string",
            defaultVal: "   ",
          },
          {
            name: "替代",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "代号",
            type: "string",
            defaultVal: "“图样代号”",
          },
          {
            name: "名称",
            type: "string",
            defaultVal: "“图样名称”",
          },
          {
            name: "共X张",
            type: "string",
            defaultVal: "1",
          },
          {
            name: "第X张",
            type: "string",
            defaultVal: "1",
          },
          {
            name: "阶段标记S",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "阶段标记A",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "阶段标记B",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "标准审查",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "工艺审查",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "批准",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "日期",
            type: "string",
            defaultVal: "2007,12,3",
          },
          {
            name: "校核",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "主管设计",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "审核",
            type: "string",
            defaultVal: " ",
          },
          {
            name: "校对",
            type: "string",
            defaultVal: " ",
          },
        ],
        children: [
          {
            node_name: "block<1>",
            pic_path: "",
            file_path: "D:\\SWFiles\\block.SLDPRT",
            model_type: "part",
            property: [
              {
                name: "零件号",
                type: "string",
                defaultVal: "block",
              },
              {
                name: "VendorNo",
                type: "string",
                defaultVal: "1.0",
              },
              {
                name: "attr_name_test",
                type: "int",
                defaultVal: "3.140000",
              },
            ],
          },
        ],
      },
      from: "111111",
      to: "111111",
      type: "sw.2019.getCurrentBOM",
      extra: "读取BOM结构",
      topic: "sw",
    });
  }, []);

  useEffect(() => {
    if (cacheItemNumber && leftData.length) {
      const cloneNumber: any = cloneDeep(cacheItemNumber);
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          if (cloneNumber[data[i].model_format]) {
            data[i].itemAttrs["Number"] = cloneNumber[data[i].model_format][0];
            cloneNumber[data[i].model_format].splice(1);
          }
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop(leftData);
    }
  }, [cacheItemNumber, leftData]);

  // 监听属性映射
  useMqttRegister(CommandConfig.getCurrentBOM, async (res) => {
    await dealCurrentBom(res);
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
            bordered={false}
            rowKey={"node_name"}
            dataSource={centerData}
            extraHeight={24}
            rowSelection={{
              columnWidth: 19,
            }}
            onSubmit={(row, column) => {
              const loop = (data: any) => {
                for (let i = 0; i < data.length; i++) {
                  if (data[i].node_name == row.node_name) {
                    data[i][column["dataIndex"]] = row[column["dataIndex"]];
                  }
                  if (data[i].children && data[i].children.length) {
                    loop(data[i].children);
                  }
                }
              };
              loop(leftData);
              setLeftData([...leftData]);
            }}
            hideFooter
            className="table-checkbox"
            columns={[
              {
                title: "校验",
                dataIndex: "flag",
                search: {
                  type: "Input",
                },
                width: 50,
                render: (text: string) => {
                  return <img width={12} src={plusImg} alt="" />;
                },
              },
              {
                title: "文件名称",
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
                title: "类型",
                dataIndex: "model_format",
                search: {
                  type: "Input",
                },
                sorter: true,
              },
              {
                title: "版次",
                dataIndex: "revision",
                editable: true,
                formitem: {
                  type: "Input",
                },
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
                { name: "分配编码", icon: encodedSvg },
                { name: "保存", icon: saveSvg },
              ]}
            ></PlmTabToolBar>
          </div>

          <OnChainTable
            key={"material"}
            rowKey={"node_name"}
            dataSource={centerData}
            extraHeight={24}
            rowSelection={{
              columnWidth: 19,
            }}
            bordered={false}
            onSubmit={(data, column) => {
              console.log(data, column);
            }}
            hideFooter
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

  const handleClick = async (name: string) => {
    console.log(name, "name");
    if (name === "allocatenumber") {
      const centerDataMap = groupBy(centerData, (item) => {
        return item.model_format;
      });
      let paramsMap: any = {};
      Object.keys(centerDataMap).forEach((item) => {
        paramsMap[item] = centerDataMap[item].length;
      });
      API.allcateCode({
        numberOfItemCode: "10001001",
        fileTypeCountMap: paramsMap,
      }).then((res: any) => {
        setCacheItemNumber(res.result);
      });
    }
    if (name === "logout") {
      mqttClient.commonPublish({
        type: PathConfig.exit,
        output_data: {
          result: "1",
        },
      });
      // 退出登录
      const homeDirPath = await homeDir();
      await removeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/token.txt`);
      await removeFile(
        `${homeDirPath}${BasicConfig.APPCacheFolder}/network.txt`
      );
      const mainWindow = WebviewWindow.getByLabel("Home");
      mainWindow?.close();
      await invoke("exist", {});
    } else if (name === "info") {
      await invoke(PathConfig.openInfo, {});
    } else if (name === "checkout") {
      mqttClient.publish({
        type: CommandConfig.getProductTypeAtt,
      });
      // dispatch(increment());
    }
  };
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex flex-col overflow-hidden">
        {/* 操作栏 */}
        <PlmToolBar onClick={handleClick}></PlmToolBar>

        <div className="flex-1 flex pt-2 gap-2">
          {/* 左侧文件 */}
          <div style={{ width: "254px" }} className="h-full">
            <div className="flex flex-col h-full pl-2">
              <div className="flex justify-between items-center h-6 mb-1.5">
                <OnChainSelect
                  size="small"
                  value={selectProduct}
                  options={productOptions}
                  onChange={(e) => {
                    setSelectProduct(e);
                  }}
                  clearIcon={false}
                ></OnChainSelect>
              </div>
              {/* <div className="flex-1 border border-outBorder"> */}
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
              {/* </div> */}
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
                <div></div>
              </div>
              {/* 基本信息 */}
              <div
                className="border bg-white border-outBorder h-full pt-2.5 px-4 pb-5 flex flex-col overflow-auto"
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
                      {FormAttrs.map((item, index) => {
                        return (
                          <OnChainFormItem
                            key={`${item}${index}`}
                            colon
                            readOnly
                            label={item.name}
                            name={item.name}
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
          <div style={{ width: "254px" }} className="h-full">
            <div className="h-full pr-2">
              <div className="flex justify-between items-center h-6 mb-1.5">
                <OnChainSelect
                  size="small"
                  value={"EBOM"}
                  onChange={(e) => {
                    setSelectProduct(e);
                  }}
                  open={false}
                  clearIcon={false}
                  showArrow={false}
                ></OnChainSelect>
              </div>
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
                dataSource={rightData}
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
                          <div>{record.itemAttrs["Number"] ?? text}</div>
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
