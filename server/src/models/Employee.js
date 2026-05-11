const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    employeeId: { type: String, required: true, trim: true, unique: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true, index: true },
    title: { type: String, default: "", trim: true, maxlength: 120 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    location: { type: String, default: "", trim: true, maxlength: 120 },
    dateOfJoining: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = { Employee };

