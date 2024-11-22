const express = require("express");
const app = express();
require("dotenv").config();
const cron = require('node-cron');
const mongoose = require("mongoose");
const newsRoutes = require('./routes/newsRoutes');
const scrapeNews = require('./utils/scrapeNews');
let count=1;
const MONGO_URI = process.env.MONGO_URI;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected");

    // Call scrapeNews after MongoDB connection
    try {
      if(count==1){
        console.log("Starting news scraping...");
        await scrapeNews();
      }
   
        cron.schedule('0 0 * * *', async () => {
          console.log('Running scheduled scraper');
          await scrapeNews(); // Call the scraper function
      });
        
      
      
      console.log("News scraping completed.");
    } catch (error) {
      console.error("Error during news scraping:", error.message);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("ScrapeSphere Backend is Running!");
});

// News API routes
app.use('/api/news', newsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
