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
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { mqttClient } from "../utils/MqttService";
import { Tabs, TabsProps, message, Image } from "antd";
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
import { readBinaryFile, removeFile } from "@tauri-apps/api/fs";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import plusImg from "../assets/image/plus.svg";
import { cloneDeep, groupBy, remove } from "lodash";
import childnodecube from "../assets/image/childnodecube.svg";
import threeCubes from "../assets/image/threecubes.svg";
import { settingType } from "./attrMap";
// import { dealMaterialData } from 'plm-wasm'

export const formItemMap: Record<string, any> = {
  "1": "Input",
  "2": "Input.TextArea",
  "4": "Number",
  "5": "Select",
  "6": "Date",
  "7": "DatePicker.RangePicker",
  "8": "Image",
  "9": "File",
  "12": "CompositeForm",
  "13": "CompositeForm",
};

const index = () => {
  const [rightData, setRightData] = useState<Record<string, any>[]>([]);
  const [leftData, setLeftData] = useState<Record<string, any>[]>([]);
  const [centerData, setCenterData] = useState<Record<string, any>[]>([]);
  const dynamicFormRef = useRef<PlmFormForwardRefProps>();
  const [Attrs, setAttrs] = useState<Record<string, any>[]>([]);
  const [materialAttrs, setMaterialAttrs] = useState<Record<string, any>[]>([]);
  const [FormAttrs, setFormAttrs] = useState<Record<string, any>[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [selectNode, setSelectNode] = useState<Record<string, any>>();
  const [productOptions, setProductOptions] = useState<any[]>();
  const [selectProduct, setSelectProduct] = useState<string>("");
  const [cacheItemNumber, setCacheItemNumber] = useState({});
  const [thumbImage, setThumbImage] = useState("");
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

    // 查找物料公有属性
    const {
      result: { records: MaterialPublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.material,
      tabCode: "10002001",
    });
    // 查找物料专有属性
    const {
      result: { records: MaterialPrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.material,
      tabCode: "10002002",
    });

    const totalMaterialAttrs = [
      ...MaterialPublicAttrs,
      ...MaterialPrivateAttrs,
    ];

    const uint8arrayToBase64 = function (u8Arr: any) {
      try {
        let CHUNK_SIZE = 0x8000; //arbitrary number
        let index = 0;
        let length = u8Arr.length;
        let result = "";
        let slice;
        while (index < length) {
          slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
          result += String.fromCharCode.apply(null, slice);
          index += CHUNK_SIZE;
        }
        // web image base64图片格式: "data:image/png;base64," + b64encoded;
        return "data:image/png;base64," + btoa(result);
        //  return btoa(result);
      } catch (e) {
        throw e;
      }
    };

    setMaterialAttrs(totalMaterialAttrs);

    // 获取所有属性映射
    const { result: attrsArray }: any = await API.getMapptingAttrs({
      toolName: BasicConfig.pubgin_topic,
      mappingName: settingType.cadToFile,
      fileType: "sldprt",
    });
    const attrsMap = Utils.transformArrayToMap(
      attrsArray,
      "sourceAttr",
      "targetAttr"
    );
    const sourceAttrPlugin = attrsArray.map((item: any) => item.sourceAttr);
    const totalAttrs = [...PublicAttrs, ...PrivateAttrs];
    setAttrs(totalAttrs);

    try {
      const loop = async (data: any) => {
        for (let i = 0; i < data.length; i++) {
          data[i].itemAttrs = {};
          data[i].id = Utils.generateSnowId();
          data[i].property.forEach((item: any) => {
            if (sourceAttrPlugin.includes(item.name)) {
              data[i][attrsMap[item.name]] = item.defaultVal;
            }
          });
          if (data[i].pic_path != ".bmp") {
            const uint8 = await readBinaryFile(data[i].pic_path, {});
            // const base64String = btoa(String.fromCharCode.apply(null, uint8));
            data[i].thumbnail = uint8arrayToBase64(uint8);
          }
          if (data[i].model_type === "assembly") {
            data[i].model_format = "sldasm";
          } else if (data[i].model_type === "part") {
            data[i].model_format = "sldprt";
          }

          if (data[i].children && data[i].children.length) {
            await loop(data[i].children);
          }
        }
      };
      await loop([res.output_data]);
    } catch (error) {}

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
          const nodeNames = flattenData.map((item) => item.node_name);
          if (!nodeNames.includes(data[i].node_name)) {
            flattenData.push(flattenedItem);
          }
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop([selectNode]);
      setCenterData(flattenData);
    }
  }, [selectNode, leftData]);

  // useAsyncEffect(async () => {
  //   await dealCurrentBom({
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
  //   });
  // }, []);

  useEffect(() => {
    if (cacheItemNumber && leftData.length) {
      const cloneNumber: any = cloneDeep(cacheItemNumber);
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          // todo需要限制如果没有则赋值Number
          if (cloneNumber[data[i].model_format]) {
            data[i].itemAttrs["Number"] = cloneNumber[data[i].model_format][0];
            cloneNumber[data[i].model_format] =
              cloneNumber[data[i].model_format].splice(1);
          }
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop(leftData);
      setLeftData([...leftData]);
    }
  }, [cacheItemNumber]);

  // 监听属性映射
  useMqttRegister(CommandConfig.getCurrentBOM, async (res) => {
    await dealCurrentBom(res);
  });

  function removeImgBg(src: any) {
    const img = document.createElement("img");
    img.src = src;
    img.style.position = "absolute";
    img.style.opacity = "0";
    img.style.left = "-100000px";
    document.body.appendChild(img);

    //背景颜色  白色
    const rgba = [255, 255, 255, 255];
    // 容差大小
    const tolerance = 100;

    var imgData = null;
    const [r0, g0, b0, a0] = rgba;
    var r, g, b, a;
    const canvas = document.createElement("canvas");
    const context: any = canvas.getContext("2d");
    const w = 400;
    const h = 400;
    canvas.width = w;
    canvas.height = h;
    context.drawImage(img, 0, 0);
    imgData = context.getImageData(0, 0, w, h);

    for (let i = 0; i < imgData.data.length; i += 4) {
      r = imgData.data[i];
      g = imgData.data[i + 1];
      b = imgData.data[i + 2];
      a = imgData.data[i + 3];
      const t = Math.sqrt(
        (r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2 + (a - a0) ** 2
      );
      if (t <= tolerance) {
        imgData.data[i] = 0;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 0;
      }
    }
    context.putImageData(imgData, 0, 0);
    const newBase64 = canvas.toDataURL("image/png");
    document.body.removeChild(img);
    // img.src = newBase64;
    return newBase64;
  }

  const handleClick = async (name: string) => {
    if (name === "refresh") {
      dispatch(setLoading(true));
      mqttClient.publish({
        type: CommandConfig.getCurrentBOM,
      });
    } else if (name === "allocatenumber") {
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
        message.success("分配编号成功");
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

  const generalDealAttrs = (attrs: any[], listCodeMap: any) => {
    return attrs
      .filter(
        (item) => (item.readonly == "0" || item.readonly == "1") && item.status
      )
      .map((item) => {
        return {
          title: item.name,
          dataIndex: item.apicode,
          editable: true,
          width: 150,
          formitem: {
            type: formItemMap[item.valueType],
            props: Utils.generateFormItemProps(item, listCodeMap),
          },
          search: {
            type: formItemMap[item.valueType],
            props: Utils.generateFormItemProps(item, listCodeMap),
          },
        };
      });
  };

  const [materialColumn, setMaterialColumn] = useState<any[]>([]);
  const [fileColumn, setFileColumn] = useState<any[]>([]);

  // 处理物料列头
  useAsyncEffect(async () => {
    const codeList = materialAttrs
      .filter((item) => item.listCode)
      .map((item) => {
        return {
          code: item.listCode,
          where: "",
        };
      });
    if (codeList.length) {
      API.getList(codeList).then((res: any) => {
        const map: any = {};
        const result = res.result || [];
        result.forEach((item: { listItems: any; code: string }) => {
          map[item.code] = Utils.adaptListItems(item.listItems) || [];
        });
        setMaterialColumn(generalDealAttrs(materialAttrs, map) || []);
      });
    } else {
      setFileColumn(generalDealAttrs(materialAttrs, {}) || []);
    }
  }, [materialAttrs]);

  // 处理文件列头
  useAsyncEffect(async () => {
    const codeList = Attrs.filter((item) => item.listCode).map((item) => {
      return {
        code: item.listCode,
        where: "",
      };
    });
    if (codeList.length) {
      API.getList(codeList).then((res: any) => {
        const map: any = {};
        const result = res.result || [];
        result.forEach((item: { listItems: any; code: string }) => {
          map[item.code] = Utils.adaptListItems(item.listItems) || [];
        });
        setFileColumn(generalDealAttrs(Attrs, map) || []);
      });
    } else {
      setFileColumn(generalDealAttrs(Attrs, {}) || []);
    }
  }, [Attrs]);

  const materialCenterData: any = useMemo(() => {
    return centerData.map((item) => {
      return {
        ...item,
        ...item.itemAttrs,
      };
    });
  }, [centerData]);

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
          {fileColumn.length ? (
            <OnChainTable
              key={"file"}
              bordered={false}
              rowKey={"id"}
              dataSource={centerData}
              extraHeight={24}
              rowSelection={{
                columnWidth: 19,
                fixed: true,
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
                  title: <div className="w-full flex justify-center">校验</div>,
                  dataIndex: "flag",
                  width: 45,
                  render: (text: string) => {
                    return (
                      <div className="w-full flex justify-center">
                        <img width={12} src={plusImg} alt="" />
                      </div>
                    );
                  },
                },
                {
                  title: "缩略图",
                  dataIndex: "thumbnail",
                  // sorter: true,
                  width: 50,
                  render: (text: string) => {
                    return (
                      <Image src={text} width={32} preview={false}></Image>
                    );
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
                  sorter: true,
                  render: () => {
                    return <span>1</span>;
                  },
                },
                ...fileColumn,
              ]}
              selectedCell={{
                dataIndex: "",
                record: {},
              }}
            ></OnChainTable>
          ) : (
            <></>
          )}
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

          {materialColumn.length ? (
            <OnChainTable
              key={"material"}
              rowKey={"id"}
              dataSource={materialCenterData}
              extraHeight={24}
              rowSelection={{
                columnWidth: 19,
              }}
              bordered={false}
              onSubmit={(row, column) => {
                const loop = (data: any) => {
                  for (let i = 0; i < data.length; i++) {
                    if (data[i].node_name == row.node_name) {
                      data[i].itemAttrs[column["dataIndex"]] =
                        row[column["dataIndex"]];
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
                  title: "缩略图",
                  dataIndex: "thumbnail",
                  // sorter: true,
                  width: 50,
                  render: (text: string) => {
                    return (
                      <Image src={text} width={32} preview={false}></Image>
                    );
                  },
                },
                {
                  title: "物料名称",
                  dataIndex: "node_name",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                {
                  title: "编号",
                  dataIndex: "Number",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                },
                ...materialColumn,
              ]}
              selectedCell={{
                dataIndex: "",
                record: {},
              }}
            ></OnChainTable>
          ) : (
            <></>
          )}
        </Fragment>
      ),
    },
  ];

  useEffect(() => {
    console.log(centerData, "centerData");
  }, [centerData]);

  // useEffect(() => {
  //   if(selectNode?.thumbnail){
  //     console.log(selectNode?.thumbnail,'selectNode?.thumbnail')
  //       removeImgBg(document.getElementById('thumbnail'))
  //   }
  // }, [selectNode?.thumbnail])

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
                rowKey={"id"}
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
                  selectedRowKeys: [selectNode?.id],
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
                                ? threeCubes
                                : childnodecube
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
                  overflow: "hidden",
                }}
                className="flex-1 h-full border border-outBorder"
              >
                <img
                  id="thumbnail"
                  style={{ margin: "0 auto", height: "100%" }}
                  src={removeImgBg(selectNode?.thumbnail)}
                  alt=""
                />
              </div>
              {/* 基本信息 */}
              <div
                className="border bg-white border-outBorder h-full pt-2.5 px-4 pb-5 flex flex-col overflow-auto"
                style={{ width: "478px" }}
              >
                <div>
                  <div
                    className="text-primary mb-1"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    属性名称
                  </div>
                  <div
                    className="bg-outBorder w-full mb-1"
                    style={{ height: "1px" }}
                  ></div>
                </div>

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
                rowKey={"id"}
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
                  selectedRowKeys: [selectNode?.id],
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
                          <div>
                            {record?.itemAttrs &&
                            record?.itemAttrs["Number"] ? (
                              record?.itemAttrs["Number"]
                            ) : (
                              <div
                                style={{
                                  height: "22px",
                                  width: "140px",
                                  background: "#FFC745",
                                  opacity: "0.2",
                                }}
                              ></div>
                            )}
                          </div>
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
