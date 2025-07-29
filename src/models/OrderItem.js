/**
 * 订单项模型
 * 订单明细项
 */

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '订单项唯一标识',
      },

      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        comment: '订单ID',
      },

      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        comment: '产品ID',
      },

      // 产品信息快照
      product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '产品名称（快照）',
      },

      product_sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '产品SKU（快照）',
      },

      // 数量和价格
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
        comment: '数量',
      },

      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '单价',
      },

      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '总价',
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
    },
    {
      tableName: 'order_items',
      timestamps: true,
      underscored: true,

      indexes: [
        {
          fields: ['order_id'],
        },
        {
          fields: ['product_id'],
        },
      ],

      hooks: {
        beforeSave: async orderItem => {
          orderItem.total_price = orderItem.quantity * orderItem.unit_price;
        },
      },
    }
  );

  // 关联关系
  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
    });

    OrderItem.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
  };

  return OrderItem;
};
