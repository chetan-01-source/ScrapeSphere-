const express = require('express');
const router = express.Router();
const { getAllNews } = require('../controllers/newsController');
const { getNewsBySource } = require('../controllers/getNewsBySource ')
const{getNewsById}=require('../controllers/getbyid');
const{searchNews}=require('../controllers/searchNews ')

router.get('/', getAllNews);
router.get('/search', searchNews);
router.get('/:source', getNewsBySource);
router.get('/id/:id',getNewsById);

module.exports = router;
