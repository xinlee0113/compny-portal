const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');

// 站点地图
router.get('/sitemap.xml', seoController.sitemap);

// Robots.txt
router.get('/robots.txt', seoController.robots);

// SEO分析API
router.get('/api/seo-analysis', seoController.seoAnalysis);

module.exports = router;
