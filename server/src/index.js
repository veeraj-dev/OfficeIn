const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

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
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// --- 1. HEALTH AND API ROUTES FIRST ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "office-management-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

// --- 2. STATIC FRONTEND SERVING SECOND ---
// This tells Express to look inside the public folder for JS/CSS files first
app.use(express.static("/app/server/public"));

// This catches any frontend URL browser refreshes and loads the dashboard
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next(); // If it's a broken API route, let it drop to the 404 handler below
  }
  res.sendFile("/app/server/public/index.html");
});

// --- 3. ERROR HANDLERS AT THE VERY BOTTOM ---
app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
