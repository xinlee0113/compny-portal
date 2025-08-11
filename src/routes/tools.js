const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');

// 开发框架展示
router.get('/development-framework', toolsController.developmentFramework);

// SDK工具链
router.get('/sdk-toolchain', toolsController.sdkToolchain);

// 开发环境配置
router.get('/dev-environment', toolsController.devEnvironment);

module.exports = router;
