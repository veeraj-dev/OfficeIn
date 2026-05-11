const express = require("express");
const { Department } = require("../models/Department");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const items = await Department.find({}).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: "name required" });

    const created = await Department.create({
      name: String(name).trim(),
      description: String(description || "").trim(),
    });

    res.status(201).json({ item: created });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Department already exists" });
    next(err);
  }
});

router.patch("/:id", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};

    const updated = await Department.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description: String(description).trim() } : {}),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Department not found" });
    res.json({ item: updated });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Department already exists" });
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Department not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

