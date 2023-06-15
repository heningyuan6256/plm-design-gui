import "./App.css";
import { RoutesWithSubRoutes } from "./config/routes";
import "antd/dist/reset.css";
import "./assets/font/iconfont.css";
import "./tailwind.css";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "./models/store";
import Layout from "./layout";
import mqtt from "mqtt";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { interceptResponse, subscribe } from "./models/mqtt";
import { useDispatch } from "react-redux";

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
