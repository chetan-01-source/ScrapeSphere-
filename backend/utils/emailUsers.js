const User = require('../models/User'); // Your user schema
const News = require('../models/News'); // Your news schema
const sendEmail = require('./mailer');

const emailUsers = async () => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Fetch the top 2 trending news articles
    const trendingNews = await News.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(2);

    if (!trendingNews.length) {
      console.log("No news articles found for email.");
      return;
    }

    const newsContent = trendingNews
      .map(
        (news) =>
          `<li><a href="${news.url}" target="_blank">${news.title}</a> - ${news.description}</li>`
      )
      .join("");

    // Email content
    const htmlContent = `
      <h1>ScrapeSphere Updates</h1>
      <p>Check out the latest news and updates from ScrapeSphere!</p>
      <h2>Trending News:</h2>
      <ul>${newsContent}</ul>
      <p>Visit <a href="https://scrapesphere-4.onrender.com">ScrapeSphere</a> for more.</p>
    `;

    // Send an email to each user
    for (const user of users) {
      await sendEmail(user.email, "Your ScrapeSphere Updates", htmlContent);
    }

    console.log("Emails sent to all users!");
  } catch (error) {
    console.error("Error sending emails:", error.message);
  }
};

module.exports = emailUsers;
