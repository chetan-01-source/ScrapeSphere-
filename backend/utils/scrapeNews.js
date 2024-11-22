const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const News = require('../models/News');

// Initialize sentiment analysis library
const sentimentAnalyzer = new Sentiment();

// List of websites with specific selectors
const websites = [
  {
    name: 'NPR',
    url: 'https://www.npr.org/',
    selectors: {
      container: '.story-text',
      title: '.title',
      description: '.teaser',
      url: 'a',
    },
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    selectors: {
      container: 'tr.athing', // Main article row
      title: '.titleline a', // Title text
      description: '.subtext', // No description (optional field)
      url: '.titleline a', // Link to the article
    },
  },
  {
    name: 'NY Times',
    url: 'https://www.nytimes.com/section/world',
    selectors: {
      container: '.css-1l4spti', // Main article container
      title: 'h3', // Title text
      description: 'p', // Description text
      url: 'a', // Link to the article
    },
  },
];

// Scraping and broadcasting new articles to WebSocket clients
const scrapeNews = async (broadcastNewArticles) => {
  console.log('Starting web scraping...');

  for (const site of websites) {
    const { name, url, selectors } = site;

    console.log(`Scraping from: ${name} (${url})`);

    try {
      const { data } = await axios.get(url); // Fetch HTML data
      const $ = cheerio.load(data); // Load HTML into cheerio
      const articles = [];

      // Scrape data from the container
      $(selectors.container).each((i, el) => {
        const title = $(el).find(selectors.title).text().trim();
        let description = $(el).find(selectors.description).text().trim();
        if (description === '') {
          description = title;
        }
        const link = $(el).find(selectors.url).attr('href');

        // Ensure the URL is absolute
        const formattedLink = link && link.startsWith('/')
          ? new URL(link, url).href
          : link;

        if (title && description && formattedLink) {
          // Perform sentiment analysis on the article's title and description
          const sentimentResult = sentimentAnalyzer.analyze(`${title} ${description}`);
          const sentimentScore = sentimentResult.score; // Overall sentiment score
          const sentimentCategory = sentimentScore > 0
            ? 'positive'
            : sentimentScore < 0
            ? 'negative'
            : 'neutral';

          articles.push({
            title,
            description,
            url: formattedLink,
            source: name,
            sentiment: {
              score: sentimentScore,
              category: sentimentCategory,
            },
          });
        }
      });

      console.log(`Found ${articles.length} articles for ${name}`);

      if (articles.length > 0) {
        // Insert articles in smaller batches to avoid timeouts
        const BATCH_SIZE = 5; // Adjust batch size to avoid buffering issues
        for (let i = 0; i < articles.length; i += BATCH_SIZE) {
          const batch = articles.slice(i, i + BATCH_SIZE);

          try {
            await News.insertMany(batch, { ordered: false });
            console.log(`Inserted batch ${i / BATCH_SIZE + 1} for ${name}`);
          } catch (insertError) {
            console.error(
              `Error inserting batch ${i / BATCH_SIZE + 1} for ${name}: ${insertError.message}`
            );
          }
        }

        // After inserting articles, broadcast them to WebSocket clients
        broadcastNewArticles(articles); // Pass the articles to WebSocket for broadcasting
      }
    } catch (error) {
      console.error(`Failed to scrape ${name}: ${error.message}`);
    }
  }

  console.log('Scraping completed.');
};

module.exports = scrapeNews;
