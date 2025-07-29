/**
 * 数据库初始化脚本
 * 创建数据库模式并迁移初始数据
 */

const { 
  sequelize, 
  createRedisClient, 
  testConnections,
  syncDatabase,
  closeConnections 
} = require('../src/config/database');
const models = require('../src/models');
const ProductMemory = require('../src/models/Product'); // 原内存版本

// 初始化数据库
async function initializeDatabase() {
  console.log('🚀 开始数据库初始化...\n');
  
  try {
    // 1. 测试数据库连接
    console.log('📊 测试数据库连接...');
    const testResults = await testConnections();
    
    if (!testResults.postgres) {
      throw new Error('PostgreSQL连接失败，请检查数据库配置');
    }
    
    console.log('✅ PostgreSQL连接成功');
    
    if (testResults.redis) {
      console.log('✅ Redis连接成功');
    } else {
      console.log('⚠️  Redis连接失败，将跳过缓存功能');
    }
    
    // 2. 同步数据库结构
    console.log('\n🔄 同步数据库模式...');
    const syncSuccess = await syncDatabase(false); // 不强制重建
    
    if (!syncSuccess) {
      throw new Error('数据库同步失败');
    }
    
    // 3. 创建初始分类
    console.log('\n📂 创建产品分类...');
    await createCategories();
    
    // 4. 迁移产品数据
    console.log('\n📦 迁移产品数据...');
    await migrateProducts();
    
    // 5. 创建管理员用户
    console.log('\n👤 创建管理员用户...');
    await createAdminUser();
    
    console.log('\n✅ 数据库初始化完成！');
    console.log('\n📊 数据库统计:');
    await printDatabaseStats();
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    await closeConnections();
  }
}

// 创建产品分类
async function createCategories() {
  const { Category } = models;
  
  const categories = [
    {
      name: '核心产品',
      slug: 'core-products',
      description: '公司核心产品和服务',
      is_featured: true,
      sort_order: 1
    },
    {
      name: '解决方案',
      slug: 'solutions', 
      description: '行业解决方案',
      is_featured: true,
      sort_order: 2
    },
    {
      name: '技术服务',
      slug: 'technical-services',
      description: '技术支持和服务',
      sort_order: 3
    },
    {
      name: '培训服务',
      slug: 'training-services',
      description: '专业培训和咨询',
      sort_order: 4
    }
  ];
  
  const createdCategories = {};
  
  for (const categoryData of categories) {
    const [category, created] = await Category.findOrCreate({
      where: { slug: categoryData.slug },
      defaults: categoryData
    });
    
    createdCategories[categoryData.slug] = category;
    
    if (created) {
      console.log(`  ✅ 创建分类: ${category.name}`);
    } else {
      console.log(`  📁 分类已存在: ${category.name}`);
    }
  }
  
  return createdCategories;
}

// 迁移产品数据
async function migrateProducts() {
  const { Product, Category } = models;
  
  // 创建内存产品实例并获取数据
  const productMemoryInstance = new ProductMemory();
  const memoryProducts = productMemoryInstance.getAllProducts();
  
  // 获取分类映射
  const categories = await Category.findAll();
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });
  
  let migrated = 0;
  let skipped = 0;
  
  for (const memProduct of memoryProducts) {
    try {
      // 查找对应的分类ID
      const categoryId = categoryMap[memProduct.category] || categoryMap['核心产品'];
      
      const productData = {
        name: memProduct.name,
        slug: memProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        short_description: memProduct.description,
        description: memProduct.description,
        category_id: categoryId,
        price: Math.floor(Math.random() * 10000) + 1000, // 随机价格 1000-11000
        status: 'published',
        visibility: 'visible',
        is_featured: memProduct.featured || false,
        tags: memProduct.tags || [],
        features: memProduct.features || [],
        published_at: new Date(),
        search_keywords: [
          memProduct.name,
          memProduct.description,
          ...(memProduct.tags || []),
          ...(memProduct.features || [])
        ].join(' ')
      };
      
      const [product, created] = await Product.findOrCreate({
        where: { slug: productData.slug },
        defaults: productData
      });
      
      if (created) {
        console.log(`  ✅ 迁移产品: ${product.name}`);
        migrated++;
      } else {
        console.log(`  📦 产品已存在: ${product.name}`);
        skipped++;
      }
      
    } catch (error) {
      console.error(`  ❌ 迁移产品失败 ${memProduct.name}:`, error.message);
    }
  }
  
  console.log(`  📊 迁移完成: ${migrated}个新产品, ${skipped}个已存在`);
}

// 创建管理员用户
async function createAdminUser() {
  const { User } = models;
  
  const adminData = {
    username: 'admin',
    email: 'admin@company-portal.com',
    password_hash: 'admin123', // 将被bcrypt加密
    first_name: '系统',
    last_name: '管理员',
    role: 'admin',
    status: 'active',
    email_verified: true
  };
  
  const [admin, created] = await User.findOrCreate({
    where: { username: adminData.username },
    defaults: adminData
  });
  
  if (created) {
    console.log('  ✅ 创建管理员用户: admin');
    console.log('  📝 初始密码: admin123');
    console.log('  🔑 请登录后立即修改密码');
  } else {
    console.log('  👤 管理员用户已存在');
  }
  
  return admin;
}

// 打印数据库统计信息
async function printDatabaseStats() {
  const stats = {};
  
  try {
    for (const [modelName, model] of Object.entries(models)) {
      if (model && typeof model.count === 'function') {
        stats[modelName] = await model.count();
      }
    }
    
    console.table(stats);
    
  } catch (error) {
    console.error('获取统计信息失败:', error.message);
  }
}

// 重置数据库（危险操作）
async function resetDatabase() {
  console.log('⚠️  开始重置数据库...');
  console.log('🚨 这将删除所有现有数据！');
  
  try {
    await syncDatabase(true); // 强制重建
    console.log('✅ 数据库已重置');
    
    // 重新初始化数据
    await createCategories();
    await migrateProducts();
    await createAdminUser();
    
    console.log('✅ 数据库重置完成');
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error.message);
    throw error;
  }
}

// 命令行参数处理
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--reset')) {
    resetDatabase().catch(console.error);
  } else if (args.includes('--stats')) {
    (async () => {
      await testConnections();
      await printDatabaseStats();
      await closeConnections();
    })();
  } else {
    initializeDatabase().catch(console.error);
  }
}

module.exports = {
  initializeDatabase,
  resetDatabase,
  createCategories,
  migrateProducts,
  createAdminUser,
  printDatabaseStats
};