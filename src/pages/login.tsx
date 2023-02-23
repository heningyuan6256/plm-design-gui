import { invoke } from "@tauri-apps/api";
import API, { loginUserProps } from "../utils/api";

export default function login() {
  const login = () => {
    const user: loginUserProps = {
      email: "Hny14746999@163.com",
      password: "147520",
      userAgent: "macos",
    };
    API.login(user).then(async (res) => {
      await invoke("open_login", {});
    });
  };
  return (
    <div>
      <button onClick={login}>登陆页面</button>
    </div>
  );
}
