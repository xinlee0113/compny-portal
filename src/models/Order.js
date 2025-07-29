/**
 * 订单模型
 * 基础订单管理功能
 */

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '订单唯一标识',
      },

      // 订单基本信息
      order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '订单号',
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: '用户ID（可为空，支持游客下单）',
      },

      // 订单状态
      status: {
        type: DataTypes.ENUM(
          'pending',
          'confirmed',
          'processing',
          'shipped',
          'delivered',
          'cancelled'
        ),
        defaultValue: 'pending',
        comment: '订单状态',
      },

      // 金额信息
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '小计',
      },

      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: '税费',
      },

      shipping_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: '运费',
      },

      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '总金额',
      },

      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'CNY',
        comment: '货币',
      },

      // 联系信息
      customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '客户姓名',
      },

      customer_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '客户邮箱',
      },

      customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '客户电话',
      },

      // 收货信息
      shipping_address: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: '收货地址',
      },

      // 备注信息
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '订单备注',
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
      tableName: 'orders',
      timestamps: true,
      underscored: true,

      indexes: [
        {
          unique: true,
          fields: ['order_number'],
        },
        {
          fields: ['user_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['created_at'],
        },
      ],

      hooks: {
        beforeCreate: async order => {
          if (!order.order_number) {
            order.order_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          }
        },
      },
    }
  );

  // 关联关系
  Order.associate = function (models) {
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items',
    });
  };

  return Order;
};
