import express from "express";
import { matchRouter } from "./routes/matches.js";
const PORT = Number(process.env.PORT)|| 8000;
const HOST = process.env.HOST|| "0.0.0.0";
import http from "http"
import { attachWebSocketServer } from "./ws/server.js";

const app = express();
// we need to wrap the express app in a standard node http server allowing both 
// http routes and ws upgrade to coexist on one port
const server = http.createServer(app)
// Middleware
app.use(express.json());


// Routes
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the Express server!" });
});

app.use("/matches", matchRouter);
const {broadCastMatchCreated} = attachWebSocketServer(server)
app.locals.broadCastMatchCreated = broadCastMatchCreated;

// Start server
server.listen(PORT,HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket is running on ${baseUrl.replace("http", "ws")}/ws`);

});
