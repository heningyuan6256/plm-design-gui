import "./App.css";
import { RoutesWithSubRoutes } from "./config/routes";
import "antd/dist/reset.css";
import "./assets/font/iconfont.css";
import "./tailwind.css";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./models/store";
import Layout from "./layout";
import mqtt, { MqttClient } from "mqtt";
import { useEffect, useId } from "react";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { BasicConfig, CommandConfig } from "./constant/config";
import { mqttClient } from "./utils/MqttService";
import { Utils } from "./utils";
function App() {
  useEffect(() => {
    // 操作路由
    mqttClient.connect(BasicConfig.MqttConnectUrl);
    mqttClient.registerCallBack(
      Utils.instruction(CommandConfig.getProductTypeAtt),
      async (args) => {
        console.log(args, "arts");
      }
    );
    return () => {
      mqttClient.unRegisterCallBack(
        Utils.instruction(CommandConfig.getProductTypeAtt)
      );
    };
  }, []);
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0563B2",
          },
        }}
      >
        <Layout>
          <RoutesWithSubRoutes></RoutesWithSubRoutes>
        </Layout>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
