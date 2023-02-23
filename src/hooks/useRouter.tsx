import { useEffect, useState } from "react";
import { createBrowserRouter, Router } from "react-router-dom";
import ErrorPage from "../pages/err";
import Login from "../pages/login";
const useRouter = () => {
  const [router, setRouter] = useState<typeof Router>();
  useEffect(() => {
    const routerScope = createBrowserRouter([
      {
        path: "/",
        element: <div>主页面</div>,
        errorElement: <ErrorPage />,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
    ]);
    setRouter(routerScope as any);
  }, []);

  return router;
};

export default useRouter;
