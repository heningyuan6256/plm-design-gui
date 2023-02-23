import { invoke } from "@tauri-apps/api";
import API, { loginUserProps } from "../utils/api";
import { WebviewWindow } from "@tauri-apps/api/window";

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
      loginWindow?.close()
    });
  };
  return (
    <div>
      <button onClick={login}>登陆页面</button>
    </div>
  );
}
