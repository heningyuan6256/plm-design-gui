/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:48
 * Description: 属性映射
 */

import { appWindow } from "@tauri-apps/api/window";
import PlmIcon from "../components/PlmIcon";
import PlmMappingData from "../components/PlmMappingData";
import { BasicConfig, CommandConfig } from "../constant/config";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { useEffect, useRef, useState } from "react";
import { Button, Tabs, TabsProps, message } from "antd";
import API from "../utils/api";
import { BasicsItemCode } from "../constant/itemCode";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { cloneDeep } from "lodash";
import { mqttClient } from "../utils/MqttService";
import { useUpdateEffect } from "ahooks";

export enum settingType {
  cadToFile = "cadToFile",
  cadToItem = "cadToItem",
  PlmToCad = "PlmToCad",
  setting = "setting",
}

export enum templateType {
  product = "gb_assembly.asmdot",
  part = "gb_part.prtdo",
}

export default function AttrMap() {
  const mappingRef = useRef<any>();
  const [attrList, setAttrList] = useState<Record<string, any>[]>([]);
  const [activeKey, setActiveKey] = useState<string>(settingType.cadToFile);
  const [mappingData, setMappingData] = useState<any[]>([]);
  const [rightTableList, setRightTableList] = useState<Record<string, any>[]>(
    []
  );
  const dispatch = useDispatch();

  const dealAttrMap = async (res?: any) => {
    dispatch(setLoading(true));
    // 查找公有属性
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode:
        activeKey === settingType.cadToFile
          ? BasicsItemCode.file
          : BasicsItemCode.material,
      tabCode: "10002001",
    });
    // 查找专有属性
    const {
      result: { records: PrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode:
        activeKey === settingType.cadToFile
          ? BasicsItemCode.file
          : BasicsItemCode.material,
      tabCode: "10002002",
    });
    const attList = res.output_data[templateType.product];

    // 使用 reduce 方法进行去重
    const uniqueArray = attList.reduce((acc: any, obj: any) => {
      const found = acc.find((item: any) => item.name === obj.name);
      if (!found) {
        acc.push(obj);
      }
      return acc;
    }, []);

    setAttrList(
      uniqueArray.map((item: any) => {
        return {
          ...item,
          filedName: item.name,
          filed: item.name,
          meta: "",
        };
      })
    );
    const configData = (list: any) => {
      return list.map((item: any) => {
        return {
          ...item,
          filedName: item.name,
          filed: item.apicode,
          attrId: item.id,
          notEmpty: item.required,
          isShow:
            item.readonly != "4" &&
            item.status &&
            item.readonly != "3" &&
            item.readonly != "2",
        };
      });
    };
    API.getMapptingAttrs({
      toolName: BasicConfig.pubgin_topic,
      mappingName: settingType.cadToFile,
      fileType: "sldprt",
    }).then((res: any) => {
      setMappingData(
        res.result.map((item: any) => {
          return {
            source: item.sourceAttr,
            target: item.targetAttr,
            tabCode: item.tabCode,
          };
        })
      );
      const rightTableList = [
        {
          rootName: "公有属性",
          rootId: "10002001",
          children: configData(PublicAttrs),
        },
        {
          rootName: "专有属性",
          rootId: "10002002",
          children: configData(PrivateAttrs),
        },
      ];
      setRightTableList(rightTableList);
      dispatch(setLoading(false));
    });
  };

  useEffect(() => {
    dispatch(setLoading(true));
    mqttClient.publish({
      type: CommandConfig.getProductTypeAtt,
      input_data: {
        template_path:
          "C:\\ProgramData\\SOLIDWORKS\\SOLIDWORKS 2019\\templates",
      },
    });
  }, [activeKey]);

  // 监听属性映射
  useMqttRegister(CommandConfig.getProductTypeAtt, (res) => {
    dealAttrMap(res);
  });

  const items: TabsProps["items"] = [
    {
      key: settingType.cadToFile,
      label: `CAD至文件`,
    },
    {
      key: settingType.cadToItem,
      label: `CAD至物料`,
    },
  ];
  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden bg-base"
      style={{ padding: "12px" }}
    >
      <Tabs
        activeKey={activeKey}
        items={items}
        destroyInactiveTabPane
        onTabClick={(e) => {
          setActiveKey(e);
        }}
      />
      <div className="overflow-hidden h-full mt-3">
        <div className="flex text-xs border-l border-outBorder">
          <div
            className="bg-white border-r border-t border-outBorder"
            style={{ padding: "3px 9px" }}
          >
            CAD至文件
          </div>
          <div
            className="bg-white border-r border-t border-outBorder"
            style={{ padding: "3px 9px" }}
          >
            CAD至物料
          </div>
          <div
            className="bg-white border-r border-t border-outBorder"
            style={{ padding: "3px 9px" }}
          >
            文件至CAD
          </div>
        </div>
        <div className="flex overflow-hidden h-full">
          <div
            style={{ height: "100%", width: "100%" }}
            className="py-2 bg-white px-2 border border-outBorder"
          >
            <PlmMappingData
              ref={mappingRef}
              isShowHeader={false}
              onLoading={() => {}}
              mappingData={mappingData}
              leftTableList={attrList}
              rightTableList={rightTableList}
            ></PlmMappingData>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <Button
          className="rounded-sm mr-2 text-xs bg-white"
          onClick={() => {
            setMappingData(cloneDeep(mappingData));
          }}
        >
          取消
        </Button>
        <Button
          className="rounded-sm text-xs bg-white"
          // style={{ border: "1px solid #cdcdcd" }}
          onClick={() => {
            const data = mappingRef?.current?.getTargetData();
            API.postMapptingAttrs({
              attrMappingList: data.mappingData,
              toolName: BasicConfig.pubgin_topic,
              mappingName: activeKey,
              fileType: "sldprt",
            }).then((res) => {
              message.success("保存成功");
            });
          }}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
