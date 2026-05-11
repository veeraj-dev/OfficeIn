const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { Employee } = require("../models/Employee");
const { LeaveRequest, LEAVE_STATUSES } = require("../models/LeaveRequest");

const router = express.Router();

router.get("/my", requireAuth, requireRole("employee"), async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.sub });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const items = await LeaveRequest.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "employee",
        populate: [
          { path: "user", select: "name email role" },
          { path: "department", select: "name" },
        ],
      })
      .populate("reviewedBy", "name email role");

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("employee"), async (req, res, next) => {
  try {
    const { from, to, reason } = req.body || {};
    if (!from || !to) return res.status(400).json({ message: "from and to required" });

    const employee = await Employee.findOne({ user: req.user.sub });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid date(s)" });
    }
    if (toDate < fromDate) return res.status(400).json({ message: "`to` must be >= `from`" });

    const created = await LeaveRequest.create({
      employee: employee._id,
      from: fromDate,
      to: toDate,
      reason: String(reason || "").trim(),
    });

    const item = await LeaveRequest.findById(created._id).populate({
      path: "employee",
      populate: [
        { path: "user", select: "name email role" },
        { path: "department", select: "name" },
      ],
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = String(status);

    const items = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "employee",
        populate: [
          { path: "user", select: "name email role" },
          { path: "department", select: "name" },
        ],
      })
      .populate("reviewedBy", "name email role");

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", requireAuth, requireRole("admin", "manager"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body || {};

    if (!status || !LEAVE_STATUSES.includes(String(status))) {
      return res.status(400).json({ message: `status must be one of: ${LEAVE_STATUSES.join(", ")}` });
    }

    const nextStatus = String(status);
    const note = String(reviewNote || "").trim();
    if ((nextStatus === "approved" || nextStatus === "denied") && !note) {
      return res.status(400).json({ message: "reviewNote is required for approved/denied" });
    }

    const updated = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status: nextStatus,
        reviewedBy: req.user.sub,
        reviewedAt: new Date(),
        reviewNote: note,
      },
      { new: true }
    )
      .populate({
        path: "employee",
        populate: [
          { path: "user", select: "name email role" },
          { path: "department", select: "name" },
        ],
      })
      .populate("reviewedBy", "name email role");

    if (!updated) return res.status(404).json({ message: "Leave request not found" });
    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

