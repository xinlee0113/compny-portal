/**
 * 产品数据库模型
 * 企业级产品管理，支持全文搜索、定价、库存等功能
 */

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '产品唯一标识',
      },

      // 基本信息
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, 255],
        },
        comment: '产品名称',
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 255],
          is: /^[a-z0-9-]+$/,
        },
        comment: 'URL友好标识',
      },

      sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        comment: '产品SKU编码',
      },

      short_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '简短描述',
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '详细描述',
      },

      // 分类关联
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        comment: '产品分类ID',
      },

      // 价格信息
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: '产品价格',
      },

      sale_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
        comment: '促销价格',
      },

      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
        comment: '成本价格',
      },

      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'CNY',
        validate: {
          len: [3, 3],
        },
        comment: '货币代码',
      },

      // 库存管理
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: '库存数量',
      },

      low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        comment: '低库存警告阈值',
      },

      manage_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否管理库存',
      },

      stock_status: {
        type: DataTypes.ENUM('in_stock', 'out_of_stock', 'on_backorder'),
        defaultValue: 'in_stock',
        comment: '库存状态',
      },

      // 产品属性
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        comment: '重量(kg)',
      },

      dimensions: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '尺寸信息 {length, width, height}',
      },

      // 状态控制
      status: {
        type: DataTypes.ENUM('draft', 'published', 'private', 'trash'),
        defaultValue: 'draft',
        comment: '产品状态',
      },

      visibility: {
        type: DataTypes.ENUM('visible', 'catalog', 'search', 'hidden'),
        defaultValue: 'visible',
        comment: '可见性',
      },

      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否推荐',
      },

      is_virtual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否虚拟产品',
      },

      is_downloadable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否可下载',
      },

      // 媒体文件
      featured_image: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true,
        },
        comment: '主图片URL',
      },

      gallery_images: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: '图片库',
      },

      // SEO优化
      meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SEO标题',
      },

      meta_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'SEO描述',
      },

      meta_keywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SEO关键词',
      },

      // 搜索和标签
      tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: '产品标签',
      },

      search_keywords: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '搜索关键词',
      },

      features: {
        type: DataTypes.JSONB,
        defaultValue: [],
        comment: '产品特性列表',
      },

      // 统计信息
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '浏览次数',
      },

      purchase_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '购买次数',
      },

      rating_average: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
        comment: '平均评分',
      },

      rating_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '评分数量',
      },

      // 排序和时间
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序顺序',
      },

      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '发布时间',
      },

      // 扩展属性
      custom_fields: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '自定义字段',
      },

      // 时间戳
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '创建时间',
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '更新时间',
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '软删除时间',
      },
    },
    {
      tableName: 'products',
      timestamps: true,
      paranoid: true,
      underscored: true,

      // 索引
      indexes: [
        {
          unique: true,
          fields: ['slug'],
        },
        {
          unique: true,
          fields: ['sku'],
          where: { sku: { [sequelize.Sequelize.Op.not]: null } },
        },
        {
          fields: ['category_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['visibility'],
        },
        {
          fields: ['is_featured'],
        },
        {
          fields: ['stock_status'],
        },
        {
          fields: ['price'],
        },
        {
          fields: ['published_at'],
        },
        {
          fields: ['sort_order'],
        },
        {
          type: 'GIN',
          fields: ['tags'],
        },
        {
          type: 'GIN',
          fields: ['features'],
        },
        // 简化搜索索引 (避免IMMUTABLE函数问题)
        {
          type: 'GIN',
          fields: ['search_keywords'],
        },
      ],

      // 钩子函数
      hooks: {
        beforeCreate: async product => {
          if (!product.slug && product.name) {
            product.slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }

          // 设置发布时间
          if (product.status === 'published' && !product.published_at) {
            product.published_at = new Date();
          }

          // 更新库存状态
          product.updateStockStatus();
        },

        beforeUpdate: async product => {
          if (product.changed('name') && !product.changed('slug')) {
            product.slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }

          // 状态变更时更新发布时间
          if (product.changed('status')) {
            if (product.status === 'published' && !product.published_at) {
              product.published_at = new Date();
            } else if (product.status !== 'published') {
              product.published_at = null;
            }
          }

          // 库存变更时更新状态
          if (
            product.changed('stock_quantity') ||
            product.changed('manage_stock')
          ) {
            product.updateStockStatus();
          }
        },
      },

      // 作用域
      scopes: {
        published: {
          where: {
            status: 'published',
          },
        },

        visible: {
          where: {
            status: 'published',
            visibility: ['visible', 'catalog', 'search'],
          },
        },

        featured: {
          where: {
            is_featured: true,
            status: 'published',
          },
        },

        inStock: {
          where: {
            stock_status: 'in_stock',
          },
        },

        withCategory: {
          include: [
            {
              model: sequelize.models.Category,
              as: 'category',
            },
          ],
        },

        ordered: {
          order: [
            ['sort_order', 'ASC'],
            ['name', 'ASC'],
          ],
        },
      },
    }
  );

  // 实例方法
  Product.prototype.updateStockStatus = function () {
    if (!this.manage_stock) {
      this.stock_status = 'in_stock';
      return;
    }

    if (this.stock_quantity <= 0) {
      this.stock_status = 'out_of_stock';
    } else {
      this.stock_status = 'in_stock';
    }
  };

  Product.prototype.getCurrentPrice = function () {
    return this.sale_price || this.price;
  };

  Product.prototype.isOnSale = function () {
    return this.sale_price && this.sale_price < this.price;
  };

  Product.prototype.getDiscountPercentage = function () {
    if (!this.isOnSale()) return 0;
    return Math.round(((this.price - this.sale_price) / this.price) * 100);
  };

  Product.prototype.isLowStock = function () {
    if (!this.manage_stock) return false;
    return this.stock_quantity <= this.low_stock_threshold;
  };

  Product.prototype.incrementViewCount = async function () {
    this.view_count += 1;
    await this.save({ fields: ['view_count'] });
  };

  Product.prototype.updateRating = async function (newRating) {
    const totalScore = this.rating_average * this.rating_count + newRating;
    this.rating_count += 1;
    this.rating_average = totalScore / this.rating_count;
    await this.save({ fields: ['rating_average', 'rating_count'] });
  };

  // 类方法
  Product.findBySlug = function (slug) {
    return this.scope('published', 'withCategory').findOne({
      where: { slug },
    });
  };

  Product.search = async function (options = {}) {
    const {
      query = '',
      category = '',
      tags = [],
      priceRange = {},
      sort = 'relevance',
      limit = 20,
      offset = 0,
      includeCategory = true,
    } = options;

    const where = {
      status: 'published',
      visibility: ['visible', 'catalog', 'search'],
    };

    const include = [];

    // 分类筛选
    if (category) {
      where.category_id = category;
    }

    if (includeCategory) {
      include.push({
        model: sequelize.models.Category,
        as: 'category',
      });
    }

    // 标签筛选
    if (tags.length > 0) {
      where.tags = {
        [sequelize.Sequelize.Op.overlap]: tags,
      };
    }

    // 价格筛选
    if (priceRange.min !== undefined || priceRange.max !== undefined) {
      where.price = {};
      if (priceRange.min !== undefined) {
        where.price[sequelize.Sequelize.Op.gte] = priceRange.min;
      }
      if (priceRange.max !== undefined) {
        where.price[sequelize.Sequelize.Op.lte] = priceRange.max;
      }
    }

    let order = [];

    // 关键词搜索
    if (query) {
      // 使用PostgreSQL全文搜索
      where[sequelize.Sequelize.Op.and] = [
        sequelize.literal(
          `to_tsvector('chinese', concat_ws(' ', name, short_description, description, search_keywords)) @@ plainto_tsquery('chinese', '${query}')`
        ),
      ];

      if (sort === 'relevance') {
        order.push([
          sequelize.literal(
            `ts_rank(to_tsvector('chinese', concat_ws(' ', name, short_description, description, search_keywords)), plainto_tsquery('chinese', '${query}'))`
          ),
          'DESC',
        ]);
      }
    }

    // 排序选项
    switch (sort) {
    case 'name':
      order.push(['name', 'ASC']);
      break;
    case 'price_asc':
      order.push(['price', 'ASC']);
      break;
    case 'price_desc':
      order.push(['price', 'DESC']);
      break;
    case 'newest':
      order.push(['published_at', 'DESC']);
      break;
    case 'rating':
      order.push(['rating_average', 'DESC']);
      break;
    case 'popularity':
      order.push(['view_count', 'DESC']);
      break;
    default:
      if (!query) {
        order.push(['sort_order', 'ASC'], ['name', 'ASC']);
      }
    }

    const result = await this.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
    });

    return {
      products: result.rows,
      total: result.count,
      hasMore: offset + limit < result.count,
    };
  };

  Product.getFeatured = function (limit = 10) {
    return this.scope('featured', 'withCategory', 'ordered').findAll({
      limit,
    });
  };

  Product.getRelated = async function (productId, limit = 5) {
    const product = await this.findByPk(productId);
    if (!product) return [];

    return this.scope('published', 'withCategory').findAll({
      where: {
        id: { [sequelize.Sequelize.Op.ne]: productId },
        category_id: product.category_id,
      },
      order: [
        ['rating_average', 'DESC'],
        ['view_count', 'DESC'],
      ],
      limit,
    });
  };

  // 关联关系
  Product.associate = function (models) {
    // 产品属于一个分类
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });

    // 产品可以有多个订单项
    Product.hasMany(models.OrderItem, {
      foreignKey: 'product_id',
      as: 'order_items',
    });
  };

  return Product;
};
