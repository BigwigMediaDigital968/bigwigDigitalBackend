const BlogPost = require("../modals/blog.modal");

const parseJSON = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch {
    return fallback;
  }
};

/* --------------------------------------------------
   CREATE BLOG POST
-------------------------------------------------- */
exports.newBlogPost = async (req, res) => {
  try {
    const { title, slug, excerpt, content, author, tags, category, status } =
      req.body;

    if (!title || !slug || !excerpt || !content || !author || !category) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    if (!req.file || (!req.file.secure_url && !req.file.path)) {
      return res.status(400).json({ error: "Cover image is required." });
    }

    const coverImage = req.file.secure_url || req.file.path;

    /* ---------------- Parse FormData JSON ---------------- */
    const faqs = Array.isArray(parseJSON(req.body.faqs, []))
      ? parseJSON(req.body.faqs, [])
      : [];

    const breadcrumbs = Array.isArray(parseJSON(req.body.breadcrumbs, []))
      ? parseJSON(req.body.breadcrumbs, [])
      : [];

    const schemaSettings =
      typeof parseJSON(req.body.schemaSettings, {}) === "object"
        ? parseJSON(req.body.schemaSettings, {})
        : {};

    const customSchemas = Array.isArray(parseJSON(req.body.customSchemas, []))
      ? parseJSON(req.body.customSchemas, [])
      : [];

    const formattedTags = tags ? tags.split(",").map((t) => t.trim()) : [];

    const blogPost = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      author,
      category,
      coverImage,
      tags: formattedTags,
      faqs,
      breadcrumbs,
      schemaSettings,
      customSchemas,
      status: status || "DRAFT",
    });

    await blogPost.save();

    res.status(201).json({
      message: "Blog post created successfully",
      blogPost,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* --------------------------------------------------
   GET ALL BLOGS
-------------------------------------------------- */
// For Admin
exports.getAdminBlogs = async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({
      datePublished: -1,
    });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Fetch blogs error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// For Website
exports.getBlog = async (req, res) => {
  try {
    const blogs = await BlogPost.find({
      status: "PUBLISHED",
    }).sort({
      datePublished: -1,
    });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Fetch blogs error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* --------------------------------------------------
   GET BLOGS BY CATEGORY
-------------------------------------------------- */
exports.getBlogsByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.categoryName;
    const categoryName = categorySlug.replace(/-/g, " ");

    const blogs = await BlogPost.find({
      category: new RegExp(`^${categoryName}$`, "i"),
      status: "PUBLISHED",
    }).sort({ datePublished: -1 });

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* --------------------------------------------------
   UPDATE BLOG BY SLUG
-------------------------------------------------- */
exports.updateBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const updateFields = {};

    const { title, content, author, excerpt, tags, category, status } =
      req.body;

    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
    if (author) updateFields.author = author;
    if (excerpt) updateFields.excerpt = excerpt;
    if (category) updateFields.category = category;

    if (tags) {
      updateFields.tags = tags.split(",").map((t) => t.trim());
    }

    if (status) {
      updateFields.status = status;

      if (status === "PUBLISHED") {
        updateFields.datePublished = new Date();
      }
    }

    /* ---------------- Parse JSON fields ---------------- */
    if (req.body.faqs) updateFields.faqs = parseJSON(req.body.faqs, []);

    if (req.body.breadcrumbs)
      updateFields.breadcrumbs = parseJSON(req.body.breadcrumbs, []);

    if (req.body.schemaSettings)
      updateFields.schemaSettings = parseJSON(
        req.body.schemaSettings,
        undefined,
      );

    const parsedCustomSchemas = parseJSON(req.body.customSchemas, null);
    if (Array.isArray(parsedCustomSchemas)) {
      updateFields.customSchemas = parsedCustomSchemas;
    }

    if (req.file && (req.file.secure_url || req.file.path)) {
      updateFields.coverImage = req.file.secure_url || req.file.path;
    }

    updateFields.lastUpdated = Date.now();

    const updatedBlog = await BlogPost.findOneAndUpdate(
      { slug },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedBlog) {
      return res.status(404).json({ msg: "Blog post not found" });
    }

    res.status(200).json({
      msg: "Blog post updated successfully",
      blogPost: updatedBlog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* --------------------------------------------------
   DELETE BLOG BY SLUG
-------------------------------------------------- */
exports.deleteBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const deletedBlog = await BlogPost.findOneAndDelete({ slug });

    if (!deletedBlog) {
      return res.status(404).json({
        msg: "Blog post not found",
      });
    }

    res.status(200).json({
      msg: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

/* --------------------------------------------------
   UPDATE ONLY COVER IMAGE
-------------------------------------------------- */
exports.updateBlogImageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!req.file || (!req.file.secure_url && !req.file.path)) {
      return res.status(400).json({
        message: "No image file uploaded",
      });
    }

    const imageUrl = req.file.secure_url || req.file.path;

    const updatedBlog = await BlogPost.findOneAndUpdate(
      { slug },
      {
        coverImage: imageUrl,
        lastUpdated: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json({
      message: "Cover image updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Cover image update error:", error);
    res.status(500).json({
      message: "Error updating cover image",
    });
  }
};

// Blog Status Update
exports.updateBlogStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    if (!["DRAFT", "PUBLISHED", "INACTIVE"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const updateData = {
      status,
      lastUpdated: new Date(),
    };

    if (status === "PUBLISHED") {
      updateData.datePublished = new Date();
    }

    const updatedBlog = await BlogPost.findOneAndUpdate({ slug }, updateData, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    res.status(200).json({
      msg: "Status updated successfully",
      blogPost: updatedBlog,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};
