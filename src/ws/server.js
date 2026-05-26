import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { wsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadCast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    noServer: true,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });

  server.on("upgrade", async (req, socket, head) => {
    // Check if this is a WebSocket upgrade for our path
    if (req.url !== "/ws") {
      socket.destroy();
      return;
    }

    // Run Arcjet check before handshake
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit exceeded"
            : "Access denied";
          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.error("WS Security error during upgrade", error);
        socket.close(1011, "Server security error");
        return;
      }
    }

    // Proceed with upgrade after security check passes
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });
    sendJson(socket, { type: "Welcome" });
    socket.on("error", console.error);
  });
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  function broadCastMatchCreated(match) {
    broadCast(wss, { type: "match_created", data: match });
  }
  return { broadCastMatchCreated };
}
