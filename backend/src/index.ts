import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { schoolsRouter } from "./routes/schools.js";
import { accessRouter } from "./routes/access.js";
import { contentRouter } from "./routes/content.js";
import { analyticsRouter } from "./routes/analytics.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "outschool-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/schools", schoolsRouter);
app.use("/api/access", accessRouter);
app.use("/api/content", contentRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`OutSchool API listening on http://${HOST}:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    process.exit(1);
  }
  throw err;
});

