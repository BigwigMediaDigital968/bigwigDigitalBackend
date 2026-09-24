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
  // markLead,
} = require("../controllers/leadController");
const verifyRecaptcha = require("../middleware/verifyRecaptcha");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/create-lead", verifyRecaptcha, createLead);
router.get("/all", getAllLeads);
router.get("/last10days", getLeadsLast10Days);
// router.put("/:id/mark", markLead);

router.delete("/:id", deleteLead);

router.delete("/bulk/delete", bulkDeleteLeads);

module.exports = router;
