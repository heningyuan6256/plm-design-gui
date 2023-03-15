/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import { useSize } from "ahooks";
import {
  OnChainForm,
  OnChainFormItem,
  OnChainTable,
  OnChainTextViewer,
  OnChainViewer,
} from "onchain-ui";
import { useEffect, useRef } from "react";
import PlmIcon from "../components/PlmIcon";
import PlmToolBar from "../components/PlmToolBar";
import Foot from "../layout/foot";
import Head from "../layout/head";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const ref = useRef<HTMLDivElement>(null);
  // const size = useSize(ref);
  return (
    <div className="h-full w-full flex flex-col">
      {/* 头部 */}
      <Head></Head>

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
                    className="text-xs scale-90"
                  ></PlmIcon>
                </div>
              </div>
              <div className="flex-1 bg-white border border-outBorder"></div>
            </div>
          </div>

          {/* 中间详情 */}
          <div className="flex-1 h-full flex flex-col">
            <div className="flex w-full gap-1.5" style={{ height: "307px" }}>
              {/* 缩略图 */}
              <div
                style={{
                  background: "linear-gradient(180deg,#fafbff 8%, #e9f2fe)",
                }}
                className="flex-1 h-full border border-outBorder"
              >
                <div style={{ height: "500px" }}>
                  {/* asdf */}
                  {/* <OnChainViewer
      extensions="docx"
      url="http://124.71.151.153:8017/api/plm/files/eebe0dc1bc2e5c1bde09c4a84ab64ff7+2fade30c-ffb2-4069-806c-496efff68d58"
    ></OnChainViewer> */}
                  {/* <OnChainViewer
      extensions="txt"
      url="http://124.71.151.153:8017/api/plm/files/10be42f17229e5ef4b327cea2a5266e7+f70bf83c-86d3-4373-83d1-91fc75fa0a76"
    ></OnChainViewer> */}
                  {/* <OnChainViewer
      extensions="txt"
      url="/robots.txt"
    ></OnChainViewer> */}
                  {/* <OnChainViewer
        extensions="xlsx"
        url="http://124.71.151.153:8017/api/plm/files/b6d81132c7a2001cb489351f5e125bc2+20b27c14-b09b-4acd-b69c-f949138e723c"
      ></OnChainViewer> */}
                  {/* <OnChainViewer
        extensions="ts"
        url="https://cdn.jsdelivr.net/gh/heningyuan6256/staticResource@latest/testFile/typescript.ts"
      ></OnChainViewer> */}
                  {/* <OnChainViewer
                    extensions="pdf"
                    url="/123.pdf"
                  ></OnChainViewer> */}
                  {/* <OnChainViewer
        extensions="png"
        url="http://124.71.151.153:8017/api/plm/files/b3423b35beba659fbd9cb984f0556a79+9c603127-5552-45cd-af56-d42fab401d65"
      ></OnChainViewer> */}
                </div>
              </div>
              {/* 基本信息 */}
              <div
                className="border border-outBorder h-full pt-2.5 px-4 pb-5 flex flex-col"
                style={{ width: "478px" }}
              >
                <div className="flex justify-between h-7">
                  <div className="text-xs">基本信息</div>
                  <div>
                    <PlmIcon name="edit" className="text-xs"></PlmIcon>
                  </div>
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
                dataSource={[
                  { vv: "", id: "123" },
                  { vv: "", id: "2" },
                  { vv: "", id: "3" },
                  { vv: "", id: "4" },
                ]}
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
              <div className="flex-1 bg-white border border-outBorder"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 尾部 */}
      <Foot></Foot>
    </div>
  );
};

export default index;
