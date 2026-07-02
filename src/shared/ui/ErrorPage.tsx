import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "알 수 없는 오류가 발생했어요.";

  return (
    <div>
      <h1>문제가 발생했어요</h1>
      <p>{message}</p>
    </div>
  );
}
