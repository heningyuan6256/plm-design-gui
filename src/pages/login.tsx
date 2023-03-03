/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:56
 * Description: 登陆页面
 */
import { invoke } from "@tauri-apps/api";
import API, { loginUserProps } from "../utils/api";
import { WebviewWindow, TitleBarStyle } from "@tauri-apps/api/window";
import { OnChainForm, OnChainFormItem } from "onchain-ui";
import { Button, Form } from "antd";
import { PlmFormItemProps } from "onchain-ui/dist/esm/OnChainFormItem";
import PlmIcon from "../components/PlmIcon";
import OnChainLogo from "../assets/image/OnChainLogo.svg";

export default function login() {
  const [form] = Form.useForm();
  const login = () => {
    const data = form.getFieldsValue();
    console.log(data, "data");
    // const user: loginUserProps = {
    //   email: "Hny14746999@163.com",
    //   password: "147520",
    //   userAgent: "macos",
    // };
    // API.login(user).then(async (res) => {
    //   await invoke("open_login", {});
    //   const loginWindow = WebviewWindow.getByLabel("Login");
    //   loginWindow?.close();
    // });
  };

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
    },
    {
      name: "product",
      content: {
        type: "Select",
        props: {
          className: 'login-select',
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
    },
  ];
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-240 bg-primary h-full flex items-center justify-center">
        <img width={144} src={OnChainLogo} alt="" />
      </div>
      <div className="flex-1 pt-14 px-12">
        <OnChainForm name="login" form={form}>
          {formItems.map((item, index) => (
            <OnChainFormItem
              key={"item" + index}
              name={item.name}
              content={item.content}
            ></OnChainFormItem>
          ))}
        </OnChainForm>
        <Button
          className="login-btn mt-12 w-full bg-primary h-9 text-white text-xs hover:text-white rounded-sm"
          onClick={login}
        >
          登录
        </Button>
      </div>
    </div>
  );
}
