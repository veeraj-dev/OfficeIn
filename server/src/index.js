const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const { connectDb } = require("./lib/db");
const { notFoundHandler, errorHandler } = require("./middleware/errors");

const authRoutes = require("./routes/auth.routes");
const departmentRoutes = require("./routes/departments.routes");
const employeeRoutes = require("./routes/employees.routes");
const leaveRoutes = require("./routes/leaves.routes");

dotenv.config();

const app = express();

const allowedOrigins = new Set(
  [
    process.env.CLIENT_ORIGIN,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ].filter(Boolean)
);

function isAllowedLocalOrigin(origin) {
  try {
    const u = new URL(origin);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1") return false;
    if (!u.port) return false;
    const port = Number(u.port);
    return Number.isFinite(port) && port >= 5170 && port <= 5190;
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests or non-browser tools with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      if (isAllowedLocalOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "office-management-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

connectDb()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  });

