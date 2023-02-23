import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";

const index = () => {
  const exist = async () => {
    await invoke("exist", {});
    const mainWindow = WebviewWindow.getByLabel("Home");
    mainWindow?.close()
  };
  return (
    <div>
      总页面
      <button onClick={exist}>退出登陆</button>
    </div>
  );
};

export default index;
