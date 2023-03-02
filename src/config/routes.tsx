/**
 * Author: hny_147
 * Date: 2023/03/02 17:33:04
 * Description: 路由
 */
import ErrorPage from "../pages/err";
import Login from "../pages/login";
import Home from "../pages/index";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export const RoutesWithSubRoutes = () => {
  const router = createBrowserRouter([
    // 客户端首页
    {
      path: "/",
      element: <Home></Home>,
      errorElement: <ErrorPage />,
    },
    // 登陆页
    {
      path: "/login",
      element: <Login></Login>,
    },
  ]);
  return <RouterProvider router={router} />;
};
