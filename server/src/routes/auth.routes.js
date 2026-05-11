const express = require("express");
const { User } = require("../models/User");
const { signToken } = require("../lib/jwt");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "veeraj.swamy.s123@gmail.com").toLowerCase().trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "Veeraj@7");

function toPublicUser(u) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    res.status(403).json({ message: "Self registration is disabled. Contact admin." });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (normalizedEmail === ADMIN_EMAIL) {
      if (String(password) !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let admin = await User.findOne({ email: ADMIN_EMAIL });
      if (!admin) {
        const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
        admin = await User.create({
          name: "Admin",
          email: ADMIN_EMAIL,
          passwordHash,
          role: "admin",
        });
      } else if (admin.role !== "admin") {
        admin.role = "admin";
        await admin.save();
      }

      const token = signToken(admin);
      return res.json({ token, user: toPublicUser(admin) });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.verifyPassword(String(password));
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin login is restricted" });
    }

    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

