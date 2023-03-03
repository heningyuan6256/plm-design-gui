import "./App.css";
import { RoutesWithSubRoutes } from "./config/routes";
import "antd/dist/reset.css";
import "./assets/font/iconfont.css";
import { ConfigProvider } from "antd";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#398DCA",
        },
      }}
    >
      <RoutesWithSubRoutes></RoutesWithSubRoutes>;
    </ConfigProvider>
  );
}

export default App;
