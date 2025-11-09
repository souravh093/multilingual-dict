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

  // GET /words/search?q=haus&lang=de
  if (method === "GET" && path === "/words/search") {
    return WordsController.searchWords(req, res);
  }

  // GET /words/:id (e.g., /words/654a1b2c3d4e5f6g7h8i9j0k)
  const wordByIdMatch = path.match(/^\/words\/([a-zA-Z0-9]+)$/);
  if (method === "GET" && wordByIdMatch) {
    return WordsController.getWordById(req, res, wordByIdMatch[1]);
  }

  // GET /words/:id/translations?targetLang=en
  const translationsMatch = path.match(
    /^\/words\/([a-zA-Z0-9]+)\/translations$/
  );
  if (method === "GET" && translationsMatch) {
    return WordsController.getTranslations(req, res, translationsMatch[1]);
  }

  return notFound(res, "Route not found");
}
