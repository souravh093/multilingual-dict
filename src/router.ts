import http from "http";
import { WordsController } from "./controllers/word.controller";
import { notFound } from "./utils/response";

export async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const method = req.method || "GET";
  const path = url.pathname;

  if (method === "GET" && path === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        message: "Multilingual Dictionary API is running",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (method === "GET" && path === "/words") {
    return WordsController.getAllWords(req, res);
  }

  return notFound(res, "Route not found");
}
