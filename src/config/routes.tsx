/**
 * Author: hny_147
 * Date: 2023/03/02 17:33:04
 * Description: 路由
 */
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Center from "../pages/center";
import ActiveSuccess from "../components/ActiveSuccess";

export const RoutesWithSubRoutes = () => {
  const router = createBrowserRouter([
    // 客户端首页
    {
      path: "/center",
      element: <Center></Center>,
    },
    // {
    //   path: "/activeSuccess",
    //   element: <ActiveSuccess></ActiveSuccess>,
    // },
    // 激活界面
    // {
    //   path: "/active",
    //   element: <Active></Active>,
    // },
    // 主页
    // {
    //   path: "/",
    //   errorElement: <ErrorPage />,
    //   element: <PageLayout></PageLayout>,
    //   children: [
    //     {
    //       path: "/home/:id",
    //       element: <Home></Home>,
    //     },
    //     // 属性映射
    //     {
    //       path: "/preference",
    //       element: <AttrMap></AttrMap>,
    //     },
    //     // 物料库
    //     {
    //       path: "/stock",
    //       element: <Stock></Stock>,
    //     },
    //     // 库
    //     {
    //       path: "/query",
    //       element: <Query></Query>,
    //     },
    //   ],
    // },
  ]);
  return <RouterProvider router={router} />;
};
