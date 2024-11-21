const News = require('../models/News');
const getNewsBySource = async (req, res) => {
    
    try {
      // Correctly access 'source' parameter from URL (case-insensitive)
      const { source } = req.params;
      const sourceRegex = new RegExp(`^${source}$`, 'i'); // Case-insensitive search
   
      // Handle pagination defaults and parsing
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 15;
  
    //   // Efficiently count total articles for this source
      const totalNews = await News.countDocuments({ source: sourceRegex });
  
    //   // Calculate total pages (ensure positive number)
      const totalPages = Math.ceil(Math.max(totalNews, 1) / pageSize);
  
      // Fetch filtered news with pagination
      const news = await News.find({ source: sourceRegex})
        .skip((page - 1) * pageSize)
        .limit(pageSize) // Ensure valid limit (avoid 0)
        .sort({ _id: -1 }); // Sorting by most recent (_id descending)
        console.log(news);
  
      // Return paginated response
      res.status(200).json({
        currentPage: page,
        totalPages,
        totalNews,
        pageSize,
        news,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching news by source', error });
    }
  };
  
  module.exports = { getNewsBySource };