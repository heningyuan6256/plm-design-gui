/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 主页
 */
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";

// import { dealMaterialData } from 'plm-wasm'

const index = () => {
  const exist = async () => {
    await invoke("exist", {});
    const mainWindow = WebviewWindow.getByLabel("Home");
    mainWindow?.close();
  };
  return (
    <div>
      总页面
      <button onClick={exist}>退出登陆</button>
    </div>
  );
};

export default index;
