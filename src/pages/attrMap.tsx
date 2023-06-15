/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:48
 * Description: 属性映射
 */

import { appWindow } from "@tauri-apps/api/window";
import PlmIcon from "../components/PlmIcon";
import PlmMappingData from "../components/PlmMappingData";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  interceptRequest,
  interceptResponse,
  publish,
  subscribe,
} from "../models/mqtt";
import { useEffect } from "react";

export default function AttrMap() {
  const dispatch = useDispatch();

  const { value: mqtt } = useSelector((state: any) => state.mqtt);

  mqtt.on("message", (topic: any, message: any) => {
    console.log(topic, interceptResponse(message));
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
      <div
        data-tauri-drag-region
        className="bg-primary flex items-center px-4 justify-between h-8"
      >
        <div
          className="flex gap-1 items-center text-xs text-white"
          onClick={() => {
            dispatch(
              publish(
                interceptRequest("mapAttr", {
                  type: "getProductTypeAtt",
                  topic: "sw",
                  version: "2010",
                })
              )
            );
          }}
        >
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
      </div>
      <div>
        <PlmMappingData
          isShowHeader={true}
          onLoading={() => {}}
          leftTableList={data.leftTableList}
          rightTableList={data.rightTableList}
        ></PlmMappingData>
      </div>
    </div>
  );
}
