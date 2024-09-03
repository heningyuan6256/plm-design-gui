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
import pcbSvg from "../assets/image/pcb.svg";
import docSvg from "../assets/image/doc.svg";
import cubeSvg from "../assets/image/rootdirectory.svg";
import fileCubeSvg from "../assets/image/cube.svg";
import encodedSvg from "../assets/image/encoded.svg";
import EBOM from "../assets/image/EBOM.svg";
import saveSvg from "../assets/image/save.svg";
import fileSvg from "../assets/image/threecubes.svg";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { mqttClient } from "../utils/MqttService";
import { Tabs, TabsProps, message, Button, Input } from "antd";
import PlmTabToolBar from "../components/PlmTabToolBar";
import cancelcheckin from "../assets/image/cancelcheckin.svg";
import filldown from "../assets/image/filldown.svg";
import fillup from "../assets/image/fillup.svg";
import checkout from "../assets/image/checkin.svg";
import topupdate from "../assets/image/front-renew.svg";
import checkin from "../assets/image/checkout.svg";
import { useAsyncEffect, useLatest, useMemoizedFn } from "ahooks";
import API from "../utils/api";
import { Utils } from "../utils";
import { BasicsItemCode, ItemCode } from "../constant/itemCode";
import { PlmFormForwardRefProps } from "onchain-ui/dist/esm/OnChainForm";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { downloadDir, homeDir, resolveResource } from "@tauri-apps/api/path";
import { open as openFileDialog } from "@tauri-apps/api/dialog";
// import { watch, watchImmediate } from "tauri-plugin-fs-watch-api";
import {
  exists,
  readBinaryFile,
  readDir,
  readTextFile,
  removeFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";
import { dialog, invoke } from "@tauri-apps/api";
import plusImg from "../assets/image/plus.svg";
import settingImg from "../assets/image/setting.svg";

import settingSvg from "../assets/image/setting.svg";
import { cloneDeep, groupBy, isArray, merge, pick, pickBy, remove, sortBy, unionBy, uniqBy, uniqWith } from "lodash";
import childnodecube from "../assets/image/childnodecube.svg";
import threeCubes from "../assets/image/threecubes.svg";
import { settingType } from "./attrMap";
import Tus from "@uppy/tus";
import Uppy from "@uppy/core";
import PlmModal from "../components/PlmModal";
import { useSelector } from "react-redux";
import { open } from "@tauri-apps/api/shell";
import SplitPane from "react-split-pane";
import { setBom } from "../models/bom";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { PDFViewer } from 'fuyun';
import ADdata from "../../experimentData.json";
import { MqttClient } from "mqtt";
import { metadata } from "../utils/fs_extra";
import { sse } from "../utils/SSEService";
import { confirm } from "@tauri-apps/api/dialog";
import { openDesign } from "../layout/pageLayout";
import { readPermission, renderIsPlmMosaic } from "../components/PlmMosaic";
import { fetchMessageData } from "../models/message";

// import * as crypto from 'crypto';
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

export const exitPlugin = async () => {
  mqttClient.publish({
    type: CommandConfig.onchain_path,
    input_data: PathConfig.login,
    output_data: {
      result: "exit",
    },
  });
  // 退出登录
  // const homeDirPath = await homeDir();
  // await removeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/token.txt`);
  // await removeFile(
  //   `${homeDirPath}${BasicConfig.APPCacheFolder}/network.txt`
  // );
  sse.close()
  mqttClient.close()
  const mainWindow = WebviewWindow.getByLabel("Home");
  mainWindow?.close();
  await invoke("exist", {});
}

export interface logItemType {
  log: string;
  dateTime: string;
  id: string;
}

const index = () => {
  const updatingAttr = useRef<boolean>(false)
  const ConfirmOpened = useRef<boolean>(false)
  const generateExtraFile = useRef<boolean>(false)

  const [watchCancelFn, setWatchCancelFn] = useState<any>()

  // AES密码解密
  const { value: user } = useSelector((state: any) => state.user);
  const { value: loading } = useSelector((state: any) => state.loading);
  const [rightData, setRightData] = useState<Record<string, any>[]>([]);
  const [leftData, setLeftData] = useState<Record<string, any>[]>([]);
  const [centerData, setCenterData] = useState<Record<string, any>[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState<string>('')
  const [materialCenterData, setMaterialCenterData] = useState<
    Record<string, any>[]
  >([]);
  const dynamicFormRef = useRef<PlmFormForwardRefProps>();
  const [Attrs, setAttrs] = useState<Record<string, any>[]>([]);
  const [materialAttrs, setMaterialAttrs] = useState<Record<string, any>[]>([]);
  const [FormAttrs, setFormAttrs] = useState<Record<string, any>[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [selectNode, setSelectNode] = useState<Record<string, any>>();
  const [productOptions, setProductOptions] = useState<any[]>();
  const [selectProduct, setSelectProduct] = useState<string>("");
  const latestProduct = useLatest(selectProduct)
  const [cacheItemNumber, setCacheItemNumber] = useState({});
  const [fileSelectRows, setFileSelectRows] = useState<any[]>([]);
  const [materialSelectRows, setMaterialSelectRows] = useState<any>([]);
  const [logVisible, setLogVisbile] = useState(false);
  const logVisibleLatest = useLatest(logVisible);
  const [logData, setLogData] = useState<logItemType[]>([]);
  const { value: network } = useSelector((state: any) => state.network);
  const logWrapperRef = useRef<any>(null);
  const location = useLocation();
  const [designData, setDesignData] = useState({});
  const [selectedCell, setSelectedCell] = useState<any>({});

  const selectedCellLatest = useLatest(selectedCell);

  const lastestLogData = useLatest(logData);

  // 2D

  const [file2D, setFile2D] = useState<any[]>([])
  const [material2D, setMaterial2D] = useState<any[]>([])
  const [expanded2DKeys, setExpanded2DKeys] = useState<any>([]);

  const isNot2D = (client: string) => {
    const arr = ['Altium']
    return !arr.includes(mqttClient.publishTopic)
  }

  const [InstanceAttrsMap] = useState<{
    [k: string]: {
      origin: any;
      material: { onChain: any; plugin: any };
      file: { onChain: any; plugin: any };
    };
  }>({});
  const InstanceAttrsMapLastet = useLatest(InstanceAttrsMap)
  const dispatch = useDispatch();

  const warpperSetLog = (func: () => void) => {
    func();
    if (logWrapperRef.current) {
      setTimeout(() => {
        logWrapperRef.current.scrollTop = logWrapperRef.current.scrollHeight;
      });
    }
  };

  // 获取所有的属性
  const getAllAttr = async (itemCode: string) => {
    // 查找公有属性
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: itemCode,
      tabCode: "10002001",
    });
    // 查找私有属性
    const {
      result: { records: PrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: itemCode,
      tabCode: "10002002",
    });

    const totalAttrs = [...PublicAttrs, ...PrivateAttrs];
    return [totalAttrs, PublicAttrs, PrivateAttrs];
  };
  // 根据文件类型判断所对应的物料的类型
  const getMaterialTypeMap = async () => {
    const {
      result: { records: fileObjectRecords },
    }: any = await API.getMaterialTypeMap({ itemCode: BasicsItemCode.file });
    const fileObjectMap = Utils.transformArrayToMap(
      fileObjectRecords || [],
      "id",
      "materialObject"
    );
    return fileObjectMap;
  };
  // 获取cad文件类型映射的规则
  const getCadFileMapRule = async () => {
    const {
      result: { records: cadFileData },
    }: any = await API.getAllCadFileTypeMap();
    const cadFileMap = Utils.transformArrayToMap(
      cadFileData,
      "fileSuffix",
      "fileType"
    );
    const cadIdMap = Utils.transformArrayToMap(
      cadFileData,
      "fileSuffix",
      "id"
    );
    return [cadFileMap, cadIdMap];
  };
  // 获取cad文件属性映射规则
  const getCadAttrMapRule = async (type: "asm" | "prt", cadIdMap: any, mapping_type: settingType) => {
    let fileType = "";
    // 判断如果当前的topic是catia则
    if (mqttClient.publishTopic === "catia") {
      if (type === "asm") {
        fileType = "catproduct";
      } else {
        fileType = "catpart";
      }
    } else if (mqttClient.publishTopic === "sw") {
      if (type === "asm") {
        fileType = "sldasm";
      } else {
        fileType = "sldprt";
      }
    } else if (mqttClient.publishTopic === "Tribon") {
      fileType = 'tribon'
    }

    // 查询所有格式，获取格式的id映射

    // let text = ''
    // try {
    //   const homeDirPath = await homeDir();
    //   text = await readTextFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`, {
    //   })
    // } catch (e) {

    // }

    // if (!text || text && !JSON.parse(text)[fileType]) {
    //   return []
    // }

    // const fileAddr = JSON.parse(text)[fileType]

    const { result: attrsArray }: any = await API.getMapptingAttrs({
      toolName: 'sw',
      mappingName: mapping_type,
      // tabCode: '10002001',
      // attrName: '',
      // fileType: fileAddr.substring(fileAddr.lastIndexOf('\\') + 1),
      fileType: cadIdMap[fileType],
    });

    // 获取cad对应的id属性名称
    const { result: { records: attrs } }: any = await API.getCadAttrs({
      fileTypeId: cadIdMap[fileType],
      pageNo: '1',
      pageSize: '500'
    });
    const attrsMapDara = Utils.transformArrayToMap(attrs, 'id', 'attrName')

    console.log(attrs, 'attrs')

    attrsArray.forEach((item: any) => {
      item.sourceAttrName = attrsMapDara[item.sourceAttr]
    })

    const attrsMap = Utils.transformArrayToMap(
      attrsArray,
      "sourceAttrName",
      "targetAttr"
    );
    console.log(attrsMap, 'attrsMap');

    return attrsMap;
  };
  // 获取文件全名
  const getFileNameWithFormat = (item: any) => {
    let fileNameWithFormat = item.file_path.substring(item.file_path.lastIndexOf("\\") + 1);
    if (mqttClient.publishTopic === 'creo' && (fileNameWithFormat.split('.').length - 1) >= 2) {
      let lastDotIndex = fileNameWithFormat.lastIndexOf(".");
      let secondLastSymbol = fileNameWithFormat.substring(0, lastDotIndex);
      fileNameWithFormat = secondLastSymbol
    }
    return fileNameWithFormat
  };

  // 获取唯一的key，目前是根据文件在文件夹中的文件名称来的
  const getRowKey = (item: any) => {
    if (mqttClient.publishTopic === 'Tribon') {
      const caizhi = getPropertyByName(item, '材质')
      const guige = getPropertyByName(item, '规格')
      return caizhi && guige ? `${caizhi}${guige}` : item.node_name
    }
    return item.file_path.substring(item.file_path.lastIndexOf("\\") + 1);
  };

  const getCurrentTime = () => {
    return `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
  };

  // 判断是否是标准件
  const judgeStandard = (row: any) => {
    return (row.file_path.indexOf("SOLIDWORKS\\Data\\browser") != -1) || (row.file_path.indexOf("SOLIDWORKS\\DATA\\browser") != -1) || (row.file_path.indexOf("solidworks data (2)\\browser") != -1) || (row.file_path.indexOf("solidworks data\\browser") != -1) || (row.file_path.indexOf("SOLIDWORKS Data (2)\\browser") != -1) || (row.file_path.indexOf("SOLIDWORKS Data\\browser") != -1);
  };

  const uniqueArrayByAttr = (arr: any) => {
    const m = new Map();
    const mCount: any = {};
    const mLoc: any = {};
    const mLong: any = {};
    const mWeight: any = {};

    for (const item of arr) {
      let nodeName = getRowKey(item);
      if (mqttClient.publishTopic === 'Tribon') {
        const caizhi = getPropertyByName(item, '材质')
        const guige = getPropertyByName(item, '规格')
        nodeName = ((caizhi && guige) ? `${caizhi}${guige}` : item.node_name)
      }
      // 如果没有存过，并且不是标准件，则set
      if (
        !m.has(nodeName) &&
        !(item.InternalModelFlag && judgeStandard(item))
      ) {

        m.set(nodeName, item);
        mCount[nodeName] = 1;
        if (mqttClient.publishTopic === 'Tribon') {
          const zongchang = getPropertyByName(item, '总长')
          const zhongliang = getPropertyByName(item, '重量')
          mLong[nodeName] = zongchang ? Number(zongchang) : ''
          mWeight[nodeName] = zhongliang ? Number(zhongliang) : ''
          mLoc[nodeName] = [item.node_name]
        }

      } else {
        if (m.has(nodeName)) {
          if (item.file.plugin.fileNameWithFormat) {
            m.set(nodeName, item);
          }
        }
        mCount[nodeName] = mCount[nodeName] + 1;
        if (mqttClient.publishTopic === 'Tribon') {
          mLoc[nodeName] = [...(mLoc[nodeName] || []), item.node_name]
          const zongchang = getPropertyByName(item, '总长')
          const zhongliang = getPropertyByName(item, '重量')
          mLong[nodeName] = mLong[nodeName] ? Number(mLong[nodeName]) + Number(zongchang) : ''
          mWeight[nodeName] = mWeight[nodeName] ? Number(mWeight[nodeName]) + Number(zhongliang) : ''
        }
      }
    }
    return {
      array: [...m.values()],
      map: mCount,
      mLoc: mLoc,
      mWeight: mWeight,
      mLong: mLong
    };
  };

  function blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader: any = new FileReader();
      const img = new Image();
      reader.onloadend = () => {
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          canvas.width = width * (window.devicePixelRatio || 1);
          canvas.height = height * (window.devicePixelRatio || 1);;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // quality 为 0.7，意味着图片会被压缩到70%的质量
            const base64String = canvas.toDataURL('image/png', 0.7).split(',')[1];
            resolve(base64String);
          } else {
            reject(new Error('Canvas context not available'));
          }
        }

        // resolve(reader.result.split(',')[1]); // 去掉前面的 "data:..." 部分，只保留base64内容
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  useAsyncEffect(async () => {
    if (selectNode && selectNode.file_path) {
      if (selectNode.pic_path) {
        const blob = new Blob([await readBinaryFile(selectNode.pic_path)])
        const pic_base64 = await blobToBase64(blob)
        setCurrentThumbnail(`data:image/png;base64,${pic_base64}`)
      } else {
        const nameThumbMap: any = await invoke("get_icons", {
          req: [selectNode.file_path]
        });
        setCurrentThumbnail(`data:image/png;base64,${nameThumbMap[selectNode.file_path]}`)
      }
    }
  }, [selectNode])

  useEffect(() => {
    if (selectProduct && isNot2D(mqttClient.publishTopic)) {
      dispatch(setLoading(true));
      mqttClient.publish({
        type: CommandConfig.getCurrentBOM,
        input_data: {
          "info": ["proximate"],
          'transformer': ['image']
        }
      });
    }
  }, [selectProduct, location.pathname]);

  const getProductList = () => {
    API.getProductList({
      pageNo: "1",
      pageSize: "1000",
      filter: "1",
      isSensitiveCheck: "true",
      tenantId: sse.tenantId || "719",
    }).then((res: any) => {
      setProductOptions(
        res.result.records.map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        })
      );
      // setSelectProduct(res.result.records[0]?.id);
    });
  }

  // 获取当前产品数据
  useEffect(() => {
    API.getProductList({
      pageNo: "1",
      pageSize: "1000",
      filter: "1",
      isSensitiveCheck: "true",
      tenantId: sse.tenantId || "719",
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
      setFormAttrs((selectNode.property || []).filter((item: any) => {
        if (mqttClient.publishTopic === 'Tribon') {
          return ['材质', '规格', '总长', '划线长', '重量'].includes(item.name)
        } else {
          return item
        }
      }));
      dynamicFormRef.current?.setFieldsValue(
        Utils.transformArrayToMap(selectNode.property, "name", mqttClient.publishTopic === 'Tribon' ? "DefaultVal" : "defaultVal")
      );
    }
  }, [selectNode]);

  useEffect(() => {
    if (leftData.length) {
      setRightData(leftData);
    }
  }, [leftData]);

  const getFolderFile = async (path: string) => {
    const fileEntry = await readDir(path)
    const loop = async (data: any) => {
      for (let i = 0; i < data.length; i++) {
        const file = await metadata(data[i].path)
        Object.assign(data[i], file)
        if (file.isDir) {
          await loop(data[i].children || [])
        }
      }
    }
    await loop(fileEntry)
    return fileEntry
  }

  // useAsyncEffect(async () => {
  //   if (leftData.length) {
  //     const fileEntry = await readDir("d:/tb.11.14")
  //     const loop = async (data: any) => {
  //       for (let i = 0; i < fileEntry.length; i++) {
  //         if (data[i].children) {
  //           data[i].id = data[i].path
  //           data[i].children = await readDir(data[i].path)
  //           data[i].children.forEach((v: any) => {
  //             v.id = v.path
  //             v.type = data[i].name
  //           })
  //         }
  //       }
  //     }

  //     await loop(fileEntry)
  //     console.log(fileEntry, 'fileEntry');

  //     setRightData(fileEntry);
  //   }
  // }, [leftData]);

  const buildTreeArray = (nodes: any) => {
    const tree = {};

    nodes.forEach((node: any) => {
      const parts = node.node_name.split('-');
      let currentNode: any = tree;

      parts.forEach((part: any) => {
        currentNode[part] = currentNode[part] || {};
        currentNode = currentNode[part];
      });

      // 添加描述信息
      currentNode.property = node.property;
    });

    return convertTreeToArray(tree);
  }

  const convertTreeToArray: any = (node: any) => {
    const result = [];

    for (const key in node) {
      if (key !== 'property') {
        const children = convertTreeToArray(node[key]);
        result.push({
          node_name: key,
          property: node[key].property,
          children: children
        });
      }
    }

    return result;
  }

  // 将对象的所有键转换为小写
  function normalizeKeys(obj: Record<string, any>) {
    const normalizedObj: Record<string, any> = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        normalizedObj[key.toLowerCase()] = obj[key];
      }
    }
    return normalizedObj;
  }

  // 访问对象时，将键转换为小写
  function getCaseInsensitive(obj: Record<string, any>, key: string) {
    return obj[key.toLowerCase()];
  }


  const dealCurrentBom = async (res?: any) => {
    // 判断有额外的生成文件
    if ((res.input_data.transformer || []).length > 1) {
      generateExtraFile.current = true
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            dateTime: getCurrentTime(),
            log: "生成附件成功!",
            id: Utils.generateSnowId(),
          },
        ]);
      });
      return
    }
    watchCancelFn && watchCancelFn()
    updatingAttr.current = false
    ConfirmOpened.current = false
    try {
      // Windows 文件路径
      const windowsPathRegex = /^(?:[a-zA-Z]:\\|\\\\)(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*$/;

      if (!windowsPathRegex.test(res.output_data.file_path)) {
        dispatch(setLoading(false))
        message.warning("请选择模型")
        return
      }

      // 覆盖初始值 todo
      if (mqttClient.publishTopic === 'Tribon') {
        const loopTribon = (data1: any) => {
          for (let i = 0; i < data1.length; i++) {
            const numberData = data1[i]?.property && data1[i]?.property[0] ? data1[i]?.property[0].DefaultVal : ''
            data1[i].node_name = numberData || data1[i].node_name
            if (data1[i].children && data1[i].children.length) {
              loopTribon(data1[i].children);
            }
          }
        };
        loopTribon([res.output_data]);
        const data = buildTreeArray(res.output_data.children[0].children)
        res.output_data.children[0].children = data[0].children
      }

      Object.keys(InstanceAttrsMap).forEach(item => {
        delete InstanceAttrsMap[item]
      })

      const [[cadFileMap, cadIdMap], [totalAttrs], [totalMaterialAttrs], fileObjectMap] = await Promise.all([getCadFileMapRule(), getAllAttr(BasicsItemCode.file), getAllAttr(BasicsItemCode.material), getMaterialTypeMap()])


      const [attrsMap, asmAttrsMap, asmMaterialAttrsMap, prtMaterialAttrsMap, fileColumns, materialColumns] = await Promise.all([getCadAttrMapRule("prt", cadIdMap, settingType.cadToFile), getCadAttrMapRule("asm", cadIdMap, settingType.cadToFile), getCadAttrMapRule("asm", cadIdMap, settingType.cadToItem), getCadAttrMapRule("prt", cadIdMap, settingType.cadToItem), getColumns(totalAttrs), getColumns(totalMaterialAttrs)])


      setMaterialAttrs(totalMaterialAttrs);
      setAttrs(totalAttrs);
      setFileColumn(fileColumns)
      setMaterialColumn(materialColumns)


      const fileColumnsListCodeMap = Utils.transformArrayToMap(fileColumns.filter((item: any) => item?.formitem?.type === 'Select'), 'dataIndex', 'formitem')
      const materialColumnsListCodeMap = Utils.transformArrayToMap(materialColumns.filter((item: any) => item?.formitem?.type === 'Select'), 'dataIndex', 'formitem')
      // 序列号number，用来控制签出签入更新的顺序
      let serielNumber = 0
      // 扁平化数组
      const flattenData: Record<string, any>[] = [];

      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].children && data[i].children.every((v: any) => !v.file_path)) {
            data[i].children = undefined
          }
          // 覆盖初始值 todo
          if (mqttClient.publishTopic === 'Tribon') {
            // const numberData = data[i]?.property && data[i]?.property[0] ? data[i]?.property[0].DefaultVal : ''
            // data[i].node_name = numberData || data[i].node_name
            data[i].file_path = `D:\\TRIBON_Temp\\${Utils.generateSnowId()}\\${data[i].node_name}.Tribon`
          }
          data[i].property = uniqBy(data[i].property, 'name')
          serielNumber = serielNumber + 1
          data[i].serielNumber = serielNumber
          data[i].id = Utils.generateSnowId();
          // 解决sw镜像文件以及阵列文件的问题
          if (!data[i].file_path) {
            data.splice(i, 1)
            i--
            continue
          }
          const rowKey = getRowKey(data[i]);
          data[i].material = { onChain: {}, plugin: {} };
          data[i].file = { onChain: {}, plugin: {} };

          if (!InstanceAttrsMap[rowKey]) {
            InstanceAttrsMap[rowKey] = {
              origin: {},
              material: { onChain: {}, plugin: {} },
              file: { onChain: {}, plugin: {} },
            };
            InstanceAttrsMap[rowKey].material = data[i].material;
            InstanceAttrsMap[rowKey].file = data[i].file;
            InstanceAttrsMap[rowKey].origin = data[i];
          } else {
            data[i].material = InstanceAttrsMap[rowKey].material
            data[i].file = InstanceAttrsMap[rowKey].file
            // data[i] = InstanceAttrsMap[rowKey].origin
          }

          flattenData.push(data[i]);
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };

      loop([res.output_data]);

      const findKeyByValue = (obj: Record<string, any>, value: string) => {
        for (const key in obj) {
          if (obj[key] == value) {
            return key
          }
        }
      }

      const filterCenterData = uniqBy(flattenData, (item) => getFileNameWithFormat(item))

      const uniqueFileList = filterCenterData.map(item => {
        const fileAttrsMaps = (item.model_type === 'assembly' ? asmAttrsMap : attrsMap) || {}
        let Spec = ''
        // 优先查询是否有对应的规格型号映射关系
        if (Object.values(fileAttrsMaps).includes("Note")) {
          const SpecAttr = item.property.find((v: any) => v.name == findKeyByValue(fileAttrsMaps, "Note"))
          Spec = SpecAttr?.defaultVal || ''
        }

        const fileNameWithFormat = getFileNameWithFormat(item)
        const fileName = fileNameWithFormat.substring(
          0,
          fileNameWithFormat.lastIndexOf(".")
        );
        const fileFormat = fileNameWithFormat.substring(
          fileNameWithFormat.lastIndexOf(".") + 1
        );
        return {
          id: item.id,
          nameApicode: 'Description',
          nameValue: fileName,
          formatApicode: 'FileFormat',
          formatValue: fileFormat,
          specApicode: 'Note',
          specValue: Spec
        }
      })

      console.log(uniqueFileList, 'uniqueFileList');


      const judgeFileResult: any = await API.judgeFileExist({
        productId: latestProduct.current,
        fileCheckList: uniqueFileList,
        itemCodes: [BasicsItemCode.file],
        userId: user.id,
      });
      const nameInstanceMap = Utils.transformArrayToMap(
        judgeFileResult.result || [],
        "seqId"
      );

      console.log(nameInstanceMap, "nameInstanceMap");

      const PromiseData: any[] = [];
      const PromiseImgData: any[] = [];
      console.log(InstanceAttrsMap, "InstanceAttrsMap");
      for (const item of filterCenterData) {
        const rowKey = getRowKey(item);
        const fileNameWithFormat = getFileNameWithFormat(item);
        const onChainAttrs = InstanceAttrsMap[rowKey].file.onChain;
        const pluginAttrs = InstanceAttrsMap[rowKey].file.plugin;

        const materialOnChainAttrs = InstanceAttrsMap[rowKey].material.onChain;
        const materialPluginAttrs = InstanceAttrsMap[rowKey].material.plugin;
        // 为每一个赋值id属性
        // 判断有实例在系统中
        if (judgeFileResult.result) {
          const rowData = nameInstanceMap[item.id]
          if (rowData) {
            onChainAttrs.rowId = rowData.rowId
            totalAttrs
              .filter((attr: any) => attr.status)
              .forEach((attr: any) => {
                // 判断节点在当前实例中
                onChainAttrs[attr.apicode] = rowData.attributes[attr.id];
                onChainAttrs.insId = rowData.insId;
                onChainAttrs.checkOut = rowData.checkOut;
                onChainAttrs.flag = "exist";
              });
          }


          // 判断文件有对应的物料存在
          const materialDataMap = nameInstanceMap[item.id]?.tabCodeInsMap;

          if (
            materialDataMap &&
            materialDataMap["10002049"] &&
            materialDataMap["10002049"].length
          ) {

            materialOnChainAttrs.insId = materialDataMap["10002049"][0].insId;
            materialOnChainAttrs.rowId = materialDataMap["10002049"][0].rowId;
            materialOnChainAttrs.checkOut =
              materialDataMap["10002049"][0].checkOut;
            materialOnChainAttrs.flag = "exist";
            materialOnChainAttrs.isStandardPart = materialDataMap["10002049"][0].standardPartId
            totalMaterialAttrs
              .filter((attr: any) => attr.status)
              .forEach((attr: any) => {
                materialOnChainAttrs[attr.apicode] =
                  materialDataMap["10002049"][0].attributes[attr.id] || '';
              });
          } else {
            materialOnChainAttrs.insId = "";
            materialOnChainAttrs.checkOut = "";
            materialOnChainAttrs.flag = "add";
            totalMaterialAttrs
              .filter((attr: any) => attr.status)
              .forEach((attr: any) => {
                materialOnChainAttrs[attr.apicode] = '';
              });
          }
        } else {
          // 重置产品变化后带来的更新
          onChainAttrs.flag = "add";
          onChainAttrs.insId = "";
          totalAttrs
            .filter((attr: any) => attr.status)
            .forEach((attr: any) => {
              // 判断节点在当前实例中
              onChainAttrs[attr.apicode] = "";
              onChainAttrs.checkOut = "";
            });
          materialOnChainAttrs.insId = "";
          materialOnChainAttrs.checkOut = "";
          materialOnChainAttrs.flag = "add";
          totalMaterialAttrs
            .filter((attr: any) => attr.status)
            .forEach((attr: any) => {
              materialOnChainAttrs[attr.apicode] = '';
            });
        }

        // 树状结构是设计工具给的，每一个节点都有设计工具给的属性
        // 处理公共额外属性
        // try {

        PromiseData.push(
          new Promise((resolve, reject) => {
            item.file_path && mqttClient.publishTopic !== "Tribon"
              ? readBinaryFile(item.file_path).then((contents) => {
                pluginAttrs["FileSize"] = contents.length;
                resolve({});
              })
              : resolve({});
          })
        );
        // PromiseImgData.push(
        //   new Promise((resolve, reject) => {
        //     item.pic_path
        //       ? readBinaryFile(item.pic_path).then((contents) => {
        //         pluginAttrs["thumbnail"] = Utils.uint8arrayToBase64(contents);
        //         resolve({});
        //       })
        //       : resolve({});
        //   })
        // );

        // PromiseImgData.push(
        //   new Promise((resolve, reject) => {
        //     readBinaryFile("D:\tb\X802012001HCMX01.PDF").then((contents) => {
        //       pluginAttrs["TribonUrl"] = Utils.uint8arrayToBase64(contents);
        //       resolve({});
        //     })

        //   })
        // );
        // const [contents, img_contents] = await Promise.all([readBinaryFile(item.file_path), readBinaryFile(item.pic_path)])
        // const fileSize = contents.length
        const fileName = fileNameWithFormat.substring(
          0,
          fileNameWithFormat.lastIndexOf(".")
        );
        const fileFormat = fileNameWithFormat.substring(
          fileNameWithFormat.lastIndexOf(".") + 1
        );
        // 处理设计工具给的值
        (item?.property || []).filter((item: any) => {
          if (mqttClient.publishTopic === 'Tribon') {
            return ['材质', '规格', '总长', '划线长', '重量'].includes(item.name)
          } else {
            return item
          }
        }).forEach((attr: any) => {
          const fileAttrsMaps = item.model_type === 'assembly' ? asmAttrsMap : attrsMap
          const materialAttrsMaps = item.model_type === 'assembly' ? asmMaterialAttrsMap : prtMaterialAttrsMap
          if (Object.keys(fileAttrsMaps).includes(attr.name)) {
            if (fileColumnsListCodeMap[fileAttrsMaps[attr.name]]) {
              const options = fileColumnsListCodeMap[fileAttrsMaps[attr.name]]?.props?.options || []
              const actualValue = Utils.getLabelInOptions({
                value: attr.defaultVal,
                options: options,
                needValue: true
              })
              pluginAttrs[fileAttrsMaps[attr.name]] = mqttClient.publishTopic === 'Tribon' ? attr.DefaultVal : actualValue;
            } else {
              pluginAttrs[fileAttrsMaps[attr.name]] = mqttClient.publishTopic === 'Tribon' ? attr.DefaultVal : attr.defaultVal;
            }
          }
          if (Object.keys(materialAttrsMaps).includes(attr.name)) {
            //如果属性是列表值，则需要把值转成id，转不成id就给空
            if (materialColumnsListCodeMap[materialAttrsMaps[attr.name]]) {
              const options = materialColumnsListCodeMap[materialAttrsMaps[attr.name]]?.props?.options || []
              const actualValue = Utils.getLabelInOptions({
                value: attr.defaultVal,
                options: options,
                needValue: true
              })
              materialPluginAttrs[materialAttrsMaps[attr.name]] = mqttClient.publishTopic === 'Tribon' ? attr.DefaultVal : actualValue;
            } else {
              materialPluginAttrs[materialAttrsMaps[attr.name]] = mqttClient.publishTopic === 'Tribon' ? attr.DefaultVal : attr.defaultVal;
            }
          }
        });
        pluginAttrs["fileNameWithFormat"] = fileNameWithFormat;
        pluginAttrs["Description"] = fileName;
        pluginAttrs["FileFormat"] = fileFormat;
        // pluginAttrs['FileSize'] = fileSize
        // console.log(cadFileMap, fileFormat, 'fileFormat')
        onChainAttrs["Category"] = cadFileMap[fileFormat] || cadFileMap[fileFormat.toLowerCase()];

        materialOnChainAttrs["Category"] = fileObjectMap[cadFileMap[fileFormat] || cadFileMap[fileFormat.toLowerCase()]];
        // } catch (error) {
        // }
      }

      console.log(flattenData, 'flattenDataflattenData');


      await Promise.all([...PromiseData, ...PromiseImgData]);

      setExpandedKeys(flattenData.map((item) => item.id));

      const copyLeftData = [res.output_data];
      setSelectNode(res.output_data);
      console.log(copyLeftData, 'copyLeftData');


      setLeftData([...copyLeftData]);

      // const cancelFn = await watch(
      //   flattenData.map(row => row.file_path),
      //   () => {
      //     console.log(123)
      //     const currentWindow = getCurrent();
      //     currentWindow.unminimize()
      //     currentWindow.setFocus()
      //     if (!ConfirmOpened.current && !logVisibleLatest.current) {
      //       ConfirmOpened.current = true
      //       confirm("监测到本地文件发生变化，是否同步相关设计文件", { title: '提示', type: 'warning' }).then((res) => {
      //         ConfirmOpened.current = false
      //         if (!res) {
      //           return
      //         }
      //         dispatch(setLoading(true));
      //         mqttClient.publish({
      //           type: CommandConfig.getCurrentBOM,
      //           input_data: {
      //             "info": ["proximate"],
      //             'transformer': ['pdf', 'step', 'image']
      //           }
      //         });
      //       })
      //     }
      //   },
      //   {
      //     delayMs: 3000,
      //     recursive: true
      //   },
      // );
      // setWatchCancelFn(cancelFn)
      dispatch(setLoading(false));
    } catch (error) {
      console.log(error, 'errorerror');

      dispatch(setLoading(false));
    }

  };

  const judgeFileCheckout = (row: any, isMaterial?: boolean) => {
    console.log(row[isMaterial ? 'material' : 'file'].onChain, '23');

    if (row[isMaterial ? 'material' : 'file'].onChain.Revision == 1) {
      return false;
    } else {
      return row[isMaterial ? 'material' : 'file'].onChain.checkOut;
    }
  };

  const updateSingleData = async (row: any, isMaterial?: boolean) => {

    const res: any = await API.getInstanceInfoById({
      instanceId: row.insId,
      authType: "read",
      tabCode: "10002001",
      userId: user.id,
      tenantId: sse.tenantId || "719",
    })

    res.result.pdmAttributeCustomizedVoList.forEach((item: any) => {
      const rowKey = getRowKey(row);
      InstanceAttrsMap[rowKey][isMaterial ? 'material' : 'file'].onChain[item.apicode] =
        res.result.readInstanceVo.attributes[item.id];
      InstanceAttrsMap[rowKey][isMaterial ? 'material' : 'file'].onChain.checkOut =
        res.result.readInstanceVo.checkOut;
      InstanceAttrsMap[rowKey][isMaterial ? 'material' : 'file'].onChain.Revision =
        res.result.readInstanceVo.insVersionOrder;
      setLeftData([...leftData]);
    });
  };

  const batchUpdateData = async ({ selectRows, isMaterial }: { selectRows: any, isMaterial?: boolean }) => {
    if (!selectRows.length) {
      message.error('请勾选要更新对象')
      return
    }

    setLogVisbile(true)
    warpperSetLog(() => {
      setLogData([
        ...lastestLogData.current,
        {
          log: "批量更新开始。。。",
          dateTime: getCurrentTime(),
          id: Utils.generateSnowId(),
        },
      ]);
    });
    selectRows.sort((a: any, b: any) => b.serielNumber - a.serielNumber)
    for (let i = 0; i < selectRows.length; i++) {
      await updateData({ row: selectRows[i], isMaterial })
    }
    dispatch(setLoading(true));
    mqttClient.publish({
      type: CommandConfig.getCurrentBOM,
      input_data: {
        "info": ["proximate"],
        'transformer': ['image']
      }
    });
    setLogVisbile(false)
    warpperSetLog(() => {
      setLogData([
        ...lastestLogData.current,
        {
          log: "批量更新完成",
          dateTime: getCurrentTime(),
          id: Utils.generateSnowId(),
        },
      ]);
    });
    setLogData([])
  }



  const updateData = async ({ row, isMaterial }: { row: any, isMaterial?: boolean }) => {
    // 首先判断当前有没有签出权限
    const hasCheckoutAuth = await getInstanceAuth(isMaterial ? BasicsItemCode.material : BasicsItemCode.file, row.insId, ['public_checkOut'])

    if (!hasCheckoutAuth.get('public_checkOut')) {
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            log: `对${row[isMaterial ? 'material' : 'file'].onChain.Description}没有签出权限`,
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          },
        ]);
      });
      message.error("对当前实例没有签出权限")
      dispatch(setLoading(false));
      return
    }
    // 判断当前文件是否签出
    if (judgeFileCheckout(row, isMaterial)) {
      if (isMaterial) {
        await originCheckInMaterial(row)
      } else {
        await originCheckIn(row);
      }

      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(true));
      await API.checkout({
        checkoutBy: user.id,
        insId: row.insId,
        insSize: String(row.FileSize),
        insName: row[isMaterial ? 'material' : 'file'].onChain.Description,
      })
      const res: any = await API.getInstanceInfoById({
        instanceId: row.insId,
        authType: "read",
        tabCode: "10002001",
        userId: user.id,
        tenantId: sse.tenantId || "719",
      })
      const data = (isMaterial ? materialCenterData : centerData).find(item => getRowKey(item) == getRowKey(row))
      if (!data) {
        return
      }
      data[isMaterial ? 'material' : 'file'].onChain.checkOut = res.result.readInstanceVo.checkOut;
      data[isMaterial ? 'material' : 'file'].onChain.Revision = res.result.readInstanceVo.insVersionOrder;
      data[isMaterial ? 'material' : 'file'].onChain.rowId = res.result.readInstanceVo.rowId;

      if (isMaterial) {
        await originCheckInMaterial(data)
      } else {
        await originCheckIn(data);
      }
    }
  };

  // 获取实例是否具备，签出，签入的权限
  type authType = 'public_cancelCheckOut' | 'public_CheckIn' | 'public_checkOut'

  const getInstanceAuth = async (itemCode: string, insId: string, types: authType[]) => {
    const { result: result = [] }: any = await API.checkAuth(insId, itemCode, user.id)
    console.log(result, 'result');

    let authMap = new Map<authType, boolean>()
    result.forEach((btn: any) => {
      if (btn.enabled && types.includes(btn.code)) {
        authMap.set(btn.code, true)
      }
    })
    console.log(authMap, 'authMap');
    return authMap
  }

  const checkoutData = async ({ row, isMaterial }: { row: any, isMaterial?: boolean }) => {
    // 首先判断当前有没有签出权限
    const hasCheckoutAuth = await getInstanceAuth(isMaterial ? BasicsItemCode.material : BasicsItemCode.file, row.insId, ['public_checkOut'])
    if (!hasCheckoutAuth.get('public_checkOut')) {
      message.error("对当前实例没有签出权限")
      dispatch(setLoading(false));
      return
    }

    // 判断当前文件是否签出
    if (judgeFileCheckout(row, isMaterial)) {
      message.error("当前实例已签出");
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(true));
      API.checkout({
        checkoutBy: user.id,
        insId: row.insId,
        insSize: String(row.FileSize),
        insName: row[isMaterial ? 'material' : 'file'].onChain.Description,
      })
        .then(async () => {
          await updateSingleData(row, isMaterial);
          setFileSelectRows([])
          setMaterialSelectRows([])
          dispatch(setLoading(false));
        })
        .catch(() => {
          dispatch(setLoading(false));
        });
    }
  };

  const cancelCheckoutData = async ({ row, isMaterial }: { row: any, isMaterial?: boolean }) => {
    // 首先判断当前有没有签出权限
    const hasCheckoutAuth = await getInstanceAuth(isMaterial ? BasicsItemCode.material : BasicsItemCode.file, row.insId, ['public_cancelCheckOut'])
    if (!hasCheckoutAuth.get('public_cancelCheckOut')) {
      message.error("对当前实例没有取消签出权限")
      dispatch(setLoading(false));
      return
    }
    if (!judgeFileCheckout(row, isMaterial)) {
      message.error("当前实例还未签出");
      dispatch(setLoading(false));
    } else {
      dispatch(setLoading(true));
      API.cancelCheckout({ insId: row.insId })
        .then(async (res) => {
          setFileSelectRows([])
          setMaterialSelectRows([])
          await updateSingleData(row, isMaterial);
          dispatch(setLoading(false));
        })
        .catch(() => {
          dispatch(setLoading(false));
        });
    }
  };

  const originCheckIn = async (row: any) => {

    await updateCadAttr([row])
    // 签入需要更新当前的附件，以及相对应的属性，以及结构
    const {
      result: { records },
    }: any = await API.queryInstanceTab({
      instanceId: row.file.onChain.insId,
      itemCode: BasicsItemCode.file,
      pageNo: "1",
      pageSize: "1000",
      tabCode: "10002016",
      tabCodes: "10002016",
      tenantId: sse.tenantId || "719",
      userId: user.id,
      version: row.Version,
      versionOrder: row.file.onChain.Revision,
    });
    console.log(records, "records");

    if ((records || []).length) {
      const params = {
        id: row.file.onChain.insId,
        itemCode: BasicsItemCode.file,
        tabCode: "10002016",
        deleteAffectedInstanceIds: records
          .map((item: any) => item.insId)
          .join(","),
        deleteRowIds: records.map((item: any) => item.rowId),
        tenantId: sse.tenantId || "719",
        userId: user.id,
        versionNumber: row.Version,
      };
      console.log(params, "删除结构参数");
      const result = await API.insatnceTabsave(params);
      console.log(result, "删除结构");
    }
    // //更新当前的第一级结构
    const {
      result: { records: tabAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002016",
    });

    const rowKey = getRowKey(row);

    const countMap = groupBy(
      InstanceAttrsMap[rowKey].origin.children || [],
      (item) => {
        return getRowKey(item);
      }
    );

    console.log(countMap, "countMap");

    const setVal = (row: any, col: any) => {
      if (col.apicode === "ID") {
        return row.file.onChain.insId;
      } else if (col.apicode === "Qty") {
        console.log(row.file.plugin.Description, "");
        return countMap[getRowKey(row)].length || "";
      } else {
        return "";
      }
    };

    const flattenData = uniqBy((
      InstanceAttrsMap[getRowKey(row)].origin.children || []
    ), (item) => {
      return getRowKey(item)
    }).filter((item: any) => {
      return getRowKey(item) != getRowKey(row);
    });

    // 需要过滤掉所有的内部零件以及
    const dealParams = flattenData.map((item: any) => {
      return {
        insAttrs: tabAttrs
          .filter((attr: any) => {
            return ["ID", "Qty"].includes(attr.apicode);
          })
          .map((attr: any) => {
            return {
              apicode: attr.apicode,
              id: attr.id,
              valueType: attr.valueType,
              value: setVal(item, attr),
            };
          }),
      };
    });
    console.log(dealParams, "dealParams");
    if (dealParams.length) {
      await API.insatnceTabsave({
        itemCode: BasicsItemCode.file,
        tabCode: "10002016",
        rowList: dealParams,
        id: row.file.onChain.insId,
        tenantId: sse.tenantId || "719",
        userId: user.id,
        versionNumber: row.Version,
      });
    }
    const nameFileUrlMap = await uploadFile([
      {
        name: getFileNameWithFormat(row),
        data: new Blob([await readBinaryFile(row.file_path)]),
        source: "Local",
        isRemote: false,
      },
    ]);

    let pic_base64: any = ''

    if (row.pic_path) {
      const blob = new Blob([await readBinaryFile(row.pic_path)])
      pic_base64 = await blobToBase64(blob)
    } else {
      const nameThumbMap: any = await invoke("get_icons", {
        req: [row.file_path]
      });
      pic_base64 = nameThumbMap[row.file_path]
    }


    const updateInstance = {
      id: row.file.onChain.insId,
      itemCode: BasicsItemCode.file,
      tabCode: "10002001",
      // rowId: row.file.onChain.rowId,
      insAttrs: Attrs.filter((item) => item.status).map((attr) => {
        if (attr.apicode === "FileUrl") {
          return {
            ...attr,
            value: `/plm/files${nameFileUrlMap[
              getFileNameWithFormat(row)
            ].response.uploadURL.split("/plm/files")[1]
              }?name=${row.file.plugin?.fileNameWithFormat}&size=${row.file.plugin?.FileSize
              }&extension=${row.file.plugin?.FileFormat}`,
          };
        } else if (attr.apicode === "Thumbnail") {
          return {
            ...attr,
            value: `data:image/png;base64,${pic_base64}`,
          };
        } else {
          return {
            ...attr,
            value: row[attr.apicode],
          };
        }
      }),
      tenantId: sse.tenantId || "719",
    }

    console.log(updateInstance,'updateInstanceupdateInstance');
    

    if (updateInstance.id) {
      await API.singleUpdate(updateInstance).catch(() => {
        dispatch(setLoading(false));
      });
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            log: "批量更新模型地址成功！",
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          },
        ]);
      });
    }
    await updoadAttachMent({ filterCenterData: [row] })
    

    await API.checkIn({
      insId: row.insId,
      insUrl: "",
      insSize: String(row.FileSize),
      insName: row.file.onChain.Description,
    })
      .catch(() => {
        dispatch(setLoading(false));
      });
    setFileSelectRows([])
    setMaterialSelectRows([])

    const {
      result: { records: recordsCopy },
    }: any = await API.queryInstanceTab({
      instanceId: row.file.onChain.insId,
      itemCode: BasicsItemCode.file,
      pageNo: "1",
      pageSize: "500",
      tabCode: "10002009",
      tabCodes: "10002009",
      tenantId: sse.tenantId || "719",
      userId: user.id,
      // version: row.Version,
      // versionOrder: row.file.onChain.Revision,
    });

    const revision = row.file.onChain.Revision.replace("(", "").replace(")", "")

    const params = recordsCopy.filter((item: any) => readPermission(item.createName)).map((item: any) => {
      return { createBy: user.id, parInsId: item.createName, msgStatus: false, msgContent: `${user.name} 已将 ${row.file.onChain.Description} 更新成最新的版次 ${revision}` }
    })

    await API.postMessageData(params)

    API.sendMessage("ChildfileVersionOrderUpdate", "*", user.id, JSON.stringify({
      instance: {
        insId: row.insId,
        insDesc: row.file.onChain.Description,
        insVersionOrderUnbound: revision
      },
      from: user.name
    }))
    dispatch(setLoading(false));

  };

  const originCheckInMaterial = async (row: any) => {

    // 签入需要更新当前的附件，以及相对应的属性，以及结构
    const {
      result: { records },
    }: any = await API.queryInstanceTab({
      instanceId: row.material.onChain.insId,
      itemCode: BasicsItemCode.material,
      pageNo: "1",
      pageSize: "500",
      tabCode: "10002003",
      tabCodes: "10002003",
      tenantId: sse.tenantId || "719",
      userId: user.id,
      version: row.material.onChain.Version,
      versionOrder: row.material.onChain.Revision,
    });
    console.log(records, "records");

    if ((records || []).length) {
      const params = {
        id: row.material.onChain.insId,
        itemCode: BasicsItemCode.material,
        tabCode: "10002003",
        deleteAffectedInstanceIds: records
          .map((item: any) => item.insId)
          .join(","),
        deleteRowIds: records.map((item: any) => item.rowId),
        tenantId: sse.tenantId || "719",
        userId: user.id,
        versionNumber: row.material.onChain.Version,
      };
      console.log(params, "删除结构参数");
      const result = await API.insatnceTabsave(params);
      console.log(result, "删除结构");
    }
    // //更新当前的第一级结构
    const {
      result: { records: tabAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.material,
      tabCode: "10002003",
    });

    const rowKey = getRowKey(row);

    const countMap = groupBy(
      InstanceAttrsMap[rowKey].origin.children || [],
      (item) => {
        return getRowKey(item);
      }
    );

    const setVal = (row: any, col: any) => {
      if (col.apicode === "ID") {
        return row.material.onChain.insId;
      } else if (col.apicode === "Qty") {
        return countMap[getRowKey(row)].length || "";
      } else {
        return "";
      }
    };

    const flattenData = uniqBy((
      InstanceAttrsMap[getRowKey(row)].origin.children || []
    ), (item) => {
      return getRowKey(item)
    }).filter((item: any) => {
      return getRowKey(item) != getRowKey(row);
    });

    // 需要过滤掉所有的内部零件以及
    const dealParams = flattenData.map((item: any) => {
      return {
        insAttrs: tabAttrs
          .filter((attr: any) => {
            return ["ID", "Qty"].includes(attr.apicode);
          })
          .map((attr: any) => {
            return {
              apicode: attr.apicode,
              id: attr.id,
              valueType: attr.valueType,
              value: setVal(item, attr),
            };
          }),
      };
    });
    console.log(dealParams, "dealParams");
    if (dealParams.length) {
      await API.insatnceTabsave({
        itemCode: BasicsItemCode.material,
        tabCode: "10002003",
        rowList: dealParams,
        id: row.material.onChain.insId,
        tenantId: sse.tenantId || "719",
        userId: user.id,
        versionNumber: row.material.onChain.Version,
      });
    }


    //批量更新文件地址
    const updateInstance = {
      id: row.material.onChain.insId,
      itemCode: BasicsItemCode.material,
      tabCode: "10002001",
      // rowId: row.material.onChain.rowId,
      // versionNumber: row.material.onChain.Version,
      // versionOrder: row.material.onChain.Revision,
      insAttrs: materialAttrs.filter((item) => item.status).map((attr) => {
        return {
          ...attr,
          value: row.material.plugin[attr.apicode] || row.material.onChain[attr.apicode],
        }
      }),
      tenantId: sse.tenantId || "719",
    }
    console.log(updateInstance, "签出签入更新模型的属性");

    if (updateInstance.id) {
      await API.singleUpdate(updateInstance).catch(() => {
        dispatch(setLoading(false));
      });
    }

    warpperSetLog(() => {
      setLogData([
        ...lastestLogData.current,
        {
          dateTime: getCurrentTime(),
          log: `更新${row.file.onChain.Description}成功!`,
          id: Utils.generateSnowId(),
        },
      ]);
    });
    await API.checkIn({
      insId: row.insId,
    })

    setFileSelectRows([])
    setMaterialSelectRows([])
    await updateSingleData(row, true);
    dispatch(setLoading(false));
  }

  const checkInData = async ({ row, isMaterial }: { row: any, isMaterial?: boolean }) => {
    // 首先判断当前有没有签出权限
    const hasCheckoutAuth = await getInstanceAuth(isMaterial ? BasicsItemCode.material : BasicsItemCode.file, row.insId, ['public_CheckIn'])
    if (!hasCheckoutAuth.get('public_CheckIn')) {
      message.error("对当前实例没有签入权限")
      dispatch(setLoading(false));
      return
    }

    if (!judgeFileCheckout(row, isMaterial)) {
      dispatch(setLoading(false));
      message.error("当前实例还未签出");
    } else {
      if (isMaterial) {
        await originCheckInMaterial(row)
      } else {
        await originCheckIn(row);
      }
      dispatch(setLoading(true));
      mqttClient.publish({
        type: CommandConfig.getCurrentBOM,
        input_data: {
          "info": ["proximate"],
          'transformer': ['image']
        }
      });
    }
  };

  // 获取选中节点的扁平化数据（过滤后的)
  const getFlattenData = (selectNode: any) => {
    console.log(selectNode, 'selectNode')
    const flattenData: Record<string, any>[] = [];
    const loop = (data: any) => {
      for (let i = 0; i < data.length; i++) {
        const flattenedItem = {
          ...data[i],
          ...data[i].file.onChain,
          ...data[i].file.plugin,
        }; // Create a copy of the current item
        delete flattenedItem.children; // Remove the "children" property from the copy
        delete flattenedItem.property;
        const nodeNames = flattenData.map((item) => {
          return getRowKey(item);
        });
        const rowKey = getRowKey(data[i])
        if (
          !nodeNames.includes(rowKey) &&
          !(InstanceAttrsMap[rowKey].origin.InternalModelFlag && judgeStandard(InstanceAttrsMap[rowKey].origin)) &&
          InstanceAttrsMap[rowKey].file.plugin.fileNameWithFormat
        ) {
          flattenData.push(flattenedItem);
        }
        if (data[i].children && data[i].children.length) {
          loop(data[i].children);
        }
      }
    };
    loop([selectNode]);
    return flattenData;
  };

  // useAsyncEffect(async () => {
  //   if (selectNode && ConfirmOpenedLatest.current) {
  //     const flattenData: Record<string, any>[] = getFlattenData(selectNode);

  //   }
  // }, [selectNode, ConfirmOpenedLatest.current])

  // 取出所有的属性
  useEffect(() => {
    if (leftData.length) {
      const flattenData: Record<string, any>[] = getFlattenData(selectNode);
      setCenterData(flattenData);
    }
  }, [selectNode, leftData]);

  const ChildfileVersionOrderUpdate = useMemoizedFn((data: any) => {
    let { instance = {}, from } = JSON.parse(data)
    if (from === user.name) {
      return
    }
    const childLevelData = leftData[0]?.children || []
    if (childLevelData.find((item: any) => item?.file?.onChain?.insId == instance.insId)) {
      const content = `${from} 已将 ${instance.insDesc} 更新成最新的版次 ${instance.insVersionOrderUnbound} , 是否要更新本地文件`
      dispatch(fetchMessageData({
        parInsId: user.id,
        pageNo: "1",
        pageSize: "1000"
      }) as any)
      confirm(content, { title: '文件更新', type: 'warning' }).then(async res => {
        if (!res) {
          return
        }
        await openDesign({
          loading: () => {
            dispatch(setLoading(true));
          },
          cancelLoading: () => {
            dispatch(setLoading(false));
          },
          network: network,
          insId: instance.insId,
          userId: user.id,
          itemCode: "10001006",
          extra: {
            onEvent: async (path) => {
              await invoke("open_designer", { path: `${path.substring(0, path.lastIndexOf('\\'))}"` })
              // openFileDialog({
              //   defaultPath: path
              // })
              // invoke("reveal_file", {
              //   path: path
              // })
            }
          }
        });
      })
    }
  })

  useEffect(() => {
    sse.registerCallBack("ChildfileVersionOrderUpdate", (data) => {
      ChildfileVersionOrderUpdate(data)
    })
    return () => {
      sse.unRegisterCallBack("ChildfileVersionOrderUpdate")
    }
  }, [])

  // 取出所有的属性
  useEffect(() => {
    if (leftData.length) {
      const flattenData: Record<string, any>[] = [];
      const getKeys = (data: any) => {
        if (mqttClient.publishTopic === 'Tribon') {
          return data.caihzi ? `${data.caihzi}${data.guige}` : data.node_name
        } else {
          return getRowKey(data)
        }
      }
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          const flattenedItem = {
            ...data[i],
            ...data[i].material.onChain,
            ...data[i].material.plugin,
          }; // Create a copy of the current item
          delete flattenedItem.children; // Remove the "children" property from the copy
          delete flattenedItem.property;
          const nodeNames = flattenData.map((item) => {
            return getKeys(item);
          });
          if (
            !nodeNames.includes(getKeys(data[i])) &&
            !(data[i].InternalModelFlag && judgeStandard(data[i])) &&
            data[i].file.plugin.fileNameWithFormat
          ) {
            flattenData.push(flattenedItem);
          }
          if (data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop([selectNode]);
      console.log(flattenData, 'flattenData')
      setMaterialCenterData(sortBy(flattenData, ['guige', 'caihzi']));

    }
  }, [selectNode, leftData]);


  // 获取2D数据
  useAsyncEffect(async () => {
    if (selectProduct && !isNot2D(mqttClient.publishTopic)) {
      console.log(mqttClient.publishTopic);
      // 模拟AD假数据
      if (mqttClient.publishTopic === 'Altium') {
        setDesignData(ADdata.getCurrentBOM);
        dealCurrentBom(ADdata.getCurrentBOM);
      }
      const fileArr = await getFolderFile("D:/example-design (2)")
      console.log(fileArr, 'fileArr');

      const prj = fileArr.find(item => item.name?.substring(item.name?.lastIndexOf('.') + 1) === 'PrjPCB')
      const lastData = fileArr.filter(item => item.name?.substring(item.name?.lastIndexOf('.') + 1) != 'PrjPCB')
      if (prj) {
        prj.children = lastData
        setFile2D([prj])
        setExpanded2DKeys([prj.name])
      } else {
        setFile2D([])
      }
      const adData = ADdata.AltiumBom.Variants[0].Items
      adData.forEach((item: any, index: number) => {
        item.no = index + 1
      })
      setMaterial2D(adData)
    }
  }, [selectProduct])


  // 监听属性映射
  useMqttRegister(CommandConfig.getCurrentBOM, async (res) => {
    dispatch(setBom({ init: false }));
    setDesignData(res);
    await dealCurrentBom(res);
  });

  // 监听设置属性
  useMqttRegister(CommandConfig.setProductAttVal, async (res) => {
    updatingAttr.current = true
    ConfirmOpened.current = false
    warpperSetLog(() => {
      setLogData([
        ...lastestLogData.current,
        {
          dateTime: getCurrentTime(),
          log: "属性回写模型成功!",
          id: Utils.generateSnowId(),
        },
      ]);
    });
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
    const w = img.width || 400;
    const h = img.height || 400;
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

  const transferValue = (val: any) => {
    if (isArray(val)) {
      return val.join(',')
    } else if (moment.isMoment(val)) {
      return moment(val).format("YYYY-MM-DD")
    } else {
      return val
    }
  }


  const getPropertyByName = (data: any, name: string) => {
    const property = (data.property || []).find((item: any) => {
      return item.name === name
    })
    return property?.DefaultVal
  }

  /**
   * 创建实例
   */
  const createInstance = async ({ itemCode }: { itemCode: string }) => {
    // 根据所选的产品去查询第一个型谱的id
    const spectrumReturnV: any = await API.getProductSpectrumList(
      selectProduct
    );
    const spectrum = spectrumReturnV.result[0].id;

    const setVal = (row: any, col: any) => {
      if (ItemCode.isFile(itemCode)) {
        if (col.apicode === "ProductModel") {
          return spectrum;
        } else if (col.apicode === "Product") {
          return selectProduct;
        } else if (col.apicode === "FileUrl") {
          return "";
        } else if (col.apicode === "Thumbnail") {
          return "";
        } else if (col.apicode === "FileFormat") {
          return row.file.plugin.FileFormat;
        } else if (col.apicode === "FileSize") {
          return row.file.plugin.FileSize;
        } else if (col.apicode === "Category") {
          return row.file.onChain.Category;
        } else {
          return transferValue(row[col.apicode] || col.defValue || "");
        }
      } else {
        if (col.apicode === "ProductModel") {
          return spectrum;
        } else if (col.apicode === "Product") {
          return selectProduct;
        } else if (col.apicode === "Category") {
          return mqttClient.publishTopic === 'Tribon' && !row.guige ? '1480780705587916801' : row.material.onChain.Category;
        } else if (col.apicode === "Number") {
          return "";
        } else if (col.apicode === "Description" && mqttClient.publishTopic === 'Tribon') {
          return row.caihzi ? `${row.caihzi}${row.guige}` : row.node_name;
        } else {
          return transferValue(row[col.apicode] || col.defValue || "");
        }
      }
    };

    const ItemCodeFolder = ItemCode.isFile(itemCode) ? "file" : "material";

    let materialData = materialCenterData
    console.log(materialCenterData, 'materialCenterData');

    if (mqttClient.publishTopic === 'Tribon') {
      const empty = materialCenterData.filter(v => !v.caihzi)
      const hasData = uniqBy(materialCenterData.filter(v => {
        console.log(v, 'vvv');

        return v.caihzi
      }), (s) => `${s.caihzi}${s.guige}`)
      console.log(empty, 'empty');
      console.log(hasData, 'hasData');


      materialData = [...empty, ...hasData]
      console.log(materialData, 'materialData');

    }

    const dealData = (
      ItemCode.isFile(itemCode) ? centerData : materialData
    )
      .filter((item) => item[ItemCodeFolder].onChain.flag != "exist")
      .map((item, index) => {
        const Category = item[ItemCodeFolder].onChain.Category;
        return {
          fileIndex: index,
          itemCode: itemCode,
          objectId: mqttClient.publishTopic === 'Tribon' && !item.guige ? '1480780705587916801' : Category,
          workspaceId: selectProduct,
          caihzi: item.caihzi,
          guige: item.guige,
          node_name: item.node_name,
          file_path: item.file_path,
          tenantId: sse.tenantId || "719",
          verifyCode: "200",
          user: user.id,
          material: item.material,
          insAttrs: (ItemCode.isFile(itemCode) ? Attrs : materialAttrs)
            .filter((item) => item.status)
            .map((v) => {
              return {
                ...v,
                value: setVal(item, v),
              };
            }),
        };
      });

    console.log(dealData, "创建参数");

    if (!dealData.length) {
      return
    }

    const successInstances: any = await API.createInstances(dealData);

    console.log(successInstances, "创建返回");

    const createLogArray: logItemType[] = [];
    successInstances.result.forEach((item: any) => {
      if (item && item.code == 500) {
        createLogArray.push({
          log: `${item.msg}`,
          dateTime: getCurrentTime(),
          id: Utils.generateSnowId(),
        });
      } else
        if (item && item.number) {
          createLogArray.push({
            log: `${item.name} 创建成功， 编号:${item.number}`,
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          });
        }
    });
    warpperSetLog(() => {
      setLogData([...lastestLogData.current, ...createLogArray]);
    });

    // if (ItemCode.isFile(itemCode)) {
    //   return successInstances
    // } else {
    const successInstancesMap: any = {};
    console.log(successInstances, "successInstances");

    successInstances.result.forEach((item: any, index: number) => {
      if (item.code == 2000) {
        // tribon判断首先根据caizhiguige然后根据node_name
        const rowKey = mqttClient.publishTopic === 'Tribon' ? (dealData[index].caihzi ? `${dealData[index].caihzi}${dealData[index].guige}` : dealData[index].node_name) : getRowKey(dealData[index])
        successInstancesMap[rowKey] = item;
      }
    });
    console.log(successInstancesMap, 'successInstancesMap')
    return successInstancesMap;
    // }
  };

  const createStructure = async ({
    nameNumberMap,
    itemCode,
    tabCode,
  }: {
    nameNumberMap?: any;
    itemCode: string;
    tabCode: string;
  }) => {
    // // 批量创建文件结构
    // // 查找公有属性
    const {
      result: { records: structureAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: itemCode,
      tabCode: tabCode,
    });
    const structureAttrsMap = Utils.transformArrayToMap(
      structureAttrs,
      "apicode",
      "id"
    );
    const structureData = cloneDeep(leftData);


    // 复写获取rowkey的方法
    const getRowKeyOverWrite = (data: any) => {
      if (mqttClient.publishTopic === 'Tribon') {
        const caizhi = getPropertyByName(data, '材质')
        // console.log(caizhi, 'caizhi')
        const guige = getPropertyByName(data, '规格')
        return caizhi && guige ? `${caizhi}${guige}` : data.node_name
      } else {
        return getRowKey(data)
      }
    }

    // 是否构建结构错误的标注
    let buildStructError = false

    const loop = (struct: any, dealArray: any) => {
      for (let i = 0; i < struct.length; i++) {
        struct[i].attrMap = {};
        const folder = ItemCode.isFile(itemCode) ? "file" : "material";
        const rowKey = getRowKeyOverWrite(struct[i])
        // console.log(, struct[i].material, 'getRowKeyOverWrite(struct[i])')
        struct[i].insId =
          struct[i][folder].onChain.flag != "exist" && nameNumberMap
            ? nameNumberMap[rowKey]?.instanceId
            : InstanceAttrsMap[rowKey][folder].onChain.insId;
        if (!struct[i].insId) {
          warpperSetLog(() => {
            setLogData([...lastestLogData.current, {
              log: `${struct[i].node_name} 节点实例未创建，构建结构失败`,
              dateTime: getCurrentTime(),
              id: Utils.generateSnowId(),
            }])
          })
          buildStructError = true
          break
        }
        if (rowKey != getRowKeyOverWrite(leftData[0])) {
          struct[i].attrMap[structureAttrsMap["Qty"]] = dealArray.map[rowKey];
          if (mqttClient.publishTopic === 'Tribon') {

            const unique = getPropertyByName(struct[i], '材质') ? `${getPropertyByName(struct[i], '材质')}${getPropertyByName(struct[i], '规格')}` : struct[i].node_name
            struct[i].attrMap[structureAttrsMap["RefNumber"]] = dealArray.mLoc[unique].join(",");

            struct[i].attrMap[structureAttrsMap["zhognliang"]] = dealArray.mWeight[unique]

            struct[i].attrMap[structureAttrsMap["zongchang"]] = dealArray.mLong[unique]
          }
        }
        struct[i] = pick(struct[i], ["insId", "attrMap", "children", "property", "guige", "caihzi"]);
        if (struct[i].children && struct[i].children.length) {
          struct[i].copyChildren = [...struct[i].children];
          struct[i].children = uniqueArrayByAttr(struct[i].children).array;
          loop(struct[i].children, uniqueArrayByAttr(struct[i].copyChildren));
          delete struct[i].copyChildren;
        }
      }
    };
    loop(structureData, uniqueArrayByAttr(structureData));

    console.log(buildStructError, structureData, "创建结构参数");
    if (!buildStructError) {
      console.log("进入创建结构")
      await API.batchCreateStructure({
        tenantId: sse.tenantId || "719",
        userId: user.id,
        itemCode: itemCode,
        tabCode: tabCode,
        instances: structureData,
      });
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            log: ItemCode.isFile(itemCode)
              ? "批量创建结构成功!"
              : "批量创建BOM成功!",
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          },
        ]);
      });
    }

  };

  // 上传文件
  const uploadFile = async (FileArray: any) => {
    // // 批量上传文件
    const uppy = new Uppy({
      meta: {},
      debug: false,
      autoProceed: true,
    });
    const path = await resolveResource('Config.ini')

    const config = await readTextFile(path)

    const INIData = Utils.parseINIString(config)
    let tusUrl = BasicConfig.TusUrl
    if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].TusUrl) {
      tusUrl = INIData['ONCHAIN'].TusUrl
    }

    uppy
      .use(Tus, {
        endpoint: tusUrl,
        headers: {
          // "Access-Control-Allow-Origin": "*"
          // Authorization: `${StorageController.token.get()}`,
        },
        chunkSize: 1 * 1024 * 1024,
        overridePatchMethod: false,
        allowedMetaFields: null,
      })
      .on("upload-progress", (...e) => {
        if (
          lastestLogData.current.findIndex(
            (item) => item.id == `upload-${e[0]?.name}`
          ) != -1
        ) {
          const logs = lastestLogData.current.map((item) => {
            if (item.id === `upload-${e[0]?.name}`) {
              return {
                log: `${e[0]?.name} ${e[1]?.bytesUploaded == e[1]?.bytesTotal
                  ? "上传完成"
                  : "上传中"
                  } ${((e[1]?.bytesUploaded / e[1]?.bytesTotal) * 100).toFixed(
                    2
                  )}%！`,
                dateTime: getCurrentTime(),
                id: `upload-${e[0]?.name}`,
              };
            } else {
              return item;
            }
          });
          warpperSetLog(() => {
            setLogData(logs);
          });
        } else {
          warpperSetLog(() => {
            setLogData([
              ...lastestLogData.current,
              {
                log: `${e[0]?.name} 开始上传 ${(
                  (e[1]?.bytesUploaded / e[1]?.bytesTotal) *
                  100
                ).toFixed(2)}%！`,
                dateTime: getCurrentTime(),
                id: `upload-${e[0]?.name}`,
              },
            ]);
          });
        }
      });

    uppy.addFiles(FileArray);
    const res = await uppy.upload();
    const nameThumbMap = Utils.transformArrayToMap(res.successful, "name");
    uppy.close();
    console.log(nameThumbMap, "nameThumbMap");
    localStorage.clear();
    return nameThumbMap;
  };


  const create2DInstance = async ({ itemCode, nameFileUrlMap }: { itemCode: string, nameFileUrlMap: any }) => {
    // 根据所选的产品去查询第一个型谱的id
    const spectrumReturnV: any = await API.getProductSpectrumList(
      selectProduct
    );
    const spectrum = spectrumReturnV.result[0].id;

    const setVal = (row: any, col: any) => {
      if (ItemCode.isFile(itemCode)) {
        if (col.apicode === "ProductModel") {
          return spectrum;
        } else if (col.apicode === "Product") {
          return selectProduct;
        } else if (col.apicode === "FileUrl") {
          return `/plm/files${(nameFileUrlMap[
            row.name
          ]).response.uploadURL.split("/plm/files")[1]
            }?name=${row.name}&size=${row.size
            }&extension=${row.name.substring(row.name.lastIndexOf('.') + 1)}`;
        } else if (col.apicode === "Thumbnail") {
          return "";
        } else if (col.apicode === "FileFormat") {
          return row.name.substring(row.name.lastIndexOf('.') + 1);
        } else if (col.apicode === "FileSize") {
          return row.size;
        } else if (col.apicode === "Category") {
          return "1459426710323851265";
        } else if (col.apicode === "Description") {
          return row.name.substring(0, row.name.lastIndexOf('.'));
        } else {
          return transferValue(row[col.apicode] || col.defValue || "");
        }
      } else {
        if (col.apicode === "ProductModel") {
          return spectrum;
        } else if (col.apicode === "Product") {
          return selectProduct;
        } else if (col.apicode === "Category") {
          return "1718507649423851521";
        } else if (col.apicode === "Number") {
          return "";
        } else if (col.apicode === "Description") {
          return row.Description;
        } else if (col.apicode === "Unit") {
          return "1452642664448032";
        } else if (col.apicode === "materialName") {
          return row.Comment;
        } else {
          return transferValue(row[col.apicode] || col.defValue || "");
        }
      }
    };
    const dealData = (
      ItemCode.isFile(itemCode) ? [file2D[0], ...file2D[0].children].filter(item => item.name.indexOf('.') != -1) : [file2D[0], ...material2D]
    )
      .filter((item) => item.flag != "exist")
      .map((item, index) => {
        const Category = ItemCode.isMaterial(itemCode) ? "1459426710323851265" : "1718507649423851521";
        return {
          fileIndex: index,
          itemCode: itemCode,
          objectId: Category,
          workspaceId: selectProduct,
          node_name: item.name,
          file_path: item.path,
          tenantId: sse.tenantId || "719",
          verifyCode: "200",
          user: user.id,
          insAttrs: (ItemCode.isFile(itemCode) ? Attrs : materialAttrs)
            .filter((item) => item.status)
            .map((v) => {
              return {
                ...v,
                value: setVal(item, v),
              };
            }),
        };
      });

    console.log(dealData, "创建参数");

    const successInstances: any = await API.createInstances(dealData);

    console.log(successInstances, "创建返回");

    const createLogArray: logItemType[] = [];
    successInstances.result.forEach((item: any) => {
      if (item && item.code == 500) {
        createLogArray.push({
          log: `${item.msg}`,
          dateTime: getCurrentTime(),
          id: Utils.generateSnowId(),
        });
      } else
        if (item && item.number) {
          createLogArray.push({
            log: `${item.name} 创建成功， 编号:${item.number}`,
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          });
        }
    });
    warpperSetLog(() => {
      setLogData([...lastestLogData.current, ...createLogArray]);
    });

    // if (ItemCode.isFile(itemCode)) {
    //   return successInstances
    // } else {
    const successInstancesMap: any = {};
    console.log(successInstances, "successInstances");

    successInstances.result.forEach((item: any, index: number) => {
      if (item.code == 2000) {
        // tribon判断首先根据caizhiguige然后根据node_name
        // const rowKey = dealData[index].node_name
        successInstancesMap[`data${index}`] = item;
      }
    });

    return successInstancesMap
  }

  const upload2D = async () => {
    warpperSetLog(() => {
      setLogData([
        ...lastestLogData.current,
        {
          log: "设计原理图上传开始。。。",
          dateTime: getCurrentTime(),
          id: Utils.generateSnowId(),
        },
      ]);
    });
    dispatch(setLoading(true));
    setLogVisbile(true);
    console.log(file2D)
    console.log(material2D)


    const fileArry = [
      {
        name: file2D[0].name,
        data: new Blob([await readBinaryFile(file2D[0].path)]),
        source: "Local",
        isRemote: false,
      },
    ]
    const queryArr = (file2D[0].children || []).filter((item: any) => item.name.indexOf('.') != -1)

    for (let i = 0; i < queryArr.length; i++) {
      fileArry.push({
        name: queryArr[i].name,
        data: new Blob([await readBinaryFile(queryArr[i].path)]),
        source: "Local",
        isRemote: false,
      })
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            log: "加载原理图 " + queryArr[i].name + ` (${i + 1}/${queryArr.length})`,
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          },
        ]);
      });
    }

    console.log(fileArry, 'fileArry');


    // 首先创建所有的文件
    // 首先上传所有的文件预览图
    const nameFileUrlMap = await uploadFile(fileArry)
    // 创建文件实例
    const nameNumberMap: any = await create2DInstance({ itemCode: BasicsItemCode.file, nameFileUrlMap: nameFileUrlMap })

    // 创建文件结构
    const {
      result: { records: structureAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: '10002016',
    });
    const structureAttrsMap = Utils.transformArrayToMap(
      structureAttrs,
      "apicode",
      "id"
    );

    const fileArr = Object.values(nameNumberMap).map((item: any) => item.instanceId)
    console.log(fileArr, 'fileArr');

    const fileStructData = [
      {
        insId: fileArr[0],
        attrMap: {},
        children: (file2D[0].children || []).filter((item: any) => item.name.indexOf('.') != -1).map((item: any, index: number) => {
          return {
            insId: fileArr[index + 1],
            attrMap: {
              [structureAttrsMap['Qty']]: '1'
            }
          }
        }).filter((item: any) => item.insId)
      }
    ]

    console.log(fileStructData, 'fileStructData')
    API.batchCreateStructure({
      tenantId: sse.tenantId || "719",
      userId: user.id,
      itemCode: BasicsItemCode.file,
      tabCode: '10002016',
      instances: fileStructData,
    });

    // 创建物料
    const nameNumberMaterialMap: any = await create2DInstance({ itemCode: BasicsItemCode.material, nameFileUrlMap })
    // 绑定父级物料以及父级文件

    const {
      result: { records: structureMaterialAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.material,
      tabCode: '10002003',
    });
    const structureAttrsMaterialMap = Utils.transformArrayToMap(
      structureMaterialAttrs,
      "apicode",
      "id"
    );

    const matArr = Object.values(nameNumberMaterialMap).map((item: any) => item.instanceId)
    console.log(matArr, 'matArr');

    const materialStructData = [
      {
        insId: matArr[0],
        attrMap: {},
        children: material2D.map((item: any, index: number) => {
          return {
            insId: matArr[index + 1],
            attrMap: {
              [structureAttrsMaterialMap['Qty']]: String(item.Quantity),
              [structureAttrsMaterialMap['RefNumber']]: item.Designator
            }
          }
        })
      }
    ]
    console.log(materialStructData, 'materialStructData');
    API.batchCreateStructure({
      tenantId: sse.tenantId || "719",
      userId: user.id,
      itemCode: BasicsItemCode.material,
      tabCode: '10002003',
      instances: materialStructData,
    });


    const {
      result: { records: designTabAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.material,
      tabCode: "10002028",
    });

    const setVal = (row: any, col: any) => {
      if (col.apicode === "ID") {
        return fileArr[0];
      } else if (col.apicode === "CorrespondingVersion") {
        return "Draft";
      } else {
        return "";
      }
    };
    const dealParams = [{
      affectedInstanceIds: fileArr[0],
      id: matArr[0],
      itemCode: BasicsItemCode.material,
      tabCode: 10002028,
      tenantId: sse.tenantId || "719",
      userId: user.id,
      versionNumber: "Draft",
      rowList: [
        {
          insAttrs: designTabAttrs
            .filter((attr: any) => {
              return ["ID", "CorrespondingVersion", "From"].includes(attr.apicode);
            })
            .map((attr: any) => {
              return {
                apicode: attr.apicode,
                id: attr.id,
                valueType: attr.valueType,
                value: setVal({}, attr),
              };
            }),
        },
      ],
    }]
    API.bindFileAndMaterial({
      tenantId: sse.tenantId || "719",
      userId: user.id,
      saveVos: dealParams,
    }).then((res) => {
      warpperSetLog(() => {
        setLogData([
          ...lastestLogData.current,
          {
            log: "上传成功",
            dateTime: getCurrentTime(),
            id: Utils.generateSnowId(),
          },
        ]);
      });
      dispatch(setLoading(false));
    });
  }

  const updateCadAttr = async (updateData: any, nameNumberMap?: any) => {
    watchCancelFn && watchCancelFn()()
    const [cadFileMap, cadIdMap] = await getCadFileMapRule();

    // cad属性映射文件属性
    const attrsMap = await getCadAttrMapRule("prt", cadIdMap, settingType.PlmToCad);
    // cad属性映射文件属性
    const asmAttrsMap = await getCadAttrMapRule("asm", cadIdMap, settingType.PlmToCad);

    const fileColumnsListCodeMap = Utils.transformArrayToMap(fileColumn.filter((item: any) => item?.formitem?.type === 'Select'), 'dataIndex', 'formitem')

    //判断需要修改的文件
    const needUpdateFileList = updateData.filter((item: any) => {
      const cadAttrsMap = item.model_type === 'assembly' ? asmAttrsMap : attrsMap
      return Object.keys(cadAttrsMap).length && !judgeStandard(item)
    })

    if (!needUpdateFileList.length) {
      return
    }

    // 修改文件编号
    const pluginUpdateNumber = needUpdateFileList.map((item: any) => {
      const cadAttrsMap = item.model_type === 'assembly' ? asmAttrsMap : attrsMap
      console.log(cadAttrsMap, 'cadAttrsMap', nameNumberMap);

      return {
        product_name: item.node_name,
        extra: "属性设置",
        product_attrs: Object.keys(cadAttrsMap).map(attrname => {
          let actualValue = item[cadAttrsMap[attrname]]
          if (fileColumnsListCodeMap[cadAttrsMap[attrname]]) {
            const options = fileColumnsListCodeMap[cadAttrsMap[attrname]]?.props?.options || []
            actualValue = Utils.getLabelInOptions({
              value: item[cadAttrsMap[attrname]],
              options: options,
            })
          }
          if ((cadAttrsMap[attrname] === 'Number') && nameNumberMap) {
            actualValue = nameNumberMap[getRowKey(item)]?.number || ''
          }
          return {
            attr_name: attrname,
            attr_type: "string",
            attr_value: actualValue,
          }
        })
      };
    });
    ConfirmOpened.current = true
    mqttClient.publish({
      type: CommandConfig.setProductAttVal,
      attr_set: pluginUpdateNumber,
    });

    while (!updatingAttr.current) {
      console.log("重复监听属性修改", updatingAttr.current);
      await new Promise(resolve => setTimeout(resolve, 300)); // 等待300ms 再检查
    }
    updatingAttr.current = false
    // 在收到消息后继续执行后续代码
    console.log('收到 setProductAttVal 消息，继续执行后续代码');
  }

  const judgeAttachExistPromise = (item: any, format: string) => {
    return new Promise(async (resolve) => {
      // pdf step dwg drw
      const data_path = `${item.file_path.substring(0, item.file_path.lastIndexOf('.'))}.${format}`
      const existFile = await exists(data_path)
      if (existFile) {
        item[`${format}_path`] = data_path
        resolve(data_path)
      } else {
        const data_path = `${item.file_path.substring(0, item.file_path.lastIndexOf('.'))}.${format.toUpperCase()}`
        const existUpperCaseFile = await exists(data_path)
        if (existUpperCaseFile) {
          item[`${format}_path`] = data_path
          resolve(data_path)
        } else {
          item[`${format}_path`] = ""
          resolve("")
        }
      }
    })
  }

  const updoadAttachMent = async ({ filterCenterData, nameNumberMap }: { filterCenterData: Record<string, any>[], nameNumberMap?: Record<string, any> }) => {
    
    const defaultSetting = await getDefaultSetting()
    const partSaveas = defaultSetting?.partSaveas || []
    if(partSaveas.length) {
      // 先判断是否有需要生成的文件
      mqttClient.publish({
        type: CommandConfig.getCurrentBOM,
        input_data: {
          "info": ["proximate"],
          'transformer': [...partSaveas, 'image']
        }
      });

      while (!generateExtraFile.current) {
        console.log("重复监听属性修改", generateExtraFile.current);
        await new Promise(resolve => setTimeout(resolve, 300)); // 等待1000ms 再检查
      }

      generateExtraFile.current = false
    }

    const {
      result: { records: tabAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002008",
    });

    const FileArray: Promise<any>[] = []

    const needUploadFormat = defaultSetting?.partUploads || []

    // 遍历所有的对象，判断下面是否有对应的文件，然后放入对象中
    const executePromiseArr: any = []
    filterCenterData.forEach((item: any) => {
      needUploadFormat.forEach((v:any) => executePromiseArr.push(judgeAttachExistPromise(item, v)))
    })
    await Promise.all(executePromiseArr)

    for (let item of filterCenterData) {
      needUploadFormat.forEach((v:any) => {
        if (item[`${v}_path`]) {
          FileArray.push(
            new Promise(async (resolve, reject) => {
              const arrayBufferData = await readBinaryFile(item[`${v}_path`]);
              resolve({
                name: `${item[`${v}_path`].substring(
                  item[`${v}_path`].lastIndexOf("\\") + 1
                )}`,
                data: new Blob([arrayBufferData]),
                source: "Local",
                isRemote: false,
                dataType: v,
              });
            })
          );
        }
      })
    }
    const fileItems = await Promise.all([...FileArray]);
    const nameFileUrlMap = await uploadFile(fileItems);

    const setAttachmentValue = (
      item: any,
      apicode: string,
      type: any
    ) => {
      const nameWidthFormat = `${item[`${type}_path`].substring(
        item[`${type}_path`].lastIndexOf("\\") + 1
      )}`;
      if (apicode === "ID") {
        return nameWidthFormat;
      } else if (apicode === "FileId") {
        return nameFileUrlMap[nameWidthFormat].id;
      } else if (apicode === "OnlineEditingStatus") {
        return "1";
      } else if (apicode === "OldFileUrl") {
        return `/plm/files${nameFileUrlMap[nameWidthFormat]?.response.uploadURL.split(
          "/plm/files"
        )[1]
          }`;
      } else if (apicode === "FileName") {
        return nameWidthFormat;
      } else if (apicode === "FileSize") {
        return `${nameFileUrlMap[nameWidthFormat].size}`;
      } else if (apicode === "FileFormat") {
        return `${nameFileUrlMap[nameWidthFormat].extension}`;
      } else if (apicode === "FileUrl") {
        return `/plm/files${nameFileUrlMap[nameWidthFormat]?.response.uploadURL.split(
          "/plm/files"
        )[1]
          }`;
      } else {
        return "";
      }
    };
    const addAttachmentParams: any = [];

    filterCenterData.forEach((item: any) => {
      needUploadFormat.forEach((v:any) => {
        if (item[`${v}_path`]) {
          addAttachmentParams.push({
            instanceId: nameNumberMap ? nameNumberMap[getRowKey(item)]?.instanceId : item.insId,
            itemCode: BasicsItemCode.file,
            tabCode: "10002008",
            versionNumber: "Draft",
            versionOrder: "1",
            insAttrs: tabAttrs.map((attr: any) => {
              return {
                apicode: attr.apicode,
                id: attr.id,
                title: attr.name,
                valueType: attr.valueType,
                value: setAttachmentValue(item, attr.apicode, v),
              };
            }),
          });
        }
      })
    });


    if (addAttachmentParams.length) {
      console.log(addAttachmentParams, 'addAttachmentParams');

      const attchmentResult = await API.addInstanceAttributeAttachment({
        tenantId: sse.tenantId || "719",
        instanceAttrVos: addAttachmentParams,
      });
      console.log(attchmentResult, addAttachmentParams, "FileAttachment");
    }
  }

  const getDefaultSetting = async() => {
    const homeDirPath = await homeDir();
    const existSetting = await exists(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`)
    const defaultSettingStr = existSetting ? await readTextFile(
      `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`
    ) : '';

    const defaultSetting = defaultSettingStr ? JSON.parse(defaultSettingStr) : {}
    return defaultSetting
  }


  const handleClick = async (name: string) => {
    if (name === "upload") {
      const productName = Utils.getLabelInOptions({
        value: selectProduct,
        options: productOptions,
      })
      confirm(`请确认是否上传至${productName}?`, { title: '提示', type: 'warning' }).then(async res => {
        if (!res) {
          return
        } else {
          if (!isNot2D(mqttClient.publishTopic)) {
            upload2D()
            return
          }
          warpperSetLog(() => {
            setLogData([
              ...lastestLogData.current,
              {
                log: "模型上传开始。。。",
                dateTime: getCurrentTime(),
                id: Utils.generateSnowId(),
              },
            ]);
          });
          // tribon重新写接口，首先需要创建文件，再然后需要创建物料
          if (mqttClient.publishTopic === 'Tribon') {
            setLogVisbile(true);
            dispatch(setLoading(true));
            // 创建实例
            const nameNumberMap: any = await createInstance({
              itemCode: BasicsItemCode.material,
            });

            if (!Object.keys(nameNumberMap).length) {
              dispatch(setLoading(false))
              return
            }

            await createStructure({
              nameNumberMap,
              itemCode: BasicsItemCode.material,
              tabCode: "10002003",
            });
            dispatch(setLoading(false))

            // const pdfData = [...rightData[0].children, ...rightData[1].children, ...rightData[2].children, ...rightData[3].children]
            // const FileArray = []
            // for (let i = 0; i < pdfData.length; i++) {
            //   FileArray.push(
            //     new Promise(async (resolve, reject) => {
            //       const arrayBufferData = await readBinaryFile(pdfData[i].path);
            //       resolve({
            //         name: pdfData[i].name,
            //         data: new Blob([arrayBufferData]),
            //         source: "Local",
            //         isRemote: false,
            //         type: pdfData[i].type,
            //       });
            //     })
            //   );
            // }


            // Promise.all(FileArray).then(async (res) => {
            //   console.log(res, 'FileArray')

            //   const nameFileUrlMap = await uploadFile(res)

            //   console.log(nameFileUrlMap, 'nameFileUrlMap')
            //   // 根据所选的产品去查询第一个型谱的id
            //   const spectrumReturnV: any = await API.getProductSpectrumList(
            //     selectProduct
            //   );

            //   const fileTypeMap: any = {
            //     '扁钢手工下料图': '1725740831471722497',
            //     '扁钢数控下料图': '1725740752593641474',
            //     '曲型加工图': '1725740960031334402',
            //     '型材下料图': '1725741029036023809',
            //     '组立装配图': '1725741077094359042'
            //   }
            //   const Category = '1459426710323851265'

            //   const spectrum = spectrumReturnV.result[0].id;

            //   const setVal = (row: any, col: any) => {
            //     if (col.apicode === "ProductModel") {
            //       return spectrum;
            //     } else if (col.apicode === "Product") {
            //       return selectProduct;
            //     }
            //     else if (col.apicode === "FileUrl") {
            //       return `/plm/files${(nameFileUrlMap[
            //         row.name
            //       ]).response.uploadURL.split("/plm/files")[1]
            //         }?name=${row.name}&size=10020&extension=pdf`;
            //     }
            //     else if (col.apicode === "Thumbnail") {
            //       return "";
            //     } else if (col.apicode === "FileFormat") {
            //       return 'pdf';
            //     } else if (col.apicode === "FileSize") {
            //       return '10020';
            //     } else if (col.apicode === "Category") {
            //       return fileTypeMap[row.type] || Category;
            //     } else if (col.apicode === "Description") {
            //       return row.name.split('.')[0];
            //     } else {
            //       return "";
            //     }
            //   };

            //   const dealData = res
            //     .map((item: any, index) => {
            //       return {
            //         fileIndex: index,
            //         itemCode: '10001006',
            //         objectId: fileTypeMap[item.type] || Category,
            //         workspaceId: selectProduct,
            //         node_name: item.name,
            //         file_path: item.path,
            //         tenantId: sse.tenantId || "719",
            //         verifyCode: "200",
            //         user: user.id,
            //         insAttrs: (Attrs)
            //           .filter((item) => item.status)
            //           .map((v) => {
            //             return {
            //               ...v,
            //               value: setVal(item, v),
            //             };
            //           }),
            //       };
            //     });



            //   console.log(dealData, "创建参数");
            //   const successInstances: any = await API.createInstances(dealData);
            //   console.log(successInstances, "创建返回");

            //   const createLogArray: logItemType[] = [];
            //   successInstances.result.forEach((item: any) => {
            //     if (item && item.name) {
            //       createLogArray.push({
            //         log: `${item.name} 创建成功， 编号:${item.number}`,
            //         dateTime: getCurrentTime(),
            //         id: Utils.generateSnowId(),
            //       });
            //     }
            //   });
            //   dispatch(setLoading(false))
            //   setMaterialCenterData(materialCenterData)

            //   warpperSetLog(() => {
            //     setLogData([...lastestLogData.current, ...createLogArray]);
            //   });

            // })
            return
          }

          setLogVisbile(true);
          dispatch(setLoading(true));

          // 创建实例
          const nameNumberMap: any = await createInstance({
            itemCode: BasicsItemCode.file,
          });

          const FileArray = [];

          const filterCenterData = centerData
            .filter((item) => item.file.onChain.flag != "exist" && nameNumberMap[getRowKey(item)]?.number)

          console.log(nameNumberMap, "nameNumberMapnameNumberMap");
          // // 批量创建文件结构
          createStructure({
            nameNumberMap,
            itemCode: BasicsItemCode.file,
            tabCode: "10002016",
          });
          // const nameThumbMap = await uploadFile(FileThumbArray)
          if (mqttClient.publishTopic != 'Tribon') {
            await updateCadAttr(filterCenterData, nameNumberMap)
            for (let item of filterCenterData) {
              if (item.file_path && (mqttClient.publishTopic != 'Tribon')) {
                FileArray.push(
                  new Promise(async (resolve, reject) => {
                    const arrayBufferData = await readBinaryFile(item.file_path);
                    resolve({
                      name: getFileNameWithFormat(item),
                      data: new Blob([arrayBufferData]),
                      source: "Local",
                      isRemote: false,
                    });
                  })
                );
              }

              if (item.step_path) {
                FileArray.push(
                  new Promise(async (resolve, reject) => {
                    const arrayBufferData = await readBinaryFile(item.step_path);
                    resolve({
                      name: `${item.step_path.substring(
                        item.step_path.lastIndexOf("\\") + 1
                      )}`,
                      data: new Blob([arrayBufferData]),
                      source: "Local",
                      isRemote: false,
                      dataType: "step",
                    });
                  })
                );
              }
              if (item.drw_path) {
                FileArray.push(
                  new Promise(async (resolve, reject) => {
                    const arrayBufferData = await readBinaryFile(item.drw_path);
                    resolve({
                      name: `${item.drw_path.substring(
                        item.drw_path.lastIndexOf("\\") + 1
                      )}`,
                      data: new Blob([arrayBufferData]),
                      source: "Local",
                      isRemote: false,
                      dataType: "drw",
                    });
                  })
                );
              }
            }
            const fileItems = await Promise.all([...FileArray]);


            const nameFileUrlMap = await uploadFile(fileItems);

            // 批量上传附件
            await updoadAttachMent({ filterCenterData, nameNumberMap })


            let nameThumbMap: any = await invoke("get_icons", {
              req: filterCenterData.map(row => row.file_path)
            });

            const batchTansformPicPath = async ({ rows }: { rows: any[] }) => {
              let bmpMap: any = {}
              const btArray = rows.map(v => new Promise(async (resolve, reject) => {
                const blob = new Blob([await readBinaryFile(v.pic_path)])
                const pic_base64 = await blobToBase64(blob)
                bmpMap[v.file_path] = pic_base64
                resolve(pic_base64)
              }))

              await Promise.all(btArray)

              return bmpMap
            }

            const localImageMap = await batchTansformPicPath({ rows: filterCenterData.filter(row => row.pic_path) })

            Object.assign(nameThumbMap, localImageMap)


            //批量更新文件地址
            const updateInstances = filterCenterData
              .map((item) => {
                return {
                  id: nameNumberMap[getRowKey(item)]?.instanceId,
                  itemCode: BasicsItemCode.file,
                  tabCode: "10002001",
                  // rowId: nameNumberMap[getRowKey(item)]?.rowId,
                  insAttrs: Attrs.filter((attr) =>
                    (mqttClient.publishTopic !== 'Tribon' ? ["FileUrl", "Thumbnail"] : ['FileUrl']).includes(attr.apicode)
                  ).map((attr) => {
                    if (attr.apicode === "FileUrl") {
                      return {
                        ...attr,
                        value: mqttClient.publishTopic !== 'Tribon' ? `/plm/files${nameFileUrlMap[
                          getFileNameWithFormat(item)
                        ].response.uploadURL.split("/plm/files")[1]
                          }?name=${item.file.plugin?.fileNameWithFormat}&size=${item.file.plugin?.FileSize
                          }&extension=${item.file.plugin?.FileFormat}` : `/plm/files/ba8ad0cb2f63dbd396ab35de7e6738cb+528d612f-580e-44d5-9510-c11630179a5c?name=${item.file.plugin?.fileNameWithFormat}&size=10247&extension=pdf`,
                      };
                    } else {
                      return {
                        ...attr,
                        value: `data:image/png;base64,${nameThumbMap[item.file_path]}`,
                      };
                    }
                  }),
                  tenantId: sse.tenantId || "719",
                };
              });
            console.log(updateInstances, 'updateInstances');

            if (updateInstances.length) {
              await API.batchUpdate({
                instances: updateInstances,
                tenantId: sse.tenantId || "719",
                userId: user.id,
              });
              warpperSetLog(() => {
                setLogData([
                  ...lastestLogData.current,
                  {
                    log: "批量更新模型地址成功！",
                    dateTime: getCurrentTime(),
                    id: Utils.generateSnowId(),
                  },
                ]);
              });
            }

            warpperSetLog(() => {
              setLogData([
                ...lastestLogData.current,
                {
                  log: "上传成功！",
                  dateTime: getCurrentTime(),
                  id: Utils.generateSnowId(),
                },
              ]);
            });
          }
          dispatch(setLoading(true));
          mqttClient.publish({
            type: CommandConfig.getCurrentBOM,
            input_data: {
              "info": ["proximate"],
              'transformer': ['image']
            }
          });
        }
      })

    } else if (name === "log") {
      setLogVisbile(true);
    } else if (name === "refresh") {
      dispatch(setLoading(true));
      mqttClient.publish({
        type: CommandConfig.getCurrentBOM,
        input_data: {
          "info": ["proximate"],
          'transformer': ['image']
        }
      });
    } else if (name === "allocatenumber") {
      const centerDataMap = groupBy(centerData, (item) => {
        return item.Category;
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
    } else if (name === "logout") {
      mqttClient.publish({
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
    } else if (name === "update") {
      if (selectNode) {
        const row = { ...selectNode, ...selectNode.file.onChain };
        if (!row.insId) {
          message.warning('当前文件还未上传')
          return
        }
        try {
          await updateData({ row: row });
          if (selectNode.material.onChain.insId) {
            const materialRow = { ...selectNode, ...selectNode.material.onChain };
            await updateData({ row: materialRow, isMaterial: true });
          }
          dispatch(setLoading(true));
          mqttClient.publish({
            type: CommandConfig.getCurrentBOM,
            input_data: {
              "info": ["proximate"],
              'transformer': ['image']
            }
          });
        } catch (error) {
          dispatch(setLoading(false));
        }
      }
    } else if (name === "checkout") {
      if (selectNode) {
        const row = { ...selectNode, ...selectNode.file.onChain };
        checkoutData({ row: row });
      } else {
        message.error("请选择目标节点");
      }
    } else if (name === "cancelcheckout") {
      if (selectNode) {
        const row = { ...selectNode, ...selectNode.file.onChain };
        cancelCheckoutData({ row: row });
      } else {
        message.error("请选择目标节点");
      }
    } else if (name === "checkin") {
      if (selectNode) {
        const data = centerData.find(item => getRowKey(item) == getRowKey(selectNode))
        // const row = { ...selectNode, ...selectNode.file.onChain };
        dispatch(setLoading(true));
        checkInData({ row: data });
      } else {
        message.error("请选择目标节点");
      }
    }
  };

  const generalDealAttrs = (attrs: any[], listCodeMap: any) => {
    return attrs
      .filter(
        (item) =>
          (item.readonly == "0" ||
            item.readonly == "1" ||
            item.apicode === "FileSize" ||
            item.apicode === "Category" ||
            item.apicode === "FileFormat" ||
            item.apicode === "CheckOutUser" ||
            item.apicode === "CheckOutDate") &&
          item.status &&
          item.valueType != "6" &&
          item.valueType != "7" &&
          item.valueType != "8" &&
          item.valueType != "9" &&
          item.valueType != "10" &&
          item.valueType != "11" &&
          item.valueType != "12" &&
          item.valueType != "13" &&
          item.valueType != "14" &&
          item.valueType != "3" &&
          item.listType !== '2' &&
          item.tabCode != '10002002'
      )
      .map((item) => {
        const formitem = {
          type: formItemMap[item.valueType],
          props: {
            ...Utils.generateFormItemProps(item, listCodeMap),
            disabled:
              item.apicode === "Category" ||
              item.apicode === "FileSize" ||
              item.apicode === "FileFormat" ||
              item.apicode === "CheckOutUser" ||
              item.apicode === "CheckOutDate",
          },
        };
        const renderData: any = {
          [item.apicode]: (text: string, record: any) => {
            const typeInstance = ItemCode.isFile(attrs[0].itemCode)
              ? "file"
              : "material";
            const pluginValue = record[typeInstance].plugin[item.apicode];
            const onChainValue = record[typeInstance].onChain[item.apicode];
            // 判断设计工具给的值如果不等于plm系统给的值，则上面显示红色，下面红线杠
            if (
              pluginValue != onChainValue &&
              item.apicode != "Category" &&
              item.apicode != "CheckOutUser" &&
              item.apicode != "CheckOutDate"
            ) {
              // 如果判断设计工具的值为空，onChain有值则显示一条横杠线
              if ((pluginValue == '') && onChainValue && readPermission(onChainValue)) {
                return (
                  <div className="text_line">
                    {renderIsPlmMosaic({
                      value: onChainValue,
                      children: Utils.renderReadonlyItem({
                        apicode: item.apicode,
                        formitem: formitem,
                        value: onChainValue,
                      })
                    })}
                  </div>
                );
              }
              // 如果判断设计工具的值有值，onChain没有值，则显示红色
              if (pluginValue && !onChainValue) {
                return (
                  <div className="text-red-500">
                    {renderIsPlmMosaic({
                      value: pluginValue,
                      children: Utils.renderReadonlyItem({
                        apicode: item.apicode,
                        formitem: formitem,
                        value: pluginValue,
                      })
                    })}
                  </div>
                );
              }

              if (pluginValue && onChainValue && readPermission(onChainValue) && pluginValue != onChainValue) {
                return (
                  <div>
                    <div className="text-red-500">
                      {renderIsPlmMosaic({
                        value: pluginValue,
                        children: Utils.renderReadonlyItem({
                          apicode: item.apicode,
                          formitem: formitem,
                          value: pluginValue,
                        })
                      })}
                    </div>
                    <div className="text_line">
                      {renderIsPlmMosaic({
                        value: onChainValue,
                        children: Utils.renderReadonlyItem({
                          apicode: item.apicode,
                          formitem: formitem,
                          value: onChainValue,
                        })
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div>
                  {renderIsPlmMosaic({
                    value: onChainValue,
                    children: Utils.renderReadonlyItem({
                      apicode: item.apicode,
                      formitem: formitem,
                      value: onChainValue,
                    })
                  })}
                </div>
              );

            } else {
              return (
                <div>
                  {renderIsPlmMosaic({
                    value: onChainValue,
                    children: Utils.renderReadonlyItem({
                      apicode: item.apicode,
                      formitem: formitem,
                      value: onChainValue,
                    })
                  })}
                </div>
              );
            }
          },
          FileSize: (text: string, record: any) => {
            return Utils.converBytes(Number(record.file.plugin.FileSize));
          },
          FileFormat: (text: string, record: any) => {
            return record.file.plugin.FileFormat;
          },
        };
        const specificRender = () => {
          return renderData[item.apicode];
        };
        return {
          title: item.name,
          dataIndex: item.apicode,
          editable: true,
          width: 150,
          formitem: formitem,
          // search: {
          //   type: formItemMap[item.valueType],
          //   props: Utils.generateFormItemProps(item, listCodeMap),
          // },
          render: specificRender(),
          attr: item,
        };
      });
  };

  const [materialColumn, setMaterialColumn] = useState<any[]>([]);
  const [fileColumn, setFileColumn] = useState<any[]>([]);

  const getColumns = async (attrs: any) => {
    const codeList = attrs
      .filter((item: any) => item.listCode)
      .map((item: any) => {
        return {
          code: item.listCode,
          where: "",
        };
      });
    let columns: any = []
    if (codeList.length) {
      const resData: any = await API.getList(codeList)
      const map: any = {};
      const result = resData.result || [];
      result.forEach((item: { listItems: any; code: string }) => {
        map[item.code] = Utils.adaptListItems(item.listItems) || [];
      });
      columns = generalDealAttrs(attrs, map) || []
    } else {
      columns = generalDealAttrs(attrs, {}) || []
    }
    return columns
  }

  // 处理物料列头
  // useAsyncEffect(async () => {
  //   const codeList = materialAttrs
  //     .filter((item) => item.listCode)
  //     .map((item) => {
  //       return {
  //         code: item.listCode,
  //         where: "",
  //       };
  //     });
  //   if (codeList.length) {
  //     API.getList(codeList).then((res: any) => {
  //       const map: any = {};
  //       const result = res.result || [];
  //       result.forEach((item: { listItems: any; code: string }) => {
  //         map[item.code] = Utils.adaptListItems(item.listItems) || [];
  //       });
  //       setMaterialColumn(generalDealAttrs(materialAttrs, map) || []);
  //     });
  //   } else {
  //     setMaterialColumn(generalDealAttrs(materialAttrs, {}) || []);
  //   }
  // }, [materialAttrs]);

  // // 处理文件列头
  // useAsyncEffect(async () => {
  //   // alternatively, load a remote URL:
  //   const codeList = Attrs.filter((item) => item.listCode).map((item) => {
  //     return {
  //       code: item.listCode,
  //       where: "",
  //     };
  //   });
  //   if (codeList.length) {
  //     API.getList(codeList).then((res: any) => {
  //       const map: any = {};
  //       const result = res.result || [];
  //       result.forEach((item: { listItems: any; code: string }) => {
  //         map[item.code] = Utils.adaptListItems(item.listItems) || [];
  //       });
  //       setFileColumn(generalDealAttrs(Attrs, map) || []);
  //     });
  //   } else {
  //     setFileColumn(generalDealAttrs(Attrs, {}) || []);
  //   }
  // }, [Attrs]);

  // const materialCenterData: any = useMemo(() => {
  //   return centerData.map((item) => {
  //     return {
  //       ...item,
  //       ...item.material.onChain
  //     };
  //   });
  // }, [centerData]);

  const items: TabsProps["items"] = [
    {
      key: "file",
      label: `文件清单`,
      children: (
        <Fragment>
          <div className="ml-1">
            <PlmTabToolBar
              onClick={(item) => {
                if (item.tag === 'update') {
                  if (fileSelectRows.find(item => item.flag !== 'exist')) {
                    message.warning("选择的行中有还未上传的对象")
                  } else {
                    try {
                      batchUpdateData({ selectRows: fileSelectRows })
                    } catch (error) {
                      dispatch(setLoading(false))
                    }
                  }
                } else if (item.tag === "checkout") {
                  if (fileSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  fileSelectRows.length ?
                    checkoutData({ row: fileSelectRows[0] }) : message.error("请选择操作对象");
                } else if (item.tag === "cancelCheckout") {
                  if (fileSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  fileSelectRows.length ?
                    cancelCheckoutData({ row: fileSelectRows[0] }) : message.error("请选择操作对象");
                } else if (item.tag === "checkIn") {
                  if (fileSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  fileSelectRows.length ?
                    checkInData({ row: fileSelectRows[0] }) : message.error("请选择操作对象");
                } else if (item.tag === "fillDown") {
                  if (selectedCellLatest.current?.record) {
                    let findSelect = false;
                    centerData.forEach((item) => {
                      if (
                        getRowKey(selectedCellLatest.current?.record) !=
                        getRowKey(item)
                      ) {
                      } else {
                        findSelect = true;
                      }

                      if (findSelect) {
                        InstanceAttrsMap[getRowKey(item)].file.plugin[
                          selectedCellLatest.current?.dataIndex
                        ] =
                          selectedCellLatest.current?.record?.file?.plugin[
                          selectedCellLatest.current?.dataIndex
                          ];
                      }
                    });
                    setLeftData([...leftData]);
                  }
                } else if (item.tag === "fillUp") {
                  let findSelect = false;
                  for (
                    let index = 0;
                    index < centerData.length;
                    index++
                  ) {
                    const element = centerData[index];

                    if (
                      getRowKey(selectedCellLatest.current?.record) ==
                      getRowKey(element)
                    ) {
                      findSelect = true;
                    }

                    if (!findSelect) {
                      // if (
                      //   InstanceAttrsMap[getRowKey(element)].material.plugin[
                      //     selectedCellLatest.current?.dataIndex
                      //   ]
                      // ) {
                      //   return;
                      // }
                      InstanceAttrsMap[getRowKey(element)].file.plugin[
                        selectedCellLatest.current?.dataIndex
                      ] =
                        selectedCellLatest.current?.record?.file?.plugin[
                        selectedCellLatest.current?.dataIndex
                        ];
                    }
                  }
                  setLeftData([...leftData]);
                }
              }}
              list={[
                { name: "更新", icon: topupdate, tag: "update" },
                { name: "签出", icon: checkout, tag: "checkout" },
                {
                  name: "取消签出",
                  icon: cancelcheckin,
                  tag: "cancelCheckout",
                },
                { name: "签入", icon: checkin, tag: "checkIn" },
                { name: "向上填充", icon: fillup, tag: "fillUp" },
                { name: "向下填充", icon: filldown, tag: "fillDown" },
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
                selectedRowKeys: fileSelectRows.length
                  ? fileSelectRows.map((item) => item?.id)
                  : [],
                onChange: (selectRowKeys, selectRows) => {
                  setFileSelectRows(selectRows);
                },
              }}
              canselectcell
              onSelectCell={({ dataIndex, record }) => {
                console.log(dataIndex, record, "record");
                setSelectedCell({
                  dataIndex: dataIndex,
                  record: record,
                });
              }}
              onSubmit={(row, column) => {
                const loop = (data: any) => {
                  for (let i = 0; i < data.length; i++) {
                    if (data[i].node_name == row.node_name) {
                      InstanceAttrsMap[getRowKey(data[i])].file.plugin[
                        column["dataIndex"]
                      ] = row[column["dataIndex"]];
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
                  title: (
                    <div className="w-full flex justify-center">
                      <PlmIcon name="listcheck"></PlmIcon>
                    </div>
                  ),
                  dataIndex: "flag",
                  width: 40,
                  fixed: true,
                  // sort: true,
                  render: (text: string, record: any) => {
                    if (record.flag === "exist") {
                      return <></>;
                    }
                    return (
                      <div className="w-full flex justify-center">
                        <img width={12} src={plusImg} alt="" />
                      </div>
                    );
                  },
                },
                {
                  title: (
                    <div className="flex items-center justify-center">
                      <PlmIcon name="listcheckout"></PlmIcon>
                    </div>
                  ),
                  dataIndex: "checkOut",
                  // sorter: true,
                  fixed: true,
                  width: 40,
                  // sort: true,
                  render: (text: string, record: any) => {
                    if (
                      record.file.onChain.checkOut &&
                      record.file.onChain.Revision != "1"
                    ) {
                      return (
                        <div className="flex items-center justify-center">
                          <div
                            className="h-1 w-1 bg-primary"
                            style={{ borderRadius: "50%" }}
                          ></div>
                        </div>
                      );
                    } else {
                      return <></>;
                    }
                  },
                },
                // {
                //   title: (
                //     <div className="flex items-center justify-center">
                //       <PlmIcon name="listphoto"></PlmIcon>
                //     </div>
                //   ),
                //   dataIndex: "thumbnail",
                //   // sorter: true,
                //   width: 40,
                //   fixed: true,
                //   sort: true,
                //   render: (text: string, record: any) => {
                //     return (
                //       <div className="flex items-center justify-center">
                //         <Image
                //           src={record.file.plugin.thumbnail}
                //           width={32}
                //           preview={false}
                //         ></Image>
                //       </div>
                //     );
                //   },
                // },
                {
                  title: "文件名称",
                  dataIndex: "node_name",
                  // search: {
                  //   type: "Input",
                  // },
                  fixed: true,
                  // sorter: true,
                  width: 100,
                  render: (text: string, record: any) => {
                    return (
                      <div className="text-ellipsis w-full overflow-hidden">
                        {record.file.plugin.Description}
                      </div>
                    );
                  },
                },
                {
                  title: "编号",
                  dataIndex: "Number",
                  // search: {
                  //   type: "Input",
                  // },
                  width: 100,
                  editable: true,
                  formitem: {
                    type: 'Input',
                    props: {}
                  },
                  // sorter: true,
                  render: (text: string, record: any) => {
                    if (record.flag !== 'exist') {
                      return <>{text}</>
                    }
                    return (
                      <a
                        onClick={async () => {
                          if (record.flag === "exist") {
                            await open(
                              `http://${network}/front/product/${selectProduct}/product-data/instance/${record.file.onChain.insId}/BasicAttrs`
                            );
                          }
                        }}
                      >
                        {text}
                      </a>
                    );
                  },
                },
                {
                  title: "版次",
                  dataIndex: "revision",
                  // sorter: true,
                  width: 100,
                  render: (text: string, record: any) => {
                    if (record.flag == "exist") {
                      return record.Revision;
                    } else {
                      return <span>1</span>;
                    }
                  },
                },
                ...fileColumn,
              ]}
              selectedCell={selectedCell}
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
              onClick={async (item) => {
                if (item.tag === 'update') {
                  if (materialSelectRows.find((item: any) => item.flag !== 'exist')) {
                    message.warning("选择的行中有还未上传的对象")
                  } else {
                    batchUpdateData({ selectRows: materialSelectRows, isMaterial: true })
                  }
                } else if (item.tag === "checkout") {
                  if (materialSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  materialSelectRows.length
                    ? checkoutData({ row: materialSelectRows[0], isMaterial: true })
                    : message.error("请选择目标节点");
                } else if (item.tag === "cancelCheckout") {
                  if (materialSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  materialSelectRows.length
                    ? cancelCheckoutData({ row: materialSelectRows[0], isMaterial: true })
                    : message.error("请选择目标节点");
                } else if (item.tag === "checkIn") {
                  if (materialSelectRows.length != 1) {
                    message.warning("请勾选单个对象！")
                    return
                  }
                  materialSelectRows.length
                    ? checkInData({ row: materialSelectRows[0], isMaterial: true })
                    : message.error("请选择目标节点");
                } else if (item.tag === "fillDown") {
                  if (selectedCellLatest.current?.record) {
                    let findSelect = false;
                    materialCenterData.forEach((item) => {
                      if (
                        getRowKey(selectedCellLatest.current?.record) !=
                        getRowKey(item)
                      ) {
                      } else {
                        findSelect = true;
                      }

                      if (findSelect) {
                        if (!InstanceAttrsMap[getRowKey(item)].material.plugin[
                          selectedCellLatest.current?.dataIndex
                        ]) {
                          InstanceAttrsMap[getRowKey(item)].material.plugin[
                            selectedCellLatest.current?.dataIndex
                          ] =
                            selectedCellLatest.current?.record?.material?.plugin[
                            selectedCellLatest.current?.dataIndex
                            ];
                        }

                      }
                    });
                    setLeftData([...leftData]);
                  }
                } else if (item.tag === "fillUp") {
                  let findSelect = false;
                  for (
                    let index = 0;
                    index < materialCenterData.length;
                    index++
                  ) {
                    const element = materialCenterData[index];

                    if (
                      getRowKey(selectedCellLatest.current?.record) ==
                      getRowKey(element)
                    ) {
                      findSelect = true;
                    }

                    if (!findSelect) {
                      // if (
                      //   InstanceAttrsMap[getRowKey(element)].material.plugin[
                      //     selectedCellLatest.current?.dataIndex
                      //   ]
                      // ) {
                      //   return;
                      // }
                      if (!InstanceAttrsMap[getRowKey(element)].material.plugin[
                        selectedCellLatest.current?.dataIndex
                      ]) {
                        InstanceAttrsMap[getRowKey(element)].material.plugin[
                          selectedCellLatest.current?.dataIndex
                        ] =
                          selectedCellLatest.current?.record?.material?.plugin[
                          selectedCellLatest.current?.dataIndex
                          ];
                      }

                    }
                  }
                  setLeftData([...leftData]);
                } else if (item.tag === "createBom") {
                  // dispatch(setLoading(true));
                  setLogVisbile(true)
                  // 增加判断，所有的必填校验

                  const requiredColumns = materialColumn.filter((item: any) => {
                    return item.attr?.required && item.attr?.dataFrom == "0";
                  });

                  console.log(requiredColumns, "requiredColumns");

                  let requiredMsgList: Record<string, any>[] = [];
                  if (!(materialCenterData || []).find(item => item.flag !== 'exist')) {
                    // message.warning("没有需要创建的物料")
                    await dealCurrentBom(designData);
                    await createStructure({
                      itemCode: BasicsItemCode.material,
                      tabCode: "10002003",
                    });
                    return
                  }
                  materialCenterData.forEach((item) => {
                    requiredColumns.forEach((childItem: any) => {
                      if (!item[childItem.dataIndex]) {
                        requiredMsgList.push(childItem);
                      }
                    });
                  });

                  console.log(requiredMsgList, "requiredMsgList");

                  if (requiredMsgList.length) {
                    message.warning(
                      `请填写必填项：${[
                        ...new Set(
                          requiredMsgList.map((item) => {
                            return item.attr?.name;
                          })
                        ),
                      ]}`
                    );
                    setLogVisbile(false)
                    setLogData([])
                    return false;
                  }
                  try {
                    const successInstances = await createInstance({
                      itemCode: BasicsItemCode.material,
                    });

                    console.log(successInstances, 'successInstancessuccessInstances')

                    if (!Object.keys(successInstances).length) {
                      dispatch(setLoading(false))
                      return
                    }
                    const {
                      result: { records: designTabAttrs },
                    }: any = await API.getInstanceAttrs({
                      itemCode: BasicsItemCode.material,
                      tabCode: "10002028",
                    });

                    const setVal = (row: any, col: any) => {
                      if (col.apicode === "ID") {
                        return row.file.onChain.insId;
                      } else if (col.apicode === "CorrespondingVersion") {
                        return row.file.onChain.Version || "";
                      } else {
                        return "";
                      }
                    };
                    const dealParams = Object.keys(successInstances).map(
                      (item) => {
                        return {
                          affectedInstanceIds:
                            InstanceAttrsMap[item].file.onChain.insId,
                          id: successInstances[item].instanceId,
                          itemCode: BasicsItemCode.material,
                          tabCode: 10002028,
                          tenantId: sse.tenantId || "719",
                          userId: user.id,
                          versionNumber: "Draft",
                          rowList: [
                            {
                              insAttrs: designTabAttrs
                                .filter((attr: any) => {
                                  return ["ID", "CorrespondingVersion", "From"].includes(attr.apicode);
                                })
                                .map((attr: any) => {
                                  return {
                                    apicode: attr.apicode,
                                    id: attr.id,
                                    valueType: attr.valueType,
                                    value: setVal(InstanceAttrsMap[item], attr),
                                  };
                                }),
                            },
                          ],
                        };
                      }
                    );
                    API.bindFileAndMaterial({
                      tenantId: sse.tenantId || "719",
                      userId: user.id,
                      saveVos: dealParams,
                    }).then(async (res) => {
                      // // 批量创建Bom结构
                      await dealCurrentBom(designData);
                      await createStructure({
                        itemCode: BasicsItemCode.material,
                        tabCode: "10002003",
                      });
                      setLogVisbile(false)
                      setLogData([])
                      dispatch(setLoading(false))
                    });
                  } catch (error) {
                    setLogVisbile(false)
                    setLogData([])
                  }


                }
                //  else if (item.tag === "createBom") {
                //   dispatch(setLoading(true));

                //   dealCurrentBom(designData);
                // }
              }}
              list={[
                // { name: "创建编码", icon: encodedSvg, tag: "createIntance" },
                { name: "创建EBOM", icon: EBOM, tag: "createBom" },
                { name: "更新", icon: topupdate, tag: "update" },
                { name: "签出", icon: checkout, tag: "checkout" },
                {
                  name: "取消签出",
                  icon: cancelcheckin,
                  tag: "cancelCheckout",
                },
                { name: "签入", icon: checkin, tag: "checkIn" },
                { name: "向上填充", icon: fillup, tag: "fillUp" },
                { name: "向下填充", icon: filldown, tag: "fillDown" },
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
                fixed: true,
                selectedRowKeys: materialSelectRows.length
                  ? materialSelectRows.map((item: any) => item?.id)
                  : [],
                onChange: (selectRowKeys, selectRows) => {
                  setMaterialSelectRows(selectRows);
                },
              }}
              canselectcell
              onSelectCell={({ dataIndex, record }) => {
                setSelectedCell({
                  dataIndex: dataIndex,
                  record: record,
                });
              }}
              bordered={false}
              onSubmit={(row, column) => {
                const loop = (data: any) => {
                  for (let i = 0; i < data.length; i++) {
                    if (data[i].node_name == row.node_name) {
                      InstanceAttrsMap[getRowKey(data[i])].material.plugin[
                        column["dataIndex"]
                      ] = row[column["dataIndex"]];
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
                  title: (
                    <div className="w-full flex justify-center">
                      <PlmIcon name="listcheck"></PlmIcon>
                    </div>
                  ),
                  dataIndex: "flag",
                  width: 40,
                  fixed: true,
                  render: (text: string, record: any) => {
                    if (record.flag === "exist") {
                      if (record.material.onChain.isStandardPart) {
                        return (
                          <div className="w-full flex justify-center">
                            <img width={12} src={settingImg} alt="" />
                          </div>
                        );
                      }
                      return <></>;
                    }
                    return (
                      <div className="w-full flex justify-center">
                        <img width={12} src={plusImg} alt="" />
                      </div>
                    );
                  },
                },
                {
                  title: (
                    <div className="flex items-center justify-center">
                      <PlmIcon name="listcheckout"></PlmIcon>
                    </div>
                  ),
                  dataIndex: "checkOut",
                  // sorter: true,
                  width: 40,
                  fixed: true,
                  render: (text: string, record: any) => {
                    if (
                      record.material.onChain.checkOut &&
                      record.material.onChain.Revision != "1"
                    ) {
                      return (
                        <div className="flex items-center justify-center">
                          <div
                            className="h-1 w-1 bg-primary"
                            style={{ borderRadius: "50%" }}
                          ></div>
                        </div>
                      );
                    } else {
                      return <></>;
                    }
                  },
                },
                // {
                //   title: (
                //     <div className="flex items-center justify-center">
                //       <PlmIcon name="listphoto"></PlmIcon>
                //     </div>
                //   ),
                //   dataIndex: "thumbnail",
                //   // sorter: true,
                //   width: 40,
                //   fixed: true,
                //   render: (text: string, record: any) => {
                //     return (
                //       <div className="flex items-center justify-center">
                //         <Image
                //           src={record.file.plugin.thumbnail}
                //           width={32}
                //           preview={false}
                //         ></Image>
                //       </div>
                //     );
                //   },
                // },
                {
                  title: "文件名称",
                  dataIndex: "node_name",
                  fixed: true,
                  // search: {
                  //   type: "Input",
                  // },
                  width: 100,
                  // sorter: true,
                  render: (text: string, record: any) => {
                    return (
                      <div className="w-full overflow-hidden text-ellipsis">
                        {record.file.plugin.Description}
                      </div>
                    );
                  },
                },
                {
                  title: "编号",
                  dataIndex: "Number",
                  fixed: true,
                  // search: {
                  //   type: "Input",
                  // },
                  width: 100,
                  editable: true,
                  formitem: {
                    type: 'Input',
                    props: {}
                  },
                  // sorter: true,
                  render: (text: string, record: any) => {
                    if (record.flag === 'add') {
                      return <>{text}</>
                    }
                    return (
                      <a
                        onClick={async () => {
                          if (record.flag === "exist") {
                            await open(
                              `http://${network}/front/product/${selectProduct}/product-data/instance/${record.material.onChain.insId}/BasicAttrs`
                            );
                          }
                        }}
                      >
                        {text}
                      </a>
                    );
                  },
                },
                {
                  title: "版次",
                  dataIndex: "revision",
                  // sorter: true,
                  width: 100,
                  render: (text: string, record: any) => {
                    if (record.flag == "exist") {
                      return record.Revision;
                    } else {
                      return <span>1</span>;
                    }
                  },
                },
                ...materialColumn,
              ]}
              selectedCell={selectedCell}
            ></OnChainTable>
          ) : (
            <></>
          )}
        </Fragment>
      ),
    },
  ].filter(item => {
    if (mqttClient.publishTopic === 'Tribon') {
      return item.key != 'file'
    } else {
      return item
    }
  });

  // 下载上传日志
  const downFile = async (file?: any) => {
    const basePath = (await downloadDir()) + `/上传日志`;
    let selPath = await dialog.save({
      title: `保存文件: ${"上传日志"}`,
      defaultPath: basePath,
      filters: [
        {
          name: "上传日志",
          extensions: ["txt"],
        },
      ],
    });
    // 开始发送下载请求
    writeTextFile({
      contents: logData
        .map((item) => {
          return `${item.dateTime}---${item.log}`;
        })
        .join("\n") as any,
      path: `${selPath}`,
    })
      .then((res) => { })
      .catch((err) => { });
  };

  {/* 基本信息 */ }
  const BaseAttrInfo = <div
    className="bg-white border-outBorder w-full h-full pt-2.5 px-4 pb-5 flex flex-col overflow-auto border-t border-b border-r"
  // style={{ width: "478px" }}
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

  if (!isNot2D(mqttClient.publishTopic)) {
    return <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex flex-col overflow-hidden">
        <PlmToolBar onClick={handleClick}></PlmToolBar>
        <div className="flex-1 pt-2 gap-2 px-3.5">
          <div
            style={{
              background: "linear-gradient(180deg,#f1f1f1 0%, #cdcdcd 100%)",
            }}
            className="w-full h-6 text-xs flex items-center pl-2.5 bg px-1.5"
          >
            导入
          </div>
          <div className="flex px-3.5" style={{ height: '62px' }}>
            <div className="flex h-full items-center mr-10"><span className='text-xs'>文件路径：</span>
              <div className="flex gap-2">
                <Input
                  placeholder="请输入编号或描述"
                  // value={selectVal}
                  style={{ width: "360px" }}
                // onChange={(e) => {
                //   setSelectVal(e.target.value);
                // }}
                ></Input>
                <div className="w-7 h-7 cursor-pointer rounded-sm border-outBorder border flex items-center justify-center bg-white">
                  <PlmIcon
                    onClick={() => {
                      // setSelectedRows([...selectedRows]);
                    }}
                    name="search"
                  ></PlmIcon>
                </div>
              </div>
            </div>
            <div className="flex h-full items-center"><span className='text-xs'>业务类型：</span>
              <div className="flex gap-2">
                <Input
                  placeholder="请输入编号或描述"
                  // value={selectVal}
                  style={{ width: "360px" }}
                // onChange={(e) => {
                //   setSelectVal(e.target.value);
                // }}
                ></Input>
                <div className="w-7 h-7 cursor-pointer rounded-sm border-outBorder border flex items-center justify-center bg-white">
                  <PlmIcon
                    onClick={() => {
                      // setSelectedRows([...selectedRows]);
                    }}
                    name="search"
                  ></PlmIcon>
                </div>
              </div>
            </div>
          </div>
          <OnChainTable
            scroll={{ y: 84 }}
            dataSource={file2D}
            total={file2D.length}
            columns={[
              {
                title: "图标",
                dataIndex: "icon",
                // search: {
                //   type: "Input",
                // },
                fixed: true,
                sorter: true,
                width: 200,
                render: (text: string, record: any) => {
                  return (
                    <img
                      style={{ display: 'inline', marginLeft: '10px' }}
                      width={16}
                      src={
                        (record.children || []).length
                          ? pcbSvg
                          : docSvg
                      }
                      alt=""
                    />
                  );
                },
              },
              {
                title: "文件名称",
                dataIndex: "name",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 350,
              },
              {
                title: "文件位置",
                dataIndex: "path",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 350,
              },
              {
                title: "文件大小",
                dataIndex: "size",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 200,
                render: (text, record) => {
                  return Utils.converBytes(text)
                }
              },
              {
                title: "状态",
                dataIndex: "status",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 250,
              },
            ]}
            rowKey={'name'}
            expandable={{
              expandedRowKeys: expanded2DKeys,
              onExpandedRowsChange: (expandedKeys) => {
                setExpanded2DKeys(expandedKeys);
              },
            }}
            rowSelection={{
              columnWidth: 19,
              fixed: true,
              // selectedRowKeys: fileSelectRows.length
              //   ? fileSelectRows.map((item) => item?.id)
              //   : [],
              // onChange: (selectRowKeys, selectRows) => {
              //   setFileSelectRows([selectRows.pop()]);
              // },
            }}>

          </OnChainTable>
          <OnChainTable
            extraHeight={32}
            rowKey={'no'}
            dataSource={[{ Description: file2D[0]?.name, Comment: file2D[0]?.name, no: '0', DesignItemId: '0000', children: material2D }]}
            total={material2D.length + 1}
            expandable={{
              expandedRowKeys: ['0'],
            }}
            columns={[
              {
                title: "序号",
                dataIndex: "no",
                // search: {
                //   type: "Input",
                // },
                fixed: true,
                sorter: true,
                width: 200,
                render: (text: string, record: any) => {
                  return (
                    <span style={{ marginLeft: '10px' }}>
                      {text}
                    </span>
                  );
                },
              },
              {
                title: "物料DesignId",
                dataIndex: "DesignItemId",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 200,
              },
              {
                title: "状态",
                dataIndex: "file_name",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 250,
              },
              {
                title: "物料名称",
                dataIndex: "Comment",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 350,
              },

              {
                title: "位号",
                dataIndex: "Designator",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 200,
                // render: (text: string, record: any) => {
                //   return (
                //     <div className="text-ellipsis w-full overflow-hidden">
                //       {record.file.plugin.Description}
                //     </div>
                //   );
                // },
              },
              {
                title: "数量",
                dataIndex: "Quantity",
                search: {
                  type: "Input",
                },
                sorter: true,
                width: 150,
                // render: (text: string, record: any) => {
                //   return (
                //     <div className="text-ellipsis w-full overflow-hidden">
                //       {record.file.plugin.Description}
                //     </div>
                //   );
                // },
              },
            ]
            }
            rowSelection={{
              columnWidth: 19,
              fixed: true,
              // selectedRowKeys: fileSelectRows.length
              //   ? fileSelectRows.map((item) => item?.id)
              //   : [],
              // onChange: (selectRowKeys, selectRows) => {
              //   setFileSelectRows([selectRows.pop()]);
              // },
            }}
          >

          </OnChainTable>
        </div>
      </div>
      <PlmModal
        title={"上传日志"}
        width={582}
        open={logVisible}
        centered
        onCancel={() => {
          if (loading) {
            message.error({
              content: "上传中，请稍后",
            });
          } else {
            setLogVisbile(false);
            setLogData([])
          }
        }}
      >
        <div style={{ padding: "12px 13px", background: "#f1f1f1" }}>
          <div
            ref={logWrapperRef}
            className={
              "w-full border border-outBorder overflow-auto bg-white"
            }
            style={{ height: "365px", padding: "12px" }}
          >
            {logData.map((item: any, index: number) => {
              return (
                <div key={index} className="flex text-xs whitespace-nowrap">
                  <div className="whitespace-nowrap" style={{ marginRight: "10px", marginBottom: "4px" }}>
                    {item.dateTime}
                  </div>
                  <div className="whitespace-nowrap">{item.log}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-12 flex justify-end items-center">
          <Button
            onClick={async () => {
              downFile();
            }}
            style={{
              borderRadius: "2px",
              borderColor: "#57a8ed",
              marginRight: "8px",
            }}
          >
            下载错误日志
          </Button>
          <Button
            onClick={async () => {
              downFile();
            }}
            style={{
              marginRight: "13px",
              borderRadius: "2px",
              borderColor: "#57a8ed",
            }}
          >
            下载日志
          </Button>
        </div>
      </PlmModal>
    </div>
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* <PlmModal></PlmModal> */}
      <div className="w-full bg-base flex-1 flex flex-col overflow-hidden">
        {/* 操作栏 */}
        <PlmToolBar onClick={handleClick}></PlmToolBar>

        <div className="flex-1 flex pt-2 gap-2">
          {/* 左侧文件 */}
          <div style={{ minWidth: "254px", width: "254px" }} className="h-full">
            <div className="flex flex-col h-full pl-2">
              <div className="flex justify-between items-center h-6 mb-1.5">
                <OnChainSelect
                  size="small"
                  value={selectProduct}
                  options={productOptions}
                  onDropdownVisibleChange={(visible) => {
                    if (visible) {
                      getProductList()
                    }
                  }}
                  onChange={(e) => {
                    if (e) {
                      setSelectProduct(e);
                    }
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
                          className={`w-full gap-1 inline-flex overflow-hidden items-center cursor-pointer ${!(record.children && record.children.length)
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
                          <div
                            style={{
                              width: "100%",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            {text}
                          </div>
                        </div>
                      );
                    },
                  },
                ]}
                selectedCell={selectedCell}
              ></OnChainTable>
              {/* </div> */}
            </div>
          </div>

          {/* 中间详情 */}
          <div className="flex-1 h-full flex flex-col overflow-hidden">
            <div
              className="flex w-full gap-1.5"
              style={{ height: "300px", position: "relative" }}
            >
              {
                mqttClient.publishTopic === 'Tribon' ? BaseAttrInfo :
                  //@ts-ignore
                  <SplitPane
                    split="vertical"
                    minSize={400}
                    defaultSize={400}
                    maxSize={600}
                    allowResize
                  >
                    <div
                      style={{
                        background:
                          "linear-gradient(180deg,#ffffff 0%, #e8e8e8 100%)",
                        overflow: "hidden",
                      }}
                      className="flex-1 h-full border border-outBorder"
                    >
                      {/* <PDFViewer
                      pdfConfig={{
                        currentPage: 1,
                        scale: 0.4,
                        // rotate: 180
                      }}
                      backendDataMap={{}}
                      annotateConfig={{
                      }}
                      url={'/X802012001HCMX01.PDF'}>
                      </PDFViewer> */}
                      <img
                        id="thumbnail"
                        style={{ margin: "0 auto", height: "100%" }}
                        src={currentThumbnail}
                        alt=""
                      />
                    </div>

                    {
                      BaseAttrInfo
                    }
                  </SplitPane>
              }
            </div>
            <div className="mt-2 flex-1 overflow-hidden">
              <Tabs
                onTabClick={() => {
                  setFileSelectRows([]);
                  setMaterialSelectRows([]);
                }}
                defaultActiveKey="1"
                items={items}
                destroyInactiveTabPane
              />
            </div>
          </div>

          {/* 右侧BOM */}
          {
            mqttClient.publishTopic === 'Tribon' ? <div style={{ width: '4px', height: '100%' }}></div> : <div style={{ width: "254px", minWidth: "254px" }} className="h-full">
              <div className="h-full pr-2">
                <div className="flex justify-between items-center h-6 mb-1.5">
                  <OnChainSelect
                    size="small"
                    value={mqttClient.publishTopic === 'Tribon' ? '设计图' : "EBOM"}
                    onChange={(e) => {
                      setSelectProduct(e);
                    }}
                    open={false}
                    //@ts-ignore
                    clearIcon={false}
                    //@ts-ignore
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
                    ...(mqttClient.publishTopic === 'Tribon' ? {
                    } : {
                      expandedRowKeys: expandedKeys,
                      onExpandedRowsChange: (expandedKeys) => {
                        setExpandedKeys(expandedKeys);
                      },
                    })
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
                        if (mqttClient.publishTopic === 'Tribon') {
                          return record.name
                        }
                        return (
                          <div
                            className={`gap-1 inline-flex overflow-hidden items-center ${!(record.children && record.children.length)
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
                            <div className="overflow-hidden text-ellipsis w-full">
                              {InstanceAttrsMap &&
                                InstanceAttrsMap[getRowKey(record)]?.material
                                  ?.onChain?.Number ? (
                                InstanceAttrsMap[getRowKey(record)]?.material
                                  ?.onChain?.Number
                              ) : (
                                <div
                                  style={{
                                    height: "22px",
                                    width: "140px",
                                    // background: "#FFC745",
                                    opacity: "0.5",
                                  }}
                                >
                                  <div className="flex">
                                    {Array.from({ length: 20 }).map(
                                      (item, index: number) => {
                                        if (index % 2 == 0) {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#ffffff",
                                              }}
                                            ></div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#c1c1c1",
                                              }}
                                            ></div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                  <div className="flex">
                                    {Array.from({ length: 20 }).map(
                                      (item, index: number) => {
                                        if (index % 2 != 0) {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#ffffff",
                                              }}
                                            ></div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#c1c1c1",
                                              }}
                                            ></div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                  <div className="flex">
                                    {Array.from({ length: 20 }).map(
                                      (item, index: number) => {
                                        if (index % 2 == 0) {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#ffffff",
                                              }}
                                            ></div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#c1c1c1",
                                              }}
                                            ></div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                  <div className="flex">
                                    {Array.from({ length: 20 }).map(
                                      (item, index: number) => {
                                        if (index % 2 != 0) {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#ffffff",
                                              }}
                                            ></div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={index}
                                              style={{
                                                width: "5px",
                                                height: "5px",
                                                background: "#c1c1c1",
                                              }}
                                            ></div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      },
                    },
                  ]}
                  selectedCell={selectedCell}
                ></OnChainTable>
                {/* </div> */}
              </div>
            </div>
          }

          <PlmModal
            title={"上传日志"}
            width={582}
            open={logVisible}
            onCancel={() => {
              if (loading) {
                message.error({
                  content: "上传中，请稍后",
                });
              } else {
                setLogVisbile(false);
                setLogData([])
              }
            }}
          >
            <div style={{ padding: "12px 13px", background: "#f1f1f1" }}>
              <div
                ref={logWrapperRef}
                className={
                  "w-full border border-outBorder overflow-auto bg-white"
                }
                style={{ height: "365px", padding: "12px" }}
              >
                {logData.map((item: any, index: number) => {
                  return (
                    <div key={index} className="flex text-xs">
                      <div style={{ marginRight: "10px", marginBottom: "4px" }}>
                        {item.dateTime}
                      </div>
                      <div>{item.log}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-12 flex justify-end items-center">
              <Button
                onClick={async () => {
                  downFile();
                }}
                style={{
                  borderRadius: "2px",
                  borderColor: "#57a8ed",
                  marginRight: "8px",
                }}
              >
                下载错误日志
              </Button>
              <Button
                onClick={async () => {
                  downFile();
                }}
                style={{
                  marginRight: "13px",
                  borderRadius: "2px",
                  borderColor: "#57a8ed",
                }}
              >
                下载日志
              </Button>
            </div>
          </PlmModal>
        </div>
      </div>
    </div>
  );
};

export default index;
