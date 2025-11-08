import http from "http";

export const json = (
  res: http.ServerResponse,
  status: number,
  payload: any
) => {
  const body = JSON.stringify(payload);

  res.writeHead(status, {
    "Content-Type": "application/json",
    "content-length": Buffer.byteLength(body),
  });

  res.end(body);
};

export const ok = (res: http.ServerResponse, payload: any = { ok: true }) => {
  return json(res, 200, payload);
};

export const badRequest = (
  res: http.ServerResponse,
  message: string = "Bad Request"
) => {
  return json(res, 400, { error: message });
};

export const notFound = (
  res: http.ServerResponse,
  message: string = "Not Found"
) => {
  return json(res, 404, { error: message });
};

export const internalServerError = (
  res: http.ServerResponse,
  message: string = "Internal Server Error"
) => {
  return json(res, 500, { error: message });
};
