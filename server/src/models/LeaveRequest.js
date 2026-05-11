const mongoose = require("mongoose");

const LEAVE_STATUSES = ["pending", "approved", "denied", "cancelled"];

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    from: { type: Date, required: true, index: true },
    to: { type: Date, required: true, index: true },
    reason: { type: String, default: "", trim: true, maxlength: 500 },
    status: { type: String, enum: LEAVE_STATUSES, default: "pending", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "", trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

module.exports = { LeaveRequest, LEAVE_STATUSES };

