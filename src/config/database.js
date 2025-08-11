/**
 * 数据库配置
 * 支持PostgreSQL主数据库和Redis缓存
 */

const { Sequelize } = require('sequelize');
const redis = require('redis');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 环境配置
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'company_portal';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_SSL = process.env.DB_SSL === 'true';

// Redis配置
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = process.env.REDIS_DB || 0;

// PostgreSQL连接配置
const postgresConfig = {
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  dialect: 'postgres',

  // 连接池配置
  pool: {
    max: 20, // 最大连接数
    min: 0, // 最小连接数
    acquire: 30000, // 获取连接超时时间 (ms)
    idle: 10000, // 连接空闲时间 (ms)
    evict: 1000, // 清理空闲连接间隔 (ms)
  },

  // 日志配置
  logging: NODE_ENV === 'development' ? console.log : false,

  // 连接选项
  dialectOptions: {
    ssl: DB_SSL
      ? {
        require: true,
        rejectUnauthorized: false,
      }
      : false,

    // 连接超时
    connectTimeout: 20000,

    // 应用名称
    application_name: 'company_portal',
  },

  // 查询优化
  define: {
    underscored: true, // 使用下划线命名
    freezeTableName: true, // 禁用表名复数
    timestamps: true, // 自动时间戳
    paranoid: true, // 软删除
    charset: 'utf8mb4', // 字符集
    collate: 'utf8mb4_unicode_ci',
  },

  // 事务配置
  transactionType: 'IMMEDIATE',

  // 连接重试
  retry: {
    max: 3,
    timeout: 5000,
  },
};

// 开发环境特殊配置
if (NODE_ENV === 'development') {
  postgresConfig.benchmark = true;
  postgresConfig.logQueryParameters = true;
}

// 生产环境特殊配置
if (NODE_ENV === 'production') {
  postgresConfig.pool.max = 50;
  postgresConfig.pool.acquire = 60000;
  postgresConfig.logging = false;
}

// 创建Sequelize实例
let sequelize;
try {
  sequelize = new Sequelize(postgresConfig);
  console.log('📊 PostgreSQL配置已加载');
} catch (error) {
  console.error('❌ PostgreSQL配置失败:', error.message);
}

// Redis连接配置 (Redis v4+ 格式)
const redisConfig = {
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    connectTimeout: 10000,
    commandTimeout: 5000,

    // 重连配置
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 50, 2000);
      return delay;
    },
  },

  // 认证配置
  password: REDIS_PASSWORD,
  database: REDIS_DB || 0,

  // 连接选项
  name: 'company-portal-redis',

  // 错误处理
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
};

// 创建Redis客户端
let redisClient;
let redisConnected = false;

async function createRedisClient() {
  try {
    redisClient = redis.createClient(redisConfig);

    // 事件监听
    redisClient.on('connect', () => {
      console.log('📦 Redis连接已建立');
      redisConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('📦 Redis已准备就绪');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis连接错误:', err.message);
      redisConnected = false;
    });

    redisClient.on('end', () => {
      console.log('📦 Redis连接已关闭');
      redisConnected = false;
    });

    // 连接Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('❌ Redis连接失败:', error.message);
    redisConnected = false;
    return null;
  }
}

// 数据库连接测试
async function testConnections() {
  const results = {
    postgres: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  // 测试PostgreSQL连接
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL连接测试成功');
    results.postgres = true;
  } catch (error) {
    console.error('❌ PostgreSQL连接测试失败:', error.message);
  }

  // 测试Redis连接
  try {
    if (!redisClient || !redisConnected) {
      console.log('🔄 初始化Redis客户端...');
      await createRedisClient();
    }

    if (redisClient && redisConnected) {
      await redisClient.ping();
      console.log('✅ Redis连接测试成功');
      results.redis = true;
    } else {
      console.warn('⚠️  Redis客户端初始化失败');
    }
  } catch (error) {
    console.error('❌ Redis连接测试失败:', error.message);
  }

  return results;
}

// 数据库同步
async function syncDatabase(force = false) {
  try {
    console.log('🔄 开始数据库同步...');

    if (force) {
      console.log('⚠️  强制同步：将删除所有现有数据');
    }

    await sequelize.sync({ force });
    console.log('✅ 数据库同步完成');

    return true;
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    return false;
  }
}

// 优雅关闭连接
async function closeConnections() {
  const promises = [];

  // 关闭PostgreSQL连接
  if (sequelize) {
    promises.push(
      sequelize
        .close()
        .then(() => {
          console.log('✅ PostgreSQL连接已关闭');
        })
        .catch((err) => {
          console.error('❌ PostgreSQL关闭失败:', err.message);
        })
    );
  }

  // 关闭Redis连接
  if (redisClient && redisConnected) {
    promises.push(
      redisClient
        .quit()
        .then(() => {
          console.log('✅ Redis连接已关闭');
        })
        .catch((err) => {
          console.error('❌ Redis关闭失败:', err.message);
        })
    );
  }

  await Promise.allSettled(promises);
}

// 健康检查
async function getHealthStatus() {
  const status = {
    postgres: {
      connected: false,
      responseTime: null,
      error: null,
    },
    redis: {
      connected: false,
      responseTime: null,
      error: null,
    },
    timestamp: new Date().toISOString(),
  };

  // PostgreSQL健康检查
  try {
    const start = Date.now();
    await sequelize.authenticate();
    status.postgres.connected = true;
    status.postgres.responseTime = Date.now() - start;
  } catch (error) {
    status.postgres.error = error.message;
  }

  // Redis健康检查
  try {
    if (redisClient && redisConnected) {
      const start = Date.now();
      await redisClient.ping();
      status.redis.connected = true;
      status.redis.responseTime = Date.now() - start;
    }
  } catch (error) {
    status.redis.error = error.message;
  }

  return status;
}

// 缓存工具函数
const cache = {
  // 设置缓存
  async set(key, value, ttl = 3600) {
    if (!redisClient || !redisConnected) {
      console.warn('⚠️  Redis不可用，跳过缓存设置');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('❌ 缓存设置失败:', error.message);
      return false;
    }
  },

  // 获取缓存
  async get(key) {
    if (!redisClient || !redisConnected) {
      return null;
    }

    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ 缓存获取失败:', error.message);
      return null;
    }
  },

  // 删除缓存
  async del(key) {
    if (!redisClient || !redisConnected) {
      return false;
    }

    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('❌ 缓存删除失败:', error.message);
      return false;
    }
  },

  // 清空缓存
  async clear() {
    if (!redisClient || !redisConnected) {
      return false;
    }

    try {
      await redisClient.flushDb();
      return true;
    } catch (error) {
      console.error('❌ 缓存清空失败:', error.message);
      return false;
    }
  },
};

// 导出配置和实例
module.exports = {
  sequelize,
  redisClient,
  cache,
  createRedisClient,
  testConnections,
  syncDatabase,
  closeConnections,
  getHealthStatus,
  config: {
    postgres: postgresConfig,
    redis: redisConfig,
    environment: NODE_ENV,
  },
};
