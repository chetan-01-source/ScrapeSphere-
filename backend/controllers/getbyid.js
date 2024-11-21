const News = require('../models/News');
const getNewsById = async (req, res) => {
    try {
      const { id } = req.params; // Extract the article ID from URL params
  
      // Find the article by its _id
      const news = await News.findById(id);
  
      if (!news) {
        return res.status(404).json({ message: 'Article not found' });
      }
  
      // Return the article data
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching article by ID', error });
    }
  };
  
  module.exports = { getNewsById };
  