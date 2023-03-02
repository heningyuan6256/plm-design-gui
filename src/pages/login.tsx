/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:56
 * Description: 登陆页面
 */
import { invoke } from "@tauri-apps/api";
import API, { loginUserProps } from "../utils/api";
import { WebviewWindow, TitleBarStyle } from "@tauri-apps/api/window";

export default function login() {
  const login = () => {
    const user: loginUserProps = {
      email: "Hny14746999@163.com",
      password: "147520",
      userAgent: "macos",
    };

    API.login(user).then(async (res) => {
      await invoke("open_login", {});
      const loginWindow = WebviewWindow.getByLabel("Login");
      loginWindow?.close();
    });
  };
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-240 bg-primary h-full">

      </div>
      {/* <button onClick={login}>登陆页面</button> */}
      <div className="flex-1"></div>
    </div>
  );
}
