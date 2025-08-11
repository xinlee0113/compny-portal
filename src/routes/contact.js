const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// 联系我们页面
router.get('/', contactController.renderIndex);

// 处理项目需求提交
router.post('/project-requirement', contactController.submitProjectRequirement);

// 处理快速咨询提交
router.post('/quick-consultation', contactController.submitQuickConsultation);

module.exports = router;
