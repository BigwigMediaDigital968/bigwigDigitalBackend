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
const upload = multer({ storage });

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
