const router = require("express").Router();
const {
  newBlogPost,
  getBlog,
  getBlogsByCategory,
  updateBlogPostBySlug,
  deleteBlogPostBySlug,
  updateBlogImageBySlug,
  updateBlogStatus,
  getAdminBlogs,
} = require("../controllers/blog.controller");
const multer = require("multer");

const storage = require("../config/storage");
// Multer's default text-field limit is 1MB, which long blog content can exceed.
const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

router.post("/add", upload.single("coverImage"), newBlogPost);
router.get("/viewblog", getBlog);
router.get("/admin/viewblog", getAdminBlogs);
router.get("/category/:categoryName", getBlogsByCategory);
router.patch("/:slug/status", updateBlogStatus);

router.put("/:slug", upload.single("coverImage"), updateBlogPostBySlug);
router.delete("/:slug", deleteBlogPostBySlug);

router.patch(
  "/:slug/image",
  upload.single("coverImage"),
  updateBlogImageBySlug,
);

module.exports = router;
