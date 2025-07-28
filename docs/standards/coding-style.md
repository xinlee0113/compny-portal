# 代码风格规范

## 🎯 目标

建立统一的代码风格规范，提高代码可读性和维护性。

## 📋 JavaScript代码规范

### 命名规范
```javascript
// ✅ 好的命名
const productSearchService = require('./productSearchService');
const calculateRelevanceScore = (product, query) => {};
const MAX_SEARCH_RESULTS = 100;

// ❌ 避免的命名
const pss = require('./pss');
const calc = (p, q) => {};
const max = 100;
```

### 函数规范
```javascript
// ✅ 函数应该简洁、职责单一
/**
 * 计算产品搜索相关度分数
 * @param {Object} product - 产品对象
 * @param {string} query - 搜索关键词
 * @returns {number} 相关度分数
 */
const calculateRelevanceScore = (product, query) => {
  if (!product || !query) return 0;
  
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // 名称匹配权重最高
  if (product.name.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  return score;
};

// ❌ 避免过于复杂的函数
const processData = (data) => {
  // 100+ 行的复杂逻辑...
};
```

### 错误处理规范
```javascript
// ✅ 统一的错误处理
exports.searchProducts = async (req, res) => {
  try {
    const result = await productService.search(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('搜索产品失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

### 注释规范
```javascript
/**
 * 产品搜索服务类
 * 提供产品搜索、筛选、排序等功能
 */
class ProductSearchService {
  /**
   * 搜索产品
   * @param {Object} options - 搜索选项
   * @param {string} options.query - 搜索关键词
   * @param {string} options.category - 产品分类
   * @param {string} options.sort - 排序方式
   * @returns {Promise<Array>} 搜索结果
   */
  async searchProducts(options) {
    // 实现搜索逻辑
  }
}
```

## 📝 文件组织规范

### 目录结构
```
src/
├── controllers/     # 控制器层
├── models/         # 数据模型层
├── routes/         # 路由层
├── middleware/     # 中间件
├── services/       # 服务层 (新增)
├── utils/          # 工具函数
├── config/         # 配置文件
└── views/          # 视图模板
```

### 文件命名规范
- 使用小驼峰命名：`productController.js`
- 测试文件：`productController.test.js`
- 常量文件：`constants.js`
- 配置文件：`database.config.js`

## 🧪 测试规范

### 测试文件结构
```javascript
/**
 * 产品控制器测试
 */
const request = require('supertest');
const app = require('../../src/server');

describe('Product Controller', () => {
  describe('GET /api/products/search', () => {
    test('应该返回搜索结果', async () => {
      const response = await request(app)
        .get('/api/products/search?q=智能')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
    
    test('应该处理无效查询', async () => {
      const response = await request(app)
        .get('/api/products/search?q=')
        .expect(200);
        
      expect(response.body.success).toBe(true);
    });
  });
});
```

### 测试命名规范
- 描述行为：`应该返回搜索结果`
- 描述场景：`当输入无效参数时应该返回错误`
- 描述预期：`应该包含正确的字段`

## 🔧 Git规范

### 提交信息格式
```
类型(范围): 简短描述

详细描述

相关issue: #123
```

### 提交类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或配置更新

### 示例
```
feat(search): 添加产品搜索功能

- 实现关键词搜索
- 支持分类筛选
- 添加相关度排序

相关issue: #456
```

## 📊 代码质量检查

### ESLint规则
使用项目中的`.eslintrc.js`配置，主要规则：
- 2空格缩进
- 使用单引号
- 分号结尾
- 禁用未使用变量
- 强制一致的花括号风格

### Prettier格式化
使用`.prettierrc.js`自动格式化代码：
```bash
npm run format  # 格式化所有文件
npm run lint:fix # 修复ESLint问题
```

## 🚀 性能规范

### 避免常见性能问题
```javascript
// ✅ 缓存计算结果
const memoizedCalculation = memoize((input) => {
  return expensiveCalculation(input);
});

// ✅ 使用适当的数据结构
const productMap = new Map(products.map(p => [p.id, p]));

// ❌ 避免在循环中重复计算
products.forEach(product => {
  const score = calculateComplexScore(); // 每次都计算
});
```

### 数据库查询优化
```javascript
// ✅ 使用索引字段查询
const products = await Product.find({ category: 'core' }).limit(10);

// ✅ 避免N+1查询
const productsWithFeatures = await Product.find().populate('features');
```

## 📚 文档规范

### README结构
```markdown
# 项目名称

## 项目描述
## 快速开始
## API文档
## 开发指南
## 部署说明
## 贡献指南
```

### API文档格式
```javascript
/**
 * @api {get} /api/products/search 搜索产品
 * @apiName SearchProducts
 * @apiGroup Product
 * 
 * @apiParam {String} [q] 搜索关键词
 * @apiParam {String} [category] 产品分类
 * @apiParam {String} [sort] 排序方式
 * 
 * @apiSuccess {Boolean} success 操作是否成功
 * @apiSuccess {Array} data 产品列表
 * @apiSuccess {Number} total 结果总数
 */
```

---

*版本: v1.0*  
*更新时间: 2025-01-28*