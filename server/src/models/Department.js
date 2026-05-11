const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, default: "", trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);

module.exports = { Department };

