/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:48
 * Description: 属性映射
 */

import { appWindow } from "@tauri-apps/api/window";
import PlmIcon from "../components/PlmIcon";
import PlmMappingData from "../components/PlmMappingData";
import { CommandConfig } from "../constant/config";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { useEffect, useRef, useState } from "react";
import { Button, Tabs, TabsProps, message } from "antd";
import API from "../utils/api";
import { BasicsItemCode } from "../constant/itemCode";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { cloneDeep } from "lodash";

export default function AttrMap() {
  const mappingRef = useRef<any>();
  const [attrList, setAttrList] = useState<Record<string, any>[]>([]);
  const [mappingData, setMappingData] = useState<any[]>([]);
  const [rightTableList, setRightTableList] = useState<Record<string, any>[]>(
    []
  );
  const dispatch = useDispatch();
  useEffect(() => {}, []);

  const dealAttrMap = async (res?: any) => {
    dispatch(setLoading(true));
    // 查找公有属性
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002001",
    });
    // 查找专有属性
    const {
      result: { records: PrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode: BasicsItemCode.file,
      tabCode: "10002002",
    });
    const attList = res.output_data["sldasm"];

    setAttrList(
      attList.map((item: any) => {
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
    API.getMapptingAttrs().then((res: any) => {
      console.log(
        res.result.map((item: any) => {
          return {
            source: item.sourceAttr,
            target: item.targetAttr,
            tabCode: item.tabCode,
          };
        }),
        "123123"
      );
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
    dealAttrMap({
      input_data: {},
      output_data: {
        sldasm: [
          {
            name: "Description",
            type: "string",
            defaultVal: "",
          },
          {
            name: "Weight",
            type: "string",
            defaultVal: '"SW-Mass@assem_top.SLDASM"',
          },
          {
            name: "质量",
            type: "string",
            defaultVal: '"SW-Mass@assem_top.SLDASM"',
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
      },
      topic: "sw",
      to: "client_onchain_0.8066863001197068",
      from: "client_onchain_0.8066863001197068",
      type: "sw.2010.getProductTypeAtt",
    });
  }, []);

  // 监听属性映射
  useMqttRegister(CommandConfig.getProductTypeAtt, (res) => {
    dealAttrMap(res);
  });

  const items: TabsProps["items"] = [
    {
      key: "file",
      label: `CAD至PLM`,
    },
    {
      key: "material",
      label: `PLM至CAD`,
    },
  ];
  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden bg-base"
      style={{ padding: "12px" }}
    >
      <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
      <div className="flex overflow-hidden h-full">
        <div
          style={{ height: "100%", width: "100%", paddingTop: "8px" }}
          className="pb-4"
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
            console.log(data.mappingData, "data");
            API.postMapptingAttrs({ attrMappingList: data.mappingData }).then(
              (res) => {
                message.success("保存成功");
              }
            );
          }}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
