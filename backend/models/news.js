const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, },
  description: { type: String },
  url: { type: String, required: true,unique: true  },
  publishedAt: { type: Date },
  source: { type: String }
});
newsSchema.index({ title: "text", description: "text" }); 

const News = mongoose.models.News || mongoose.model('News', newsSchema);
module.exports = News;
