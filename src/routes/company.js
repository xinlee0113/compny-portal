const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// 团队介绍页面
router.get('/team', companyController.team);

// 服务定价页面
router.get('/pricing', companyController.pricing);

// 公司文化页面
router.get('/culture', companyController.culture);

// 职业发展页面
router.get('/careers', companyController.careers);

module.exports = router;
