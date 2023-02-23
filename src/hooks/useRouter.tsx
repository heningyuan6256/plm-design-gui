import { useEffect, useState } from "react";
import { createBrowserRouter, Router } from "react-router-dom";
import ErrorPage from "../pages/err";
import Login from "../pages/login";
import Home from '../pages/index'
const useRouter = () => {
  const [router, setRouter] = useState<typeof Router>();
  useEffect(() => {
    const routerScope = createBrowserRouter([
      {
        path: "/",
        element: <Home></Home>,
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
