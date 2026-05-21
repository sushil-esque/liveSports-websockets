import express from "express";
import { matchRouter } from "./routes/matches.js";
const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send({ message: "Welcome to the Express server!" });
});

app.use("/matches", matchRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
