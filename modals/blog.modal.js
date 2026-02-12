const mongoose = require("mongoose");

/* ---------------- FAQ Schema ---------------- */
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

/* ---------------- Breadcrumb Schema ---------------- */
const breadcrumbSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    position: Number,
  },
  { _id: false },
);

/* ---------------- Main Blog Schema ---------------- */
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
  },

  excerpt: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  coverImage: {
    type: String,
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  },

  category: {
    type: String,
    required: true,
    enum: [
      "Search Engine Optimization",
      "Social Media Marketing",
      "Performance Marketing",
      "Content Marketing",
      "Website Designing & Development",
      "Email Marketing",
      "Social Media Optimization",
      "Graphic Designing",
      "AI and CGI Marketing",
      "Landing Page Optimization",
      "Affiliate Marketing",
      "Video Shoot",
      "Public Relations",
      "Influencer Marketing",
      "Online Reputation Management",
      "Digital Marketing",
    ],
    default: "Digital Marketing",
  },

  /* ---------------- FAQs (For UI + FAQ Schema) ---------------- */
  faqs: {
    type: [faqSchema],
    default: [],
  },

  /* ---------------- Breadcrumb Data ---------------- */
  breadcrumbs: {
    type: [breadcrumbSchema],
    default: [],
  },

  /* ---------------- Schema Flags ---------------- */
  schemaSettings: {
    article: { type: Boolean, default: true },
    breadcrumb: { type: Boolean, default: true },
    faq: { type: Boolean, default: true },
    organization: { type: Boolean, default: true },
    speakable: { type: Boolean, default: false },
    video: { type: Boolean, default: false },
    image: { type: Boolean, default: true },
  },

  /* ---------------- Custom / Extra JSON-LD ---------------- */
  customSchemas: {
    type: [Object], // any extra JSON-LD blocks
    default: [],
  },

  likes: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED", "INACTIVE"],
    default: "DRAFT",
  },

  datePublished: {
    type: Date,
    default: Date.now,
  },

  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/* ---------------- Auto Update lastUpdated ---------------- */
blogPostSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
