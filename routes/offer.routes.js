const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const {
  createOffer,
  getOffers,
  getActiveOffer,
  updateOffer,
  deleteOffer,
  incrementView,
  incrementClick,
} = require("../controllers/offer.controller");

router.post("/offer/add", upload.single("image"), createOffer);
router.get("/offer/get", getOffers);
router.get("/offer/active", getActiveOffer);
router.put("/offer/add/:id", upload.single("image"), updateOffer);
router.delete("/:id", deleteOffer);
router.patch("/:id/view", incrementView);
router.patch("/:id/click", incrementClick);

module.exports = router;
