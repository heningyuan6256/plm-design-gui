import "./App.css";
import { RoutesWithSubRoutes } from "./config/routes";
import "antd/dist/reset.css";
import "./assets/font/iconfont.css";
import "./tailwind.css";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./models/store";
import Layout from "./layout";
import { BasicConfig, CommandConfig } from "./constant/config";
import { mqttClient } from "./utils/MqttService";
// 连接mqtt
mqttClient.connect(BasicConfig.MqttConnectUrl);

function App() {
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
