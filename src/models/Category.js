/**
 * 产品分类模型
 * 支持层级分类和SEO功能
 */

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '分类唯一标识',
      },

      // 基本信息
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
        comment: '分类名称',
      },

      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 100],
          is: /^[a-z0-9-]+$/,
        },
        comment: 'URL友好标识',
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '分类描述',
      },

      // 层级结构
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        comment: '父级分类ID',
      },

      level: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10,
        },
        comment: '分类层级（0为顶级）',
      },

      path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '分类路径（用于快速查询）',
      },

      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序顺序',
      },

      // 显示控制
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否启用',
      },

      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否推荐',
      },

      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '分类图标',
      },

      image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: true,
        },
        comment: '分类图片',
      },

      // SEO字段
      meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: [0, 255],
        },
        comment: 'SEO标题',
      },

      meta_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [0, 500],
        },
        comment: 'SEO描述',
      },

      meta_keywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'SEO关键词',
      },

      // 统计信息
      product_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '产品数量',
      },

      // 扩展属性
      attributes: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '扩展属性',
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
      tableName: 'categories',
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
          fields: ['parent_id'],
        },
        {
          fields: ['level'],
        },
        {
          fields: ['is_active'],
        },
        {
          fields: ['is_featured'],
        },
        {
          fields: ['sort_order'],
        },
        {
          fields: ['path'],
        },
        {
          fields: ['created_at'],
        },
      ],

      // 钩子函数
      hooks: {
        beforeCreate: async (category) => {
          if (!category.slug && category.name) {
            category.slug = category.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }

          await category.updatePath();
        },

        beforeUpdate: async (category) => {
          if (category.changed('name') && !category.changed('slug')) {
            category.slug = category.name
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/[\s_]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }

          if (category.changed('parent_id')) {
            await category.updatePath();
          }
        },
      },

      // 作用域
      scopes: {
        active: {
          where: {
            is_active: true,
          },
        },

        featured: {
          where: {
            is_featured: true,
            is_active: true,
          },
        },

        topLevel: {
          where: {
            parent_id: null,
          },
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
  Category.prototype.updatePath = async function () {
    if (!this.parent_id) {
      this.path = this.id;
      this.level = 0;
    } else {
      const parent = await Category.findByPk(this.parent_id);
      if (parent) {
        this.path = `${parent.path}/${this.id}`;
        this.level = parent.level + 1;
      }
    }
  };

  Category.prototype.getChildren = function () {
    return Category.findAll({
      where: {
        parent_id: this.id,
        is_active: true,
      },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  };

  Category.prototype.getParent = function () {
    if (!this.parent_id) return null;
    return Category.findByPk(this.parent_id);
  };

  Category.prototype.getAncestors = async function () {
    const ancestors = [];
    let current = this;

    while (current.parent_id) {
      const parent = await Category.findByPk(current.parent_id);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  };

  Category.prototype.getDescendants = function () {
    return Category.findAll({
      where: {
        path: {
          [sequelize.Sequelize.Op.like]: `${this.path}/%`,
        },
      },
      order: [
        ['level', 'ASC'],
        ['sort_order', 'ASC'],
      ],
    });
  };

  Category.prototype.isDescendantOf = function (otherCategory) {
    return this.path.startsWith(`${otherCategory.path}/`);
  };

  Category.prototype.updateProductCount = async function () {
    const count = await this.countProducts({
      where: { is_active: true },
    });

    this.product_count = count;
    await this.save();

    return count;
  };

  // 类方法
  Category.findBySlug = function (slug) {
    return this.findOne({
      where: { slug },
      include: [
        {
          model: this,
          as: 'children',
          where: { is_active: true },
          required: false,
        },
      ],
    });
  };

  Category.getTree = async function () {
    const categories = await this.scope('active', 'ordered').findAll({
      order: [
        ['level', 'ASC'],
        ['sort_order', 'ASC'],
      ],
    });

    const tree = [];
    const categoryMap = new Map();

    // 构建树形结构
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category.toJSON(), children: [] });
    });

    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        tree.push(categoryNode);
      }
    });

    return tree;
  };

  Category.getFeatured = function (limit = 10) {
    return this.scope('featured', 'ordered').findAll({
      limit,
    });
  };

  // 关联关系
  Category.associate = function (models) {
    // 自关联 - 父子关系
    Category.hasMany(Category, {
      foreignKey: 'parent_id',
      as: 'children',
    });

    Category.belongsTo(Category, {
      foreignKey: 'parent_id',
      as: 'parent',
    });

    // 分类有多个产品
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products',
    });
  };

  return Category;
};
