/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:56
 * Description: 登陆页面
 */
import API, { loginUserProps } from "../utils/api";
import { OnChainForm, OnChainFormItem } from "onchain-ui";
import { Button, Form, message } from "antd";
import { PlmFormItemProps } from "onchain-ui/dist/esm/OnChainFormItem";
import PlmIcon from "../components/PlmIcon";
import OnChainLogo from "../assets/image/OnChainLogo.svg";
import { BaseDirectory, createDir, readTextFile, writeFile } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import PlmLoading from "../components/PlmLoading";
import { useAsyncEffect, useKeyPress, useMount, useSafeState } from "ahooks";
import userSvg from "../assets/image/user.svg";
import { useDispatch } from "react-redux";
import { writeNetWork } from "../models/network";
import Request from "../utils/request";
import { fetchUserByToken } from "../models/user";
import { BasicConfig, CommandConfig, PathConfig } from "../constant/config";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { mqttClient } from "../utils/MqttService";
import { useEffect, useState } from "react";
import { Command } from '@tauri-apps/api/shell'
import { getMatches } from "@tauri-apps/api/cli";
import { openDesign } from "../layout/pageLayout";
import { listen } from "@tauri-apps/api/event";


export const regex = /onchain:\/\/openOnChainIns\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/;

export default function login() {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const loginSys = async () => {
    const data = await form.validateFields();

    const { name, psw, address } = data;
    const user: loginUserProps = {
      email: name,
      password: psw,
      userAgent: "OnChain-DesingFusion",
    };
    API.login(user)
      .then(async (res: any) => {
        mqttClient.publish({
          type: CommandConfig.onchain_path,
          input_data: PathConfig.login,
          output_data: {
            result: "ok",
          },
        });
        dispatch(writeNetWork(address));
        // 写入address
        const NewRequest = new Request({});
        NewRequest.initAddress(address, res.result.token);
        const homeDirPath = await homeDir();
        await writeFile(
          `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`,
          address
        );
        await writeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.User}`,
          `${name}---${psw}`)
        const data = await dispatch(
          fetchUserByToken(res.result.token) as any
        ).unwrap();
        if (data.id) {
          await invoke("open_home", {
            width: window.innerWidth,
            height: window.innerHeight,
          });
          const loginWindow = WebviewWindow.getByLabel("Login");
          loginWindow?.close();
        }
      })
      .catch((err) => {
        console.log(err, "err");

        message.error(err.message);
      });
  };

  const [loading, setLoading] = useState<boolean>()

  const formItems: PlmFormItemProps[] = [
    {
      name: "address",
      content: {
        type: "Input",
        props: {
          prefix: <PlmIcon className="second-color" name="address"></PlmIcon>,
          autoComplete: "off",
          placeholder: "请输入地址",
        },
      },
      rules: [
        {
          required: true,
          message: "地址不能为空",
        },
      ],
    },
    {
      name: "name",
      content: {
        type: "Input",
        props: {
          placeholder: "请输入用户名",
          autoComplete: "false",
          prefix: (
            <img src={userSvg} width={16} alt="" />
            // <PlmIcon className="second-color" name="address"></PlmIcon>
          ),
        },
      },
      rules: [
        {
          required: true,
          message: "用户名不能为空",
        },
      ],
    },
    {
      name: "psw",
      content: {
        type: "Input.Password",
        props: {
          placeholder: "请输入登录密码",
          prefix: <PlmIcon name="password" className="second-color"></PlmIcon>,
          iconRender: (visible: boolean) =>
            visible ? (
              <PlmIcon
                style={{ color: "#A7B3C5" }}
                className="text-base hover:cursor-pointer"
                name="show"
              />
            ) : (
              <PlmIcon
                style={{ color: "#A7B3C5" }}
                className="text-base hover:cursor-pointer"
                name="hide"
              />
            ),
        },
      },
      rules: [
        {
          required: true,
          message: "密码不能为空",
        },
      ],
    },
  ];

  useKeyPress(["enter"], () => {
    loginSys();
  });

  useMount(async () => {
    const openDesignInLogin = async (url: string) => {
      const onchainUrl = url as string
      const inputString = onchainUrl.match(regex);
      if (inputString) {
        let [matchUrl, address, token, itemCode, insId] = inputString
        token = decodeURIComponent(token)
        dispatch(writeNetWork(address));
        // 写入address
        const NewRequest = new Request({});
        NewRequest.initAddress(address, token);
        const homeDirPath = await homeDir();
        await writeFile(
          `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`,
          address
        );
        // await writeFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.User}`,
        //   `${name}---${psw}`)
        const data = await dispatch(
          fetchUserByToken(token) as any
        ).unwrap();
        if (data.id) {
          openDesign({
            loading: () => {
              setLoading(true)
            },
            cancelLoading: async () => {
              setLoading(false)
              await invoke("open_home", {
                width: window.innerWidth,
                height: window.innerHeight,
              });
              const loginWindow = WebviewWindow.getByLabel("Login");
              loginWindow?.close();
            },
            network: address,
            insId: insId,
            userId: data.id,
            itemCode: itemCode,
          });
        }
      }
    }
    listen("onchain", async (matchUrl: any) => {
      if (matchUrl.payload === 'Altium') {
        alert("请先登陆")
      } else {
        // 当已经打开了登陆界面，然后通过浏览器打开
        openDesignInLogin(matchUrl.payload as string)
      }
    })

    // mqtt成功建立连接后，判断当前的打开方式是否是web打开，如果是，则自动登陆，然后将文件下载到本地然后调用打开openDesigner的方法

    getMatches().then(async (matches) => {
      const matchTopic = matches?.args?.topic?.value || ""
      const matchPid = matches?.args?.pid?.value || ""
      // 当通过浏览器进入登陆界面的时候
      if (matchTopic && !matchPid && matchTopic != 'Altium') {
        openDesignInLogin(matchTopic as string)
      } else {
        // 正常情况的登陆
        const homeDirPath = await homeDir();
        const contents = await readTextFile(
          `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.User}`,
        );
        const newWorkContent = await readTextFile(
          `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`,
        );
        form.setFieldsValue({
          name: contents.split('---')[0] || '',
          psw: contents.split('---')[1] || '',
          address: newWorkContent
        })
      }
    })


  })

  return (
    <div className="flex h-full w-full overflow-hidden">
      <PlmLoading warrperClassName="flex" loading={loading} loadingText="正在打开设计工具">
        <div className="w-240 bg-primary h-full flex items-center justify-center">
          <img width={144} src={OnChainLogo} alt="" />
        </div>
        <div className="flex-1 relative" style={{ padding: "55px 50px 10px" }}>
          <OnChainForm name="login" form={form}>
            {formItems.map((item, index) => (
              <OnChainFormItem
                key={"item" + index}
                name={item.name}
                content={item.content}
                rules={item.rules}
              ></OnChainFormItem>
            ))}
          </OnChainForm>
          <Button
            className="login-btn w-full bg-primary h-9 text-white text-xs hover:text-white rounded-sm mt-12"
            onClick={() => loginSys()}
          >
            登录
          </Button>
          <div
            className="absolute bottom-2 left-1/2 text-xs text-secondary whitespace-nowrap "
            style={{ transform: "translate(-50%, 0)" }}
          >
            {/* <span className="text-xs inline-block">
              Copyright @ 2022 武汉大海信息系统科技有限公司.All Rights Reserved
            </span> */}
          </div>
        </div>
      </PlmLoading>
    </div>
  );
}
