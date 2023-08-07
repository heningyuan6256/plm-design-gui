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
import Active from "../pages/active";
import Query from "../pages/query";
import PageLayout from "../layout/pageLayout";
import AttrMap from "../pages/attrMap";

export const RoutesWithSubRoutes = () => {
  const router = createBrowserRouter([
    // 客户端首页
    {
      path: "/center",
      element: <></>,
    },
    // 登陆页
    {
      path: "/login",
      element: <Login></Login>,
    },

    // 激活界面
    {
      path: "/active",
      element: <Active></Active>,
    },
    // 关于界面
    {
      path: "/info",
      element: <Info></Info>,
    },

    // 主页
    {
      path: "/",
      errorElement: <ErrorPage />,
      element: <PageLayout></PageLayout>,
      children: [
        {
          path: "/home",
          element: <Home></Home>,
        },
        // 属性映射
        {
          path: "/preference",
          element: <AttrMap></AttrMap>,
        },
        // 物料库
        {
          path: "/stock",
          element: <Stock></Stock>,
        },
        // 库
        {
          path: "/query",
          element: <Query></Query>,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};
