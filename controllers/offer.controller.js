const Offer = require("../modals/offer.model");

/**
 * GET ALL OFFERS (ADMIN)
 */
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ deleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, offers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * CREATE OFFER
 */
const createOffer = async (req, res) => {
  try {
    const { title, subtitle, ctaLabel, ctaLink, startDate, endDate, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Offer image is required" });
    }

    const offer = await Offer.create({
      title,
      subtitle,
      ctaLabel,
      ctaLink,
      image: req.file.path,
      startDate,
      endDate,
      isActive,
    });

    return res.status(201).json({ success: true, offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET ACTIVE OFFER (FRONTEND POPUP)
 */
const getActiveOffer = async (req, res) => {
  try {
    const today = new Date();

    const offer = await Offer.findOne({
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
      deleted: { $ne: true },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE OFFER
 */
const updateOffer = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });

    return res.status(200).json({ success: true, offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE OFFER (SOFT DELETE)
 */
const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndUpdate(req.params.id, { deleted: true });
    return res.status(200).json({ success: true, message: "Offer deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ANALYTICS
 */
const incrementView = async (req, res) => {
  await Offer.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  return res.json({ success: true });
};

const incrementClick = async (req, res) => {
  await Offer.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
  return res.json({ success: true });
};

module.exports = {
  createOffer,
  getOffers,
  getActiveOffer,
  updateOffer,
  deleteOffer,
  incrementView,
  incrementClick,
};
