const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path"); // 1. ADD THIS LINE AT THE TOP

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

// 2. ADD THIS LINE: Tell Express to serve the static frontend files compiled by Docker
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "office-management-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

// 3. ADD THIS BLOCK: Route all browser page refreshes straight to React's index.html
app.get("*", (req, res, next) => { // <--- Added 'next' right here!
  // If it's looking for an API route that doesn't exist, let it skip to the error handler
  if (req.path.startsWith("/api/")) {
    return next(); 
  }
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Leave these error handlers right at the very bottom
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
