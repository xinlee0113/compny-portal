#!/usr/bin/env node

/**
 * 数据库恢复脚本
 * 支持从备份文件恢复PostgreSQL和Redis数据
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const readline = require('readline');

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
    dir: process.env.BACKUP_DIR || path.join(__dirname, '../backups')
  }
};

class RestoreManager {
  constructor() {
    this.backupDir = config.backup.dir;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 确认用户操作
   */
  async confirmOperation(message) {
    return new Promise((resolve) => {
      this.rl.question(`${message} (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  /**
   * 列出可用的备份文件
   */
  listAvailableBackups() {
    console.log('📋 可用的备份文件:');
    
    const backupTypes = [
      { type: 'postgres', dir: path.join(this.backupDir, 'postgres'), name: 'PostgreSQL' },
      { type: 'redis', dir: path.join(this.backupDir, 'redis'), name: 'Redis' },
      { type: 'full', dir: path.join(this.backupDir, 'full'), name: '完整备份报告' }
    ];

    const availableBackups = {};

    for (const backup of backupTypes) {
      try {
        if (fs.existsSync(backup.dir)) {
          const files = fs.readdirSync(backup.dir)
            .filter(file => {
              if (backup.type === 'postgres') return file.endsWith('.sql') || file.endsWith('.sql.gz');
              if (backup.type === 'redis') return file.endsWith('.rdb') || file.endsWith('.rdb.gz');
              if (backup.type === 'full') return file.endsWith('.json');
              return false;
            })
            .map(file => {
              const filepath = path.join(backup.dir, file);
              const stats = fs.statSync(filepath);
              return {
                filename: file,
                filepath,
                size: this.formatFileSize(stats.size),
                mtime: stats.mtime,
                compressed: file.endsWith('.gz')
              };
            })
            .sort((a, b) => b.mtime - a.mtime); // 按时间降序排列

          if (files.length > 0) {
            availableBackups[backup.type] = files;
            console.log(`\n${backup.name} 备份文件:`);
            files.slice(0, 5).forEach((file, index) => { // 只显示最新的5个
              console.log(`  ${index + 1}. ${file.filename} (${file.size}) - ${file.mtime.toLocaleString()}`);
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️  读取${backup.name}备份目录失败:`, error.message);
      }
    }

    return availableBackups;
  }

  /**
   * 解压文件
   */
  async decompressFile(filepath) {
    if (!filepath.endsWith('.gz')) {
      return filepath;
    }

    try {
      const decompressedPath = filepath.slice(0, -3); // 移除 .gz 后缀
      const command = `gunzip -c "${filepath}" > "${decompressedPath}"`;
      
      console.log(`🗜️  解压文件: ${path.basename(filepath)}`);
      await execAsync(command);
      
      return decompressedPath;
    } catch (error) {
      throw new Error(`解压文件失败: ${error.message}`);
    }
  }

  /**
   * 恢复PostgreSQL数据库
   */
  async restorePostgreSQL(backupFilepath) {
    console.log('📊 开始恢复PostgreSQL数据库...');
    
    try {
      // 检查备份文件是否存在
      if (!fs.existsSync(backupFilepath)) {
        throw new Error(`备份文件不存在: ${backupFilepath}`);
      }

      // 如果是压缩文件，先解压
      const filepath = await this.decompressFile(backupFilepath);

      // 设置环境变量避免密码提示
      const env = {
        ...process.env,
        PGPASSWORD: config.postgres.password
      };

      // 确认操作
      const confirmed = await this.confirmOperation(
        `⚠️  这将完全覆盖数据库 "${config.postgres.database}"！是否继续？`
      );

      if (!confirmed) {
        console.log('❌ 恢复操作已取消');
        return { success: false, cancelled: true };
      }

      // 构建psql命令
      const command = [
        'psql',
        `-h ${config.postgres.host}`,
        `-p ${config.postgres.port}`,
        `-U ${config.postgres.username}`,
        `-d postgres`, // 连接到postgres数据库来执行创建操作
        '--no-password',
        '-v', 'ON_ERROR_STOP=1',
        `--file="${filepath}"`
      ].join(' ');

      console.log(`🔧 执行恢复命令: ${command.replace(config.postgres.password, '***')}`);
      
      const { stdout, stderr } = await execAsync(command, { env });
      
      if (stderr && !stderr.includes('NOTICE')) {
        console.warn('⚠️  恢复警告:', stderr);
      }

      console.log('✅ PostgreSQL数据库恢复完成!');
      
      // 如果创建了临时解压文件，删除它
      if (filepath !== backupFilepath && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('🧹 临时解压文件已清理');
      }

      return {
        success: true,
        message: 'PostgreSQL数据库恢复成功'
      };

    } catch (error) {
      console.error('❌ PostgreSQL恢复失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 恢复Redis数据
   */
  async restoreRedis(backupFilepath) {
    console.log('📦 开始恢复Redis数据...');
    
    try {
      // 检查备份文件是否存在
      if (!fs.existsSync(backupFilepath)) {
        throw new Error(`备份文件不存在: ${backupFilepath}`);
      }

      // 如果是压缩文件，先解压
      const filepath = await this.decompressFile(backupFilepath);

      // 确认操作
      const confirmed = await this.confirmOperation(
        '⚠️  这将清空Redis数据库并恢复备份数据！是否继续？'
      );

      if (!confirmed) {
        console.log('❌ 恢复操作已取消');
        return { success: false, cancelled: true };
      }

      // 停止Redis写入
      await this.flushRedis();

      // 查找Redis数据目录
      const redisDataDir = await this.findRedisDataDir();
      
      if (!redisDataDir) {
        throw new Error('无法找到Redis数据目录');
      }

      const targetPath = path.join(redisDataDir, 'dump.rdb');

      // 备份现有的dump文件
      if (fs.existsSync(targetPath)) {
        const backupPath = `${targetPath}.backup.${Date.now()}`;
        fs.copyFileSync(targetPath, backupPath);
        console.log(`💾 现有数据已备份到: ${backupPath}`);
      }

      // 复制备份文件到Redis数据目录
      fs.copyFileSync(filepath, targetPath);
      console.log(`📁 备份文件已复制到: ${targetPath}`);

      // 重启Redis服务加载新数据
      await this.restartRedis();

      // 如果创建了临时解压文件，删除它
      if (filepath !== backupFilepath && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('🧹 临时解压文件已清理');
      }

      console.log('✅ Redis数据恢复完成!');

      return {
        success: true,
        message: 'Redis数据恢复成功'
      };

    } catch (error) {
      console.error('❌ Redis恢复失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 清空Redis数据库
   */
  async flushRedis() {
    try {
      let command = [
        'redis-cli',
        `-h ${config.redis.host}`,
        `-p ${config.redis.port}`
      ];

      if (config.redis.password) {
        command.push(`-a "${config.redis.password}"`);
      }

      command.push('FLUSHALL');

      await execAsync(command.join(' '));
      console.log('🗑️  Redis数据库已清空');
    } catch (error) {
      console.warn('⚠️  清空Redis失败:', error.message);
    }
  }

  /**
   * 查找Redis数据目录
   */
  async findRedisDataDir() {
    const possibleDirs = [
      '/var/lib/redis',
      '/usr/local/var/db/redis',
      '/tmp',
      process.cwd()
    ];

    for (const dir of possibleDirs) {
      try {
        if (fs.existsSync(dir)) {
          const testFile = path.join(dir, 'test_write_permission');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          return dir;
        }
      } catch (error) {
        // 没有写权限，继续检查下一个目录
      }
    }

    return null;
  }

  /**
   * 重启Redis服务
   */
  async restartRedis() {
    try {
      // 尝试通过Redis CLI发送DEBUG RESTART命令
      let command = [
        'redis-cli',
        `-h ${config.redis.host}`,
        `-p ${config.redis.port}`
      ];

      if (config.redis.password) {
        command.push(`-a "${config.redis.password}"`);
      }

      command.push('DEBUG', 'RESTART');

      await execAsync(command.join(' '));
      console.log('🔄 Redis服务已重启');
      
      // 等待几秒让Redis完全启动
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.warn('⚠️  自动重启Redis失败，请手动重启Redis服务:', error.message);
      console.log('💡 手动重启命令示例:');
      console.log('   sudo systemctl restart redis');
      console.log('   或者 sudo service redis restart');
    }
  }

  /**
   * 交互式恢复流程
   */
  async interactiveRestore() {
    console.log('🔄 开始交互式数据恢复流程...');
    
    // 列出可用备份
    const availableBackups = this.listAvailableBackups();
    
    if (Object.keys(availableBackups).length === 0) {
      console.log('❌ 未找到任何可用的备份文件');
      return;
    }

    // 选择恢复类型
    console.log('\n请选择恢复类型:');
    console.log('1. PostgreSQL数据库');
    console.log('2. Redis数据');
    console.log('3. 完整恢复 (PostgreSQL + Redis)');
    
    const choice = await this.promptUser('请输入选择 (1-3): ');
    
    switch (choice) {
      case '1':
        await this.restorePostgreSQLInteractive(availableBackups.postgres);
        break;
      case '2':
        await this.restoreRedisInteractive(availableBackups.redis);
        break;
      case '3':
        await this.fullRestoreInteractive(availableBackups);
        break;
      default:
        console.log('❌ 无效选择');
        break;
    }
  }

  /**
   * 交互式PostgreSQL恢复
   */
  async restorePostgreSQLInteractive(backups) {
    if (!backups || backups.length === 0) {
      console.log('❌ 未找到PostgreSQL备份文件');
      return;
    }

    console.log('\n请选择要恢复的PostgreSQL备份:');
    backups.slice(0, 10).forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.filename} (${backup.size}) - ${backup.mtime.toLocaleString()}`);
    });

    const choice = await this.promptUser(`请输入选择 (1-${Math.min(backups.length, 10)}): `);
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < backups.length) {
      const result = await this.restorePostgreSQL(backups[index].filepath);
      if (result.success) {
        console.log('🎉 PostgreSQL恢复完成!');
      }
    } else {
      console.log('❌ 无效选择');
    }
  }

  /**
   * 交互式Redis恢复
   */
  async restoreRedisInteractive(backups) {
    if (!backups || backups.length === 0) {
      console.log('❌ 未找到Redis备份文件');
      return;
    }

    console.log('\n请选择要恢复的Redis备份:');
    backups.slice(0, 10).forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.filename} (${backup.size}) - ${backup.mtime.toLocaleString()}`);
    });

    const choice = await this.promptUser(`请输入选择 (1-${Math.min(backups.length, 10)}): `);
    const index = parseInt(choice) - 1;

    if (index >= 0 && index < backups.length) {
      const result = await this.restoreRedis(backups[index].filepath);
      if (result.success) {
        console.log('🎉 Redis恢复完成!');
      }
    } else {
      console.log('❌ 无效选择');
    }
  }

  /**
   * 完整恢复
   */
  async fullRestoreInteractive(availableBackups) {
    console.log('\n🚀 开始完整数据恢复...');
    
    const results = {
      postgres: null,
      redis: null
    };

    // 恢复PostgreSQL
    if (availableBackups.postgres && availableBackups.postgres.length > 0) {
      console.log('\n--- PostgreSQL 恢复 ---');
      results.postgres = await this.restorePostgreSQL(availableBackups.postgres[0].filepath);
    }

    // 恢复Redis
    if (availableBackups.redis && availableBackups.redis.length > 0) {
      console.log('\n--- Redis 恢复 ---');
      results.redis = await this.restoreRedis(availableBackups.redis[0].filepath);
    }

    // 输出结果
    console.log('\n📊 恢复结果:');
    console.log(`PostgreSQL: ${results.postgres?.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`Redis: ${results.redis?.success ? '✅ 成功' : '❌ 失败'}`);
  }

  /**
   * 提示用户输入
   */
  async promptUser(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
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

  /**
   * 清理资源
   */
  cleanup() {
    this.rl.close();
  }
}

// 主函数
async function main() {
  const restoreManager = new RestoreManager();
  
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      // 交互式模式
      await restoreManager.interactiveRestore();
    } else {
      // 命令行模式
      const [type, filepath] = args;
      
      switch (type) {
        case 'postgres':
          if (!filepath) {
            console.error('❌ 请指定PostgreSQL备份文件路径');
            process.exit(1);
          }
          await restoreManager.restorePostgreSQL(filepath);
          break;
          
        case 'redis':
          if (!filepath) {
            console.error('❌ 请指定Redis备份文件路径');
            process.exit(1);
          }
          await restoreManager.restoreRedis(filepath);
          break;
          
        default:
          console.error('❌ 无效的恢复类型。使用: postgres 或 redis');
          process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('💥 恢复流程异常:', error);
    process.exit(1);
  } finally {
    restoreManager.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = RestoreManager; 