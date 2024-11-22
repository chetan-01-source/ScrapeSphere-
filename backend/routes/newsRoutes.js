const express = require('express');
const router = express.Router();

// Importing necessary controllers
const { getAllNews } = require('../controllers/newsController');
const { getNewsBySource } = require('../controllers/getNewsBySource ');
const { getNewsById } = require('../controllers/getbyid');
const { searchNews } = require('../controllers/searchNews ');

// Importing the authentication middleware
const authenticate = require('../controllers/authenticate');

// Public route (no authentication required)
router.get('/', getAllNews); // This can remain open for everyone

// Protected route (authentication required)
router.get('/search', authenticate, searchNews); // Protecting search route

// Protected route (authentication required)
router.get('/:source', authenticate, getNewsBySource); // Protecting news by source route

// Protected route (authentication required)
router.get('/id/:id', authenticate, getNewsById); // Protecting news by ID route

module.exports = router;
