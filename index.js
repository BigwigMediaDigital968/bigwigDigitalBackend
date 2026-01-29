const express = require("express");
const cors = require("cors");
const blogRoutes = require("./routes/blog.route");
const leadRoutes = require("./routes/leadRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const analyticsRoute = require("./routes/analyticsRoute");

require("dotenv").config();

const { connect } = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/", blogRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api", jobApplicationRoutes);
app.use("/api", jobRoutes);
app.use("/api/google", analyticsRoute);

// Connect DB and start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  try {
    await connect();
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }

  console.log(`🚀 Server running on port ${PORT}`);
});
