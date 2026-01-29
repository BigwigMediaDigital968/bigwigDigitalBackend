// route/analyticsRoute.js
const express = require("express");
const router = express.Router();
const {
  getAnalyticsData,
  SummaryData,
} = require("../controllers/analyticsController");

router.get("/analytics-data", getAnalyticsData);
router.get("/summary-data", SummaryData);

module.exports = router;
