import http from "http";
import { handleRequest } from "./router";
import { setupIndexes } from './../scripts/create-indexes';

export const createServer = () => {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.log("Unhandled error in handler:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    });
  });

  return server;
};


// 


export async function startServer(port: number) {
  const server = createServer();
  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
  
  await setupIndexes(); // ✅ automatically run on startup

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}