import "./App.css";
import { RouterProvider } from "react-router-dom";
import useRouter from "./hooks/useRouter";

function App() {
  const router: any = useRouter();
  if (router) {
    return <RouterProvider router={router} />;
  } else {
    return <></>;
  }
}

export default App;

// const webview = new WebviewWindow("element", {
//   url: "/element",
//   // 可自行添加属性配置     窗口配置
//   //center:true,
//   //decorations:false
// });

// webview.once("tauri://created", function () {
//   // webview window successfully created
//   // 窗口创建成功 打印1
//   console.log(1);
// });
// webview.once("tauri://error", function (e) {
//   // an error happened creating the webview window
//   // 窗口创建失败 打印2
//   console.log(2);
// });
