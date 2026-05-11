const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Employee } = require("../models/Employee");
const { Department } = require("../models/Department");
const { User, USER_ROLES } = require("../models/User");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin", "manager"), async (_req, res, next) => {
  try {
    const items = await Employee.find({})
      .populate("user", "name email role createdAt")
      .populate("department", "name")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { userId, employeeId, departmentId, title, phone, location, dateOfJoining, isActive } = req.body || {};
    if (!userId || !employeeId || !departmentId) {
      return res.status(400).json({ message: "userId, employeeId, departmentId required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "Invalid userId" });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(400).json({ message: "Invalid departmentId" });

    const created = await Employee.create({
      user: user._id,
      employeeId: String(employeeId).trim(),
      department: dept._id,
      title: String(title || "").trim(),
      phone: String(phone || "").trim(),
      location: String(location || "").trim(),
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    });

    const populated = await Employee.findById(created._id)
      .populate("user", "name email role createdAt")
      .populate("department", "name");

    res.status(201).json({ item: populated });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Duplicate employeeId or user already linked" });
    next(err);
  }
});

router.post("/with-user", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      employeeId,
      departmentId,
      title,
      phone,
      location,
      dateOfJoining,
    } = req.body || {};

    if (!name || !email || !password || !employeeId || !departmentId) {
      return res.status(400).json({ message: "name, email, password, employeeId, departmentId required" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(400).json({ message: "Invalid departmentId" });

    const passwordHash = await User.hashPassword(String(password));
    const safeRole = USER_ROLES.includes(role) ? role : "employee";

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: safeRole,
    });

    const employee = await Employee.create({
      user: user._id,
      employeeId: String(employeeId).trim(),
      department: dept._id,
      title: String(title || "").trim(),
      phone: String(phone || "").trim(),
      location: String(location || "").trim(),
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
    });

    const item = await Employee.findById(employee._id)
      .populate("user", "name email role createdAt")
      .populate("department", "name");

    res.status(201).json({ item });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Duplicate email/employeeId" });
    next(err);
  }
});

router.patch("/:id", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId, departmentId, title, phone, location, dateOfJoining, isActive } = req.body || {};

    const update = {
      ...(employeeId !== undefined ? { employeeId: String(employeeId).trim() } : {}),
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
      ...(location !== undefined ? { location: String(location).trim() } : {}),
      ...(dateOfJoining !== undefined ? { dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null } : {}),
      ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
    };

    if (departmentId !== undefined) {
      const dept = await Department.findById(departmentId);
      if (!dept) return res.status(400).json({ message: "Invalid departmentId" });
      update.department = dept._id;
    }

    const updated = await Employee.findByIdAndUpdate(id, update, { new: true })
      .populate("user", "name email role createdAt")
      .populate("department", "name");

    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json({ item: updated });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: "Duplicate employeeId" });
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

