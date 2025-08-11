const express = require('express');
const router = express.Router();
const caseStudiesController = require('../controllers/caseStudiesController');

// 案例研究列表页面
router.get('/', caseStudiesController.renderIndex);

// 具体案例详情页面
router.get('/:id', caseStudiesController.renderCaseDetail);

module.exports = router;
