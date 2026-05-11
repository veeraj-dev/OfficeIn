const jwt = require("jsonwebtoken");

function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const e = new Error("JWT_SECRET is missing (set it in server/.env)");
      e.status = 500;
      throw e;
    }

    const payload = jwt.verify(token, secret);
    req.user = payload; // { sub, email, role, name }
    next();
  } catch (_e) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }
    if (!roles.includes(req.user.role)) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

