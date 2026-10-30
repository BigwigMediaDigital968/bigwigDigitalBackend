const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  services: [String], // <-- NEW FIELD (Array of selected services)
  message: String,
  status: {
    type: String,
    enum: ["NEW", "CONTACTED", "FOLLOWUP", "COMPLETED", "REJECTED"],
    default: "NEW",
  },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lead", leadSchema);
