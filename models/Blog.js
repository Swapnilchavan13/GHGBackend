// models/Blog.js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  category: { type: String, required: true },
  description: { type: String },
  views: { type: Number, default: 0 },
  image: { type: String, required: true },
  link: { type: String, default: "#" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to auto-update updatedAt
blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
