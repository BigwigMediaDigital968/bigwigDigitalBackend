const express = require("express");
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  getAllLeads,
  getLeadsLast10Days,
  bulkDeleteLeads,
  deleteLead,
  createLead,
  updateLead,
  updateLeadStatus,
} = require("../controllers/leadController");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/create-lead", verifyRecaptcha, createLead);

router.get("/all", getAllLeads);
router.get("/last10days", getLeadsLast10Days);

// Update entire lead content
router.put("/:id", updateLead);

// Quick update for lead status only
router.patch("/:id/status", updateLeadStatus);

router.delete("/bulk/delete", bulkDeleteLeads);
router.delete("/:id", deleteLead);

module.exports = router;