/**
 * 产品数据模型
 * 管理产品数据和搜索功能
 */

class Product {
  constructor() {
    // 示例产品数据
    this.products = [
      {
        id: 'product-001',
        name: '核心产品A',
        description:
          '这是我们的核心产品A，具有高性能、高可靠性等特点，广泛应用于各行各业。',
        features: ['高性能处理能力', '易于集成', '安全可靠'],
        category: '核心产品',
        tags: ['高性能', '可靠性', '安全', '企业级'],
        created_at: new Date('2024-01-15'),
      },
      {
        id: 'product-002',
        name: '核心产品B',
        description:
          '产品B是我们专为特定行业设计的解决方案，具有定制化程度高、适应性强等优势。',
        features: ['高度定制化', '灵活配置', '易于维护'],
        category: '核心产品',
        tags: ['定制化', '灵活', '行业解决方案'],
        created_at: new Date('2024-02-20'),
      },
      {
        id: 'product-003',
        name: '核心产品C',
        description:
          '产品C是我们最新推出的一款创新型产品，采用先进技术，满足未来发展趋势。',
        features: ['创新技术', '节能环保', '智能控制'],
        category: '核心产品',
        tags: ['创新', '环保', '智能', '未来技术'],
        created_at: new Date('2024-03-10'),
      },
      {
        id: 'solution-001',
        name: '制造业数字化转型解决方案',
        description:
          '专为制造业打造的数字化转型完整解决方案，提升生产效率和管理水平。',
        features: ['生产自动化', '数据分析', '智能调度'],
        category: '行业解决方案',
        tags: ['制造业', '数字化', '自动化', '效率'],
        created_at: new Date('2024-04-05'),
      },
      {
        id: 'solution-002',
        name: '智慧城市解决方案',
        description:
          '构建智慧城市的综合性解决方案，涵盖交通、安防、环保等多个领域。',
        features: ['智能交通', '安防监控', '环境监测'],
        category: '行业解决方案',
        tags: ['智慧城市', '交通', '安防', '环保'],
        created_at: new Date('2024-05-15'),
      },
      {
        id: 'solution-003',
        name: '金融科技解决方案',
        description: '为金融机构提供安全、高效的科技解决方案，支持数字化转型。',
        features: ['风险控制', '数据安全', '业务创新'],
        category: '行业解决方案',
        tags: ['金融', '安全', '创新', '风控'],
        created_at: new Date('2024-06-01'),
      },
      {
        id: 'service-001',
        name: '系统集成服务',
        description:
          '专业的系统集成服务，帮助企业整合各类技术系统，提升整体效率。',
        features: ['系统整合', '技术咨询', '实施部署'],
        category: '技术服务',
        tags: ['系统集成', '咨询', '部署'],
        created_at: new Date('2024-07-10'),
      },
      {
        id: 'service-002',
        name: '技术咨询与支持',
        description:
          '提供专业的技术咨询和全方位的技术支持服务，保障系统稳定运行。',
        features: ['专业咨询', '24/7支持', '远程维护'],
        category: '技术服务',
        tags: ['咨询', '支持', '维护'],
        created_at: new Date('2024-08-20'),
      },
      {
        id: 'service-003',
        name: '培训与认证服务',
        description: '为客户提供专业的技术培训和认证服务，提升团队技术能力。',
        features: ['专业培训', '技能认证', '在线学习'],
        category: '技术服务',
        tags: ['培训', '认证', '学习', '技能'],
        created_at: new Date('2024-09-15'),
      },
    ];
  }

  /**
   * 获取所有产品
   */
  getAllProducts() {
    return this.products;
  }

  /**
   * 根据ID获取产品
   */
  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  /**
   * 获取所有产品分类
   */
  getCategories() {
    const categories = [
      ...new Set(this.products.map(product => product.category)),
    ];
    return categories;
  }

  /**
   * 搜索产品
   * @param {Object} options 搜索选项
   * @param {string} options.query 搜索关键词
   * @param {string} options.category 产品分类
   * @param {string} options.sort 排序方式 (name|relevance|date)
   * @param {number} options.limit 返回结果数量限制
   */
  searchProducts(options = {}) {
    const {
      query = '',
      category = '',
      sort = 'relevance',
      limit = 50,
    } = options;

    let results = [...this.products];

    // 分类筛选
    if (category && category !== 'all') {
      results = results.filter(product => product.category === category);
    }

    // 关键词搜索
    if (query.trim()) {
      const searchQuery = query.toLowerCase().trim();
      results = results
        .map(product => ({
          ...product,
          relevanceScore: this.calculateRelevanceScore(product, searchQuery),
        }))
        .filter(product => product.relevanceScore > 0);
    } else {
      // 如果没有搜索词，给所有产品默认相关度分数
      results = results.map(product => ({ ...product, relevanceScore: 1 }));
    }

    // 排序
    switch (sort) {
    case 'name':
      results.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      break;
    case 'date':
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'relevance':
    default:
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      break;
    }

    // 限制结果数量
    if (limit > 0) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * 计算产品相关度分数
   * @param {Object} product 产品对象
   * @param {string} query 搜索查询
   */
  calculateRelevanceScore(product, query) {
    let score = 0;
    const queryWords = query.split(/\s+/);

    queryWords.forEach(word => {
      if (!word) return;

      // 产品名称匹配（权重：10）
      if (product.name.toLowerCase().includes(word)) {
        score += 10;
      }

      // 描述匹配（权重：5）
      if (product.description.toLowerCase().includes(word)) {
        score += 5;
      }

      // 特性匹配（权重：8）
      product.features.forEach(feature => {
        if (feature.toLowerCase().includes(word)) {
          score += 8;
        }
      });

      // 标签匹配（权重：6）
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(word)) {
          score += 6;
        }
      });

      // 分类匹配（权重：3）
      if (product.category.toLowerCase().includes(word)) {
        score += 3;
      }
    });

    return score;
  }

  /**
   * 获取搜索建议
   * @param {string} query 搜索查询
   * @param {number} limit 建议数量限制
   */
  getSearchSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];

    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    this.products.forEach(product => {
      // 从产品名称提取建议
      if (product.name.toLowerCase().includes(queryLower)) {
        suggestions.add(product.name);
      }

      // 从标签提取建议
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });

      // 从分类提取建议
      if (product.category.toLowerCase().includes(queryLower)) {
        suggestions.add(product.category);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

module.exports = Product;
