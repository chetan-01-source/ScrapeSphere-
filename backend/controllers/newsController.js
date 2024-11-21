const News = require('../models/News');

const getAllNews = async (req, res) => {
  try {
    // Extract 'page' and 'limit' query parameters
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 15; // Default to 15 articles per page

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch news articles with pagination
    const news = await News.find()
  .sort({ createdAt: -1 }) // Sort by the newest articles
  .skip(skip)
  .limit(limit);

    // Get the total count of news articles for pagination metadata
    const totalNews = await News.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalNews / limit);

    // Send the paginated response
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalNews,
      pageSize: news.length,
      news, // Array of articles
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error });
  }
};




module.exports = { getAllNews };
