const cloudinary = require("../config/cloudinary.js");
const EditorImage = require("../modals/editorImage.model.js");

exports.uploadEditorImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const file = req.files.image;

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "editor-images",
      resource_type: "image",
      format: "webp",
      transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }],
    });

    // Save metadata
    await EditorImage.create({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.name,
      size: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user?._id || null,
    });

    res.status(201).json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
