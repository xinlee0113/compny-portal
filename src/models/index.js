/**
 * 数据模型入口文件
 * 初始化所有数据库模型和关联关系
 */

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// 导入所有模型
const User = require('./User');
const Category = require('./Category');
const Product = require('./ProductDB');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Contact = require('./Contact');
const Session = require('./Session');

// 初始化模型
const models = {
  User: User(sequelize, DataTypes),
  Category: Category(sequelize, DataTypes),
  Product: Product(sequelize, DataTypes),
  Order: Order(sequelize, DataTypes),
  OrderItem: OrderItem(sequelize, DataTypes),
  Contact: Contact(sequelize, DataTypes),
  Session: Session(sequelize, DataTypes),
};

// 设置模型关联关系
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 添加sequelize实例到models对象
models.sequelize = sequelize;
models.Sequelize = require('sequelize');

// 导出所有模型
module.exports = models;
