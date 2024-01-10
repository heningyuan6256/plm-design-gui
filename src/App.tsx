import "./App.css";
import { RoutesWithSubRoutes } from "./config/routes";
// import "antd/dist/reset.css";
import "./assets/font/iconfont.css";
import "./tailwind.css";
// import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./models/store";
import {
  Button,
  defaultTheme,
  Provider as ConfigProvider,
} from "@adobe/react-spectrum";
import Layout from "./layout";
// 连接mqtt
// mqttClient.connect(BasicConfig.MqttConnectUrl);

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={defaultTheme}
      >
        <div className='bg-white h-full'>
        <Layout>
          <RoutesWithSubRoutes></RoutesWithSubRoutes>
        </Layout>
        </div>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
