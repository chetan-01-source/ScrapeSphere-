const News = require('../models/News');

const searchNews = async (req, res) => {
    console.log("entered here");
    try {
        const { query } = req.query;
        console.log('Received query:', query);

        const { page = 1, pageSize = 15 } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = {    $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]};
        console.log('Search query:', searchQuery);

        const totalNews = await News.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalNews / pageSize);

        const news = await News.find(searchQuery)
            .skip((page - 1) * pageSize)
            .limit(parseInt(pageSize))
            .sort({ _id: -1 });
        

        res.status(200).json({
            currentPage: parseInt(page),
            totalPages,
            totalNews,
            pageSize: parseInt(pageSize),
            news,
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ message: "Error fetching search results", error });
    }
};
module.exports = {searchNews};
