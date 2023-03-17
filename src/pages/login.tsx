/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:56
 * Description: 登陆页面
 */
import { invoke, notification } from "@tauri-apps/api";
import API, { loginUserProps } from "../utils/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { OnChainForm, OnChainFormItem } from "onchain-ui";
import { Button, Form, Input, message } from "antd";
import { PlmFormItemProps } from "onchain-ui/dist/esm/OnChainFormItem";
import PlmIcon from "../components/PlmIcon";
import OnChainLogo from "../assets/image/OnChainLogo.svg";
import { useEffect, useState } from "react";
import { Utils } from "../utils";
import { ListCode } from "../constant/listCode";
import { DefaultOptionType } from "antd/es/select";
import { writeFile } from "@tauri-apps/api/fs";
import { homedir } from "os";

export default function login() {
  const [form] = Form.useForm();
  const [selectOptions, setSelectOptions] = useState<DefaultOptionType[]>([]);
  const login = async () => {
    const data = await form.validateFields();
    const { name, psw } = data;

    const user: loginUserProps = {
      email: name,
      password: psw,
      userAgent: "macos",
    };
    API.login(user)
      .then(async (res: any) => {
        // 获取hom路径
        const homeDirPath = await homedir();
        await writeFile(`${homeDirPath}.onChain/token.txt`, res.result.token);

        await invoke("open_login", {
          width: window.innerWidth,
          height: window.innerHeight,
        });
        const loginWindow = WebviewWindow.getByLabel("Login");
        loginWindow?.close();
      })
      .catch((err) => {
        notification.sendNotification({
          title: err.message,
        });
      });
  };

  useEffect(() => {
    // 获取所有的产品
    API.getList([{ code: ListCode.ProductList }]).then((res: any) => {
      const result = res.result || [];
      const map = Utils.resolveList(result);
      setSelectOptions(map[ListCode.ProductList]);
    });
  }, []);

  const formItems: PlmFormItemProps[] = [
    {
      name: "address",
      content: {
        type: "Input",
        props: {
          prefix: (
            <PlmIcon className="second-color" name="front-position"></PlmIcon>
          ),
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
            <PlmIcon
              className="second-color"
              name="front-PersonalCenter-user"
            ></PlmIcon>
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
        type: "Input",
        props: {
          placeholder: "请输入登录密码",
          prefix: (
            <PlmIcon
              name="a-front-signinpassword"
              className="second-color"
            ></PlmIcon>
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
    {
      name: "product",
      content: {
        type: "Select",
        props: {
          className: "login-select",
          options: selectOptions,
          placeholder: (
            <div>
              <PlmIcon
                style={{ marginInlineEnd: "4px" }}
                name="front-folder-part"
                className="second-color"
              ></PlmIcon>
              请选择产品
            </div>
          ),
        },
      },
      rules: [
        {
          required: true,
          message: "产品不能为空",
        },
      ],
    },
  ];
  return (
    <div className="flex h-full overflow-hidden">
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
          className="login-btn mt-6 w-full bg-primary h-9 text-white text-xs hover:text-white rounded-sm"
          onClick={login}
        >
          登录
        </Button>
        <div
          className="absolute bottom-2 left-1/2 text-xs text-secondary whitespace-nowrap "
          style={{ transform: "translate(-50%, 0)" }}
        >
          <span className="text-xs scale-75 inline-block">
            Copyright @ 2022 武汉大海信息系统科技有限公司.All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  );
}
