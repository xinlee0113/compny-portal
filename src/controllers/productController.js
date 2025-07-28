/**
 * 产品控制器
 * 处理产品相关的请求和响应
 */

const Product = require('../models/Product');

// 创建产品模型实例
const productModel = new Product();

/**
 * 获取所有产品
 */
exports.getAllProducts = (req, res) => {
  try {
    const products = productModel.getAllProducts();
    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      error: error.message
    });
  }
};

/**
 * 根据ID获取单个产品
 */
exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = productModel.getProductById(id);
        
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品未找到'
      });
    }
        
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品详情失败',
      error: error.message
    });
  }
};

/**
 * 搜索产品
 */
exports.searchProducts = (req, res) => {
  try {
    const {
      q: query = '',
      category = '',
      sort = 'relevance',
      limit = 50
    } = req.query;

    // 参数验证
    const validSortOptions = ['name', 'relevance', 'date'];
    const sortOption = validSortOptions.includes(sort) ? sort : 'relevance';
    const limitNumber = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

    // 执行搜索
    const searchOptions = {
      query,
      category,
      sort: sortOption,
      limit: limitNumber
    };

    const results = productModel.searchProducts(searchOptions);

    // 记录搜索日志
    console.log(`产品搜索 - 查询: "${query}", 分类: "${category}", 排序: "${sortOption}", 结果数: ${results.length}`);

    res.json({
      success: true,
      data: results,
      total: results.length,
      query: {
        keyword: query,
        category,
        sort: sortOption,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error('产品搜索失败:', error);
    res.status(500).json({
      success: false,
      message: '产品搜索失败',
      error: error.message
    });
  }
};

/**
 * 获取产品分类
 */
exports.getCategories = (req, res) => {
  try {
    const categories = productModel.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取产品分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品分类失败',
      error: error.message
    });
  }
};

/**
 * 获取搜索建议
 */
exports.getSearchSuggestions = (req, res) => {
  try {
    const { q: query = '', limit = 5 } = req.query;
        
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const limitNumber = Math.min(Math.max(parseInt(limit) || 5, 1), 10);
    const suggestions = productModel.getSearchSuggestions(query.trim(), limitNumber);

    res.json({
      success: true,
      data: suggestions,
      query: query.trim()
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    res.status(500).json({
      success: false,
      message: '获取搜索建议失败',
      error: error.message
    });
  }
};

/**
 * 渲染产品页面（更新版本，支持搜索）
 */
exports.renderProductsPage = (req, res) => {
  try {
    // 获取查询参数
    const {
      q: query = '',
      category = '',
      sort = 'relevance'
    } = req.query;

    // 获取所有分类
    const categories = productModel.getCategories();
        
    // 执行搜索或获取所有产品
    let products;
    if (query || category) {
      products = productModel.searchProducts({
        query,
        category,
        sort,
        limit: 50
      });
    } else {
      products = productModel.getAllProducts().map(product => ({
        ...product,
        relevanceScore: 1
      }));
    }

    res.render('home/products', {
      title: '产品展示',
      page: 'products',
      products,
      categories,
      currentQuery: query,
      currentCategory: category,
      currentSort: sort,
      hasSearchResults: !!(query || category)
    });
  } catch (error) {
    console.error('渲染产品页面失败:', error);
    res.status(500).render('500', {
      title: '服务器错误',
      page: 'error'
    });
  }
}; 