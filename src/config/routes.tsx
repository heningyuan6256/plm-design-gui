/**
 * Author: hny_147
 * Date: 2023/03/02 17:33:04
 * Description: 路由
 */
import ErrorPage from "../pages/err";
import Login from "../pages/login";
import Home from "../pages/index";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Info from "../pages/info";
import Stock from "../pages/stock";
import PageLayout from "../layout/pageLayout";
import AttrMap from "../pages/attrMap";

export const RoutesWithSubRoutes = () => {
  const router = createBrowserRouter([
    // 客户端首页

    // 登陆页
    {
      path: "/login",
      element: <Login></Login>,
    },

    // 关于界面
    {
      path: "/info",
      element: <Info></Info>,
    },

    // 属性映射
    {
      path: "/att-map",
      element: <AttrMap></AttrMap>,
    },

    // 主页
    {
      path: "/",
      errorElement: <ErrorPage />,
      element: <PageLayout></PageLayout>,
      children: [
        {
          path: "/",
          element: <Stock></Stock>,
        },
        {
          path: "/home",
          element: <Home></Home>,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};
