const express = require("express");
const app = express();
require("dotenv").config();
const cron = require('node-cron');
const mongoose = require("mongoose");
const WebSocket = require('ws'); // Import WebSocket
const newsRoutes = require('./routes/newsRoutes');
const scrapeNews = require('./utils/scrapeNews');
let count = 1;
const MONGO_URI = process.env.MONGO_URI;
const authRoutes = require("./routes/authRoutes");
const emailUsers = require('./utils/emailUsers');

// Create an HTTP server and attach WebSocket server to it
const http = require('http');
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send a welcome message when a client connects
  ws.send(JSON.stringify({ message: 'Welcome to ScrapeSphere WebSocket!' }));

  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected");

    // Call scrapeNews after MongoDB connection
    try {
      if (count === 1) {
        console.log("Starting initial news scraping...");
        await updatedScrapeNews();
      }

      // Set up cron job to scrape news every 10 minutes
      cron.schedule('*/10 * * * *', async () => {
        console.log('Running scheduled scraper every 10 minutes');
        await updatedScrapeNews(); // Call the scraper function
      });

      console.log("News scraping completed.");
    } catch (error) {
      console.error("Error during news scraping:", error.message);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Schedule email notifications at midnight daily
cron.schedule('*/45 * * * *', async () => {
  console.log("Sending daily email updates...");
  await emailUsers();
});

// WebSocket Broadcast - Broadcasting new articles to clients
const broadcastNewArticles = (newArticles) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ newArticles }));
    }
  });
};

// Updated ScrapeNews - Scrapes the news and broadcasts to clients
const updatedScrapeNews = async () => {
  try {
    const articles = await scrapeNews(broadcastNewArticles); // Pass broadcastNewArticles to scrapeNews

    if (articles.length > 0) {
      console.log("Broadcasting new articles...");
      broadcastNewArticles(articles); // Broadcasting new articles to WebSocket clients
    }
  } catch (error) {
    console.error("Error during scraping:", error.message);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/news', newsRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("ScrapeSphere Backend is Running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
