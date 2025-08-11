const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');

// 车载应用开发服务
router.get('/automotive-development', servicesController.renderAutomotiveDevelopment);

// 系统集成服务
router.get('/system-integration', servicesController.renderSystemIntegration);

// 测试验证服务
router.get('/testing-validation', servicesController.renderTestingValidation);

module.exports = router;
