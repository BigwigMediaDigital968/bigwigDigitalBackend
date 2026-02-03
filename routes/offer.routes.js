const express = require("express");
const router = express.Router();
const multer = require("multer");

console.log("✅ Offer routes loaded");

const {
  createOffer,
  getOffers,
  getActiveOffer,
  updateOffer,
  deleteOffer,
  incrementView,
  incrementClick,
} = require("../controllers/offer.controller");

const upload = multer({ dest: "uploads/offers" });

// Create offer (single image)
router.post("/offer/add", upload.single("image"), createOffer);

// Get all offers
router.get("/offer/get", getOffers);

// Get active offer
router.get("/offer/active", getActiveOffer);

// Update offer (single image)
router.put("/offer/add/:id", upload.single("image"), updateOffer);

// Soft delete
router.delete("/:id", deleteOffer);

// Increment analytics
router.patch("/:id/view", incrementView);
router.patch("/:id/click", incrementClick);

module.exports = router;
