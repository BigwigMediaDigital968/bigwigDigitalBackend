const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  uploadEditorImage,
  uploadEditorImageFromUrl,
  listEditorImages,
} = require("../controllers/editorImage.controller");

// Keep the file in memory and stream it straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const handleUpload = (req, res, next) =>
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be under 10MB" : err.message;
    res.status(400).json({ message });
  });

router.post("/upload/editor-image", handleUpload, uploadEditorImage);
router.post("/upload/editor-image-url", uploadEditorImageFromUrl);
router.get("/upload/editor-images", listEditorImages);

module.exports = router;
