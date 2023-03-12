/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import { OnChainForm, OnChainFormItem } from "onchain-ui";
import PlmIcon from "../components/PlmIcon";
import PlmToolBar from "../components/PlmToolBar";
import Foot from "../layout/foot";
import Head from "../layout/head";
// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* 头部 */}
      <Head></Head>

      <div className="w-full bg-base flex-1 flex flex-col px-3 py-3">
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
          <div className="flex-1 h-full">
            <div className="flex w-full gap-1.5" style={{ height: "307px" }}>
              {/* 缩略图 */}
              <div
                style={{
                  background: "linear-gradient(180deg,#fafbff 8%, #e9f2fe)",
                }}
                className="flex-1 h-full border border-outBorder"
              ></div>
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
                            options: [{label: '测试', value: '123'}],
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
