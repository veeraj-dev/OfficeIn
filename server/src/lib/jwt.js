const jwt = require("jsonwebtoken");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is missing (set it in server/.env)");
    err.status = 500;
    throw err;
  }

  const payload = {
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

module.exports = { signToken };

