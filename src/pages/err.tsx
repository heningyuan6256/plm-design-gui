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
