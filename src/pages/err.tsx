/**
* Author: hny_147
* Date: 2023/03/02 14:43:48
* Description: 错误页面
*/
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div id="error-page">
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
