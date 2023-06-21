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
import { Button } from "antd";
import API from "../utils/api";

export default function AttrMap() {
  const mappingRef = useRef<any>();
  const [attrList, setAttrList] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    const attList = [
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
    ];
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
    API.getMapptingAttrs().then((res) => {
      console.log(res, "resF");
    });
  }, []);

  // 监听属性映射
  useMqttRegister(CommandConfig.getProductTypeAtt, (res) => {
    console.log(res, "res");
  });

  const data = {
    isShowHeader: true,
    leftTableList: [
      {
        filedName: "编号",
        filed: "0",
        mate: "",
      },
      {
        filedName: "描述",
        filed: "1",
        mate: "",
      },
      {
        filedName: "类型",
        filed: "2",
        mate: "",
      },
      {
        filedName: "创建人",
        filed: "3",
        mate: "",
      },
      {
        filedName: "生命周期",
        filed: "4",
        mate: "",
      },
      {
        filedName: "版本",
        filed: "5",
        mate: "",
      },
      {
        filedName: "生效时间",
        filed: "6",
        mate: "",
      },
      {
        filedName: "匹配交付名称",
        filed: "7",
        mate: "",
      },
    ],
    rightTableList: [
      {
        rootName: "公有属性",
        rootId: "10002001",
        children: [
          {
            attrId: "1461504896209645570",
            filed: "Number",
            filedName: "编号",
            notEmpty: true,
            sort: 1,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-0-0-0",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461505115403972610",
            filed: "Category",
            filedName: "类型",
            notEmpty: true,
            sort: 3,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-0-0-0",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461506449943425025",
            filed: "Unit",
            filedName: "单位",
            notEmpty: true,
            sort: 6,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1512627999513509890",
            filed: "Product",
            filedName: "所属产品",
            notEmpty: true,
            sort: 12,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-0-0-0",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1559335920577564673",
            filed: "ProductModel",
            filedName: "产品型号",
            notEmpty: true,
            sort: 13,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1521738549384318998",
            filed: "CheckoutStatus",
            filedName: "签出状态",
            notEmpty: false,
            sort: 0,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1671505503223203400",
            filed: "ChangeId",
            filedName: "ChangeId",
            notEmpty: false,
            sort: 1,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461505020583342081",
            filed: "Description",
            filedName: "描述",
            notEmpty: false,
            sort: 2,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461505503221903362",
            filed: "LifeCyclePhase",
            filedName: "生命周期",
            notEmpty: false,
            sort: 4,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461505726048497666",
            filed: "Version",
            filedName: "版本",
            notEmpty: false,
            sort: 5,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1521738549384319001",
            filed: "Revision",
            filedName: "版次",
            notEmpty: false,
            sort: 7,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1495945503669612545",
            filed: "CurrentWFNode",
            filedName: "当前节点",
            notEmpty: false,
            sort: 7,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461505873079824385",
            filed: "ReleaseTime",
            filedName: "生效时间",
            notEmpty: false,
            sort: 8,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461506007423381505",
            filed: "CreateUser",
            filedName: "创建人",
            notEmpty: false,
            sort: 9,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-0-1-0",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1461506366443220994",
            filed: "CreateTime",
            filedName: "创建时间",
            notEmpty: false,
            sort: 10,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-0-1-0",
            isShow: true,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1671505523223294499",
            filed: "CheckOutUser",
            filedName: "签出用户",
            notEmpty: false,
            sort: 13,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
          {
            attrId: "1671505523223294450",
            filed: "CheckOutDate",
            filedName: "签出时间",
            notEmpty: false,
            sort: 14,
            tabCode: 10002001,
            itemCode: 10001001,
            excelImportType: "0-1-1-0",
            isShow: false,
            isNotTransfer: false,
            value: null,
          },
        ],
      },
    ],
  };

  // 最小化
  const handleWinMin = async () => {
    await appWindow.close();
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* <div
        data-tauri-drag-region
        className="bg-primary flex items-center px-4 justify-between h-8"
      >
        <div className="flex gap-1 items-center text-xs text-white">
          属性映射
        </div>
        <div></div>
        <div></div>
        <div>
          <PlmIcon
            name="close"
            onClick={() => handleWinMin()}
            className="text-xs text-white cursor-pointer opacity-80 hover:shadow-2xl hover:bg-hoverHeadButton"
          ></PlmIcon>
        </div>
      </div> */}
      <div className="flex overflow-hidden h-full">
        {/* <div style={{ minWidth: "164px" }} className="text-xs px-3 py-3">
          <div>CAD至PLM</div>
          <div>PLM至CAD</div>
        </div> */}
        <div
          style={{ height: "calc(100% - 50px)", width: "100%" }}
          className="px-3 py-3"
        >
          <div>
            <Button
              onClick={() => {
                const data = mappingRef?.current?.getTargetData();
                console.log(data.mappingData, "data");
                API.postMapptingAttrs({ attrMappingList: data.mappingData });
              }}
            >
              保存
            </Button>
          </div>
          <PlmMappingData
            ref={mappingRef}
            isShowHeader={false}
            onLoading={() => {}}
            leftTableList={attrList}
            rightTableList={data.rightTableList}
          ></PlmMappingData>
        </div>
      </div>
    </div>
  );
}
