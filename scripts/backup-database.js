#!/usr/bin/env node

/**
 * 数据库备份脚本
 * 支持PostgreSQL和Redis的自动备份
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 环境配置
require('dotenv').config();

const config = {
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'company_portal',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  backup: {
    dir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
    retention: process.env.BACKUP_RETENTION_DAYS || 7,
    compression: process.env.BACKUP_COMPRESSION || true
  }
};

class BackupManager {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = config.backup.dir;
    this.initBackupDirectory();
  }

  /**
   * 初始化备份目录
   */
  initBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`✅ 创建备份目录: ${this.backupDir}`);
    }

    // 创建子目录
    ['postgres', 'redis', 'full'].forEach(subdir => {
      const dir = path.join(this.backupDir, subdir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 备份PostgreSQL数据库
   */
  async backupPostgreSQL() {
    console.log('📊 开始备份PostgreSQL数据库...');
    
    try {
      const filename = `postgres_${config.postgres.database}_${this.timestamp}.sql`;
      const filepath = path.join(this.backupDir, 'postgres', filename);
      
      // 设置环境变量避免密码提示
      const env = {
        ...process.env,
        PGPASSWORD: config.postgres.password
      };

      // 构建pg_dump命令
      const command = [
        'pg_dump',
        `-h ${config.postgres.host}`,
        `-p ${config.postgres.port}`,
        `-U ${config.postgres.username}`,
        `-d ${config.postgres.database}`,
        '--no-password',
        '--verbose',
        '--clean',
        '--if-exists',
        '--create',
        `--file="${filepath}"`
      ].join(' ');

      console.log(`🔧 执行命令: ${command.replace(config.postgres.password, '***')}`);
      
      const { stdout, stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('⚠️  备份警告:', stderr);
      }

      // 检查文件是否创建成功
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        console.log(`✅ PostgreSQL备份完成: ${filename} (${this.formatFileSize(stats.size)})`);
        
        // 如果启用压缩
        if (config.backup.compression) {
          await this.compressFile(filepath);
        }
        
        return {
          success: true,
          filename,
          filepath,
          size: stats.size
        };
      } else {
        throw new Error('备份文件未创建');
      }

    } catch (error) {
      console.error('❌ PostgreSQL备份失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 备份Redis数据
   */
  async backupRedis() {
    console.log('📦 开始备份Redis数据...');
    
    try {
      const filename = `redis_${this.timestamp}.rdb`;
      const tempPath = '/tmp/dump.rdb'; // Redis默认dump文件位置
      const filepath = path.join(this.backupDir, 'redis', filename);

      // 构建redis-cli命令
      let command = [
        'redis-cli',
        `-h ${config.redis.host}`,
        `-p ${config.redis.port}`
      ];

      if (config.redis.password) {
        command.push(`-a "${config.redis.password}"`);
      }

      command.push('BGSAVE');
      const saveCommand = command.join(' ');

      console.log(`🔧 执行命令: ${saveCommand.replace(config.redis.password || '', '***')}`);
      
      // 执行后台保存
      await execAsync(saveCommand);
      
      // 等待保存完成
      await this.waitForRedisBgsave();
      
      // 查找最新的dump文件
      const dumpFile = await this.findLatestRedisDump();
      
      if (dumpFile && fs.existsSync(dumpFile)) {
        // 复制到备份目录
        fs.copyFileSync(dumpFile, filepath);
        
        const stats = fs.statSync(filepath);
        console.log(`✅ Redis备份完成: ${filename} (${this.formatFileSize(stats.size)})`);
        
        // 如果启用压缩
        if (config.backup.compression) {
          await this.compressFile(filepath);
        }
        
        return {
          success: true,
          filename,
          filepath,
          size: stats.size
        };
      } else {
        throw new Error('Redis dump文件未找到');
      }

    } catch (error) {
      console.error('❌ Redis备份失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 等待Redis BGSAVE完成
   */
  async waitForRedisBgsave() {
    const maxWait = 60000; // 最大等待60秒
    const interval = 1000; // 每秒检查一次
    let waited = 0;

    while (waited < maxWait) {
      try {
        let command = [
          'redis-cli',
          `-h ${config.redis.host}`,
          `-p ${config.redis.port}`
        ];

        if (config.redis.password) {
          command.push(`-a "${config.redis.password}"`);
        }

        command.push('LASTSAVE');
        const { stdout } = await execAsync(command.join(' '));
        
        const lastSave = parseInt(stdout.trim());
        const now = Math.floor(Date.now() / 1000);
        
        // 如果最后保存时间在最近5秒内，认为保存完成
        if (now - lastSave < 5) {
          console.log('✅ Redis BGSAVE 完成');
          return;
        }
        
      } catch (error) {
        console.warn('⚠️  检查BGSAVE状态失败:', error.message);
      }

      await new Promise(resolve => setTimeout(resolve, interval));
      waited += interval;
    }

    throw new Error('Redis BGSAVE 超时');
  }

  /**
   * 查找最新的Redis dump文件
   */
  async findLatestRedisDump() {
    const possiblePaths = [
      '/tmp/dump.rdb',
      '/var/lib/redis/dump.rdb',
      '/usr/local/var/db/redis/dump.rdb',
      path.join(process.cwd(), 'dump.rdb')
    ];

    let latestFile = null;
    let latestTime = 0;

    for (const filepath of possiblePaths) {
      try {
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          if (stats.mtime.getTime() > latestTime) {
            latestTime = stats.mtime.getTime();
            latestFile = filepath;
          }
        }
      } catch (error) {
        // 忽略错误，继续检查下一个路径
      }
    }

    return latestFile;
  }

  /**
   * 压缩文件
   */
  async compressFile(filepath) {
    try {
      const command = `gzip "${filepath}"`;
      await execAsync(command);
      console.log(`🗜️  文件已压缩: ${filepath}.gz`);
    } catch (error) {
      console.warn('⚠️  文件压缩失败:', error.message);
    }
  }

  /**
   * 创建完整备份
   */
  async createFullBackup() {
    console.log('🚀 开始创建完整备份...');
    
    const results = {
      timestamp: this.timestamp,
      postgres: null,
      redis: null,
      success: false
    };

    // 备份PostgreSQL
    results.postgres = await this.backupPostgreSQL();
    
    // 备份Redis
    results.redis = await this.backupRedis();
    
    // 检查整体结果
    results.success = results.postgres.success && results.redis.success;
    
    // 创建备份报告
    await this.createBackupReport(results);
    
    if (results.success) {
      console.log('✅ 完整备份创建成功!');
    } else {
      console.error('❌ 备份过程中出现错误');
    }

    return results;
  }

  /**
   * 创建备份报告
   */
  async createBackupReport(results) {
    const reportPath = path.join(this.backupDir, 'full', `backup_report_${this.timestamp}.json`);
    
    const report = {
      timestamp: this.timestamp,
      date: new Date().toISOString(),
      results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hostname: require('os').hostname()
      },
      config: {
        retention: config.backup.retention,
        compression: config.backup.compression
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 备份报告已创建: ${reportPath}`);
  }

  /**
   * 清理过期备份
   */
  async cleanupOldBackups() {
    console.log('🧹 开始清理过期备份...');
    
    const retentionMs = config.backup.retention * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionMs);
    
    const directories = ['postgres', 'redis', 'full'];
    let totalDeleted = 0;

    for (const dir of directories) {
      const dirPath = path.join(this.backupDir, dir);
      
      try {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const filepath = path.join(dirPath, file);
          const stats = fs.statSync(filepath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filepath);
            console.log(`🗑️  删除过期备份: ${file}`);
            totalDeleted++;
          }
        }
      } catch (error) {
        console.warn(`⚠️  清理目录失败 ${dir}:`, error.message);
      }
    }

    console.log(`✅ 清理完成，删除了 ${totalDeleted} 个过期备份文件`);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// 主函数
async function main() {
  console.log('🔄 开始数据库备份流程...');
  console.log(`📅 时间戳: ${new Date().toISOString()}`);
  
  const backupManager = new BackupManager();
  
  try {
    // 创建完整备份
    const results = await backupManager.createFullBackup();
    
    // 清理过期备份
    await backupManager.cleanupOldBackups();
    
    // 输出结果
    if (results.success) {
      console.log('🎉 备份流程完成!');
      process.exit(0);
    } else {
      console.error('💥 备份流程失败!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 备份流程异常:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = BackupManager; 