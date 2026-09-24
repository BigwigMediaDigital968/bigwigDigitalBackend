const cloudinary = require("../config/cloudinary.js");
const EditorImage = require("../modals/editorImage.model.js");

const FOLDER = "editor-images";

// Resize very large images, let Cloudinary pick quality. GIFs keep their
// animation because we don't force a format.
const UPLOAD_OPTIONS = {
  folder: FOLDER,
  resource_type: "image",
  transformation: [{ width: 2000, crop: "limit" }, { quality: "auto" }],
};

// Serve modern formats (webp/avif) automatically to browsers that support them.
const toDeliveryUrl = (secureUrl) =>
  secureUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/");

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      UPLOAD_OPTIONS,
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

const saveAndRespond = async (res, result, meta) => {
  const url = toDeliveryUrl(result.secure_url);

  await EditorImage.create({
    url,
    publicId: result.public_id,
    originalName: meta.originalName,
    size: result.bytes,
    mimeType: meta.mimeType,
    width: result.width,
    height: result.height,
  });

  res.status(201).json({
    url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
};

/* POST /api/upload/editor-image  (multipart, field "image") */
exports.uploadEditorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadBuffer(req.file.buffer);

    await saveAndRespond(res, result, {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

/* POST /api/upload/editor-image-url  { url }
   Copies a remote image (pasted from another site / Google Docs) to Cloudinary
   so the blog does not depend on third-party hosting. */
exports.uploadEditorImageFromUrl = async (req, res) => {
  try {
    const { url } = req.body || {};

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid image URL" });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ message: "Only http(s) URLs are allowed" });
    }

    const result = await cloudinary.uploader.upload(parsed.href, UPLOAD_OPTIONS);

    await saveAndRespond(res, result, {
      originalName: parsed.pathname.split("/").pop() || "remote-image",
      mimeType: result.format ? `image/${result.format}` : undefined,
    });
  } catch (error) {
    console.error("Cloudinary remote upload failed:", error);
    res.status(500).json({ message: "Could not copy image from URL" });
  }
};

/* GET /api/upload/editor-images?page=1&limit=40  — media library */
exports.listEditorImages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const [images, total] = await Promise.all([
      EditorImage.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("url originalName width height createdAt")
        .lean(),
      EditorImage.countDocuments(),
    ]);

    res.status(200).json({ images, total, page, limit });
  } catch (error) {
    console.error("List editor images failed:", error);
    res.status(500).json({ message: "Could not load images" });
  }
};
