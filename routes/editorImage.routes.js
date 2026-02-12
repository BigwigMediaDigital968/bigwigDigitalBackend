const express = require("express");
const router = express.Router();
const { uploadEditorImage } = require("../controllers/editorImage.controller");

router.post("/upload/editor-image", uploadEditorImage);

module.exports = router;
