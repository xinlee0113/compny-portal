#!/usr/bin/env node

/**
 * 自动化备份定时任务配置脚本
 * 设置cron任务进行定期数据库备份
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class BackupCronSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupScript = path.join(this.projectRoot, 'scripts/backup-database.js');
    this.logDir = path.join(this.projectRoot, 'logs');
  }

  /**
   * 初始化日志目录
   */
  initLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
      console.log(`✅ 创建日志目录: ${this.logDir}`);
    }
  }

  /**
   * 检查系统环境
   */
  async checkEnvironment() {
    console.log('🔍 检查系统环境...');
    
    const checks = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'crontab', command: 'crontab -l 2>/dev/null || echo "no crontab"' }
    ];

    for (const check of checks) {
      try {
        const { stdout } = await execAsync(check.command);
        console.log(`✅ ${check.name}: ${stdout.trim()}`);
      } catch (error) {
        console.warn(`⚠️  ${check.name} 检查失败:`, error.message);
      }
    }
  }

  /**
   * 生成备份脚本包装器
   */
  generateBackupWrapper() {
    const wrapperPath = path.join(this.projectRoot, 'scripts/backup-wrapper.sh');
    const logFile = path.join(this.logDir, 'backup.log');
    
    const wrapperContent = `#!/bin/bash
# 数据库备份包装脚本
# 这个脚本用于cron任务调用

# 设置环境变量
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export NODE_ENV="production"

# 切换到项目目录
cd "${this.projectRoot}"

# 执行备份并记录日志
echo "$(date '+%Y-%m-%d %H:%M:%S') - 开始数据库备份" >> "${logFile}"
node "${this.backupScript}" >> "${logFile}" 2>&1
BACKUP_EXIT_CODE=$?

if [ $BACKUP_EXIT_CODE -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 备份成功完成" >> "${logFile}"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 备份失败，退出代码: $BACKUP_EXIT_CODE" >> "${logFile}"
fi

exit $BACKUP_EXIT_CODE
`;

    fs.writeFileSync(wrapperPath, wrapperContent);
    
    // 设置执行权限
    try {
      fs.chmodSync(wrapperPath, '755');
      console.log(`✅ 创建备份包装脚本: ${wrapperPath}`);
    } catch (error) {
      console.warn('⚠️  设置脚本权限失败:', error.message);
    }

    return wrapperPath;
  }

  /**
   * 生成cron配置
   */
  generateCronConfig() {
    const wrapperPath = this.generateBackupWrapper();
    
    const cronJobs = [
      {
        name: '每日备份',
        schedule: '0 2 * * *', // 每天凌晨2点
        command: wrapperPath,
        description: '每天凌晨2点执行完整数据库备份'
      },
      {
        name: '每周备份',
        schedule: '0 3 * * 0', // 每周日凌晨3点
        command: wrapperPath,
        description: '每周日凌晨3点执行额外备份（用于长期保存）'
      }
    ];

    console.log('\n📅 建议的Cron任务配置:');
    console.log('==========================================');
    
    cronJobs.forEach(job => {
      console.log(`\n${job.name}:`);
      console.log(`时间: ${job.schedule}`);
      console.log(`命令: ${job.command}`);
      console.log(`说明: ${job.description}`);
      console.log(`crontab行: ${job.schedule} ${job.command}`);
    });

    return cronJobs;
  }

  /**
   * 交互式安装cron任务
   */
  async installCronJob() {
    const cronJobs = this.generateCronConfig();
    
    console.log('\n🤖 自动安装cron任务...');
    
    try {
      // 获取当前crontab
      let currentCrontab = '';
      try {
        const { stdout } = await execAsync('crontab -l 2>/dev/null');
        currentCrontab = stdout;
      } catch (error) {
        // 没有现有的crontab，这是正常的
        console.log('📝 没有现有的crontab，将创建新的');
      }

      // 检查是否已存在备份任务
      if (currentCrontab.includes('backup-wrapper.sh')) {
        console.log('⚠️  检测到已存在的备份任务，跳过安装');
        return;
      }

      // 准备新的crontab内容
      let newCrontab = currentCrontab.trim();
      
      if (newCrontab.length > 0) {
        newCrontab += '\n';
      }

      // 添加备份任务
      newCrontab += '\n# 自动数据库备份任务\n';
      cronJobs.forEach(job => {
        newCrontab += `# ${job.description}\n`;
        newCrontab += `${job.schedule} ${job.command}\n`;
      });

      // 创建临时crontab文件
      const tempCronFile = path.join(this.logDir, 'temp_crontab');
      fs.writeFileSync(tempCronFile, newCrontab);

      // 安装新的crontab
      await execAsync(`crontab "${tempCronFile}"`);
      
      // 删除临时文件
      fs.unlinkSync(tempCronFile);

      console.log('✅ Cron任务安装成功!');
      
      // 验证安装
      const { stdout } = await execAsync('crontab -l');
      console.log('\n📋 当前的crontab内容:');
      console.log(stdout);

    } catch (error) {
      console.error('❌ Cron任务安装失败:', error.message);
      console.log('\n💡 手动安装说明:');
      console.log('1. 运行命令: crontab -e');
      console.log('2. 添加以下行:');
      cronJobs.forEach(job => {
        console.log(`   ${job.schedule} ${job.command}`);
      });
    }
  }

  /**
   * 生成备份监控脚本
   */
  generateMonitoringScript() {
    const monitorPath = path.join(this.projectRoot, 'scripts/backup-monitor.js');
    const logFile = path.join(this.logDir, 'backup.log');
    
    const monitorContent = `#!/usr/bin/env node

/**
 * 备份监控脚本
 * 检查备份状态和发送告警
 */

const fs = require('fs');
const path = require('path');

class BackupMonitor {
  constructor() {
    this.logFile = '${logFile}';
    this.backupDir = path.join(__dirname, '../backups');
  }

  /**
   * 检查最近的备份状态
   */
  checkRecentBackup() {
    console.log('🔍 检查最近的备份状态...');
    
    try {
      if (!fs.existsSync(this.logFile)) {
        console.log('⚠️  备份日志文件不存在');
        return false;
      }

      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const lines = logContent.split('\\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        console.log('⚠️  备份日志为空');
        return false;
      }

      // 检查最后几行
      const recentLines = lines.slice(-10);
      const hasSuccess = recentLines.some(line => line.includes('备份成功完成'));
      const hasFailure = recentLines.some(line => line.includes('备份失败'));

      if (hasSuccess) {
        console.log('✅ 最近的备份成功');
        return true;
      } else if (hasFailure) {
        console.log('❌ 最近的备份失败');
        return false;
      } else {
        console.log('⚠️  无法确定最近备份状态');
        return false;
      }

    } catch (error) {
      console.error('❌ 检查备份状态失败:', error.message);
      return false;
    }
  }

  /**
   * 检查备份文件
   */
  checkBackupFiles() {
    console.log('📁 检查备份文件...');
    
    const directories = ['postgres', 'redis', 'full'];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const dir of directories) {
      const dirPath = path.join(this.backupDir, dir);
      
      try {
        if (!fs.existsSync(dirPath)) {
          console.log(\`⚠️  备份目录不存在: \${dir}\`);
          continue;
        }

        const files = fs.readdirSync(dirPath);
        const recentFiles = files.filter(file => {
          const filepath = path.join(dirPath, file);
          const stats = fs.statSync(filepath);
          return stats.mtime > oneDayAgo;
        });

        console.log(\`📊 \${dir}: \${recentFiles.length} 个最近24小时的备份文件\`);

      } catch (error) {
        console.warn(\`⚠️  检查目录失败 \${dir}:\`, error.message);
      }
    }
  }

  /**
   * 运行监控检查
   */
  run() {
    console.log('🚀 开始备份监控检查...');
    console.log(\`📅 时间: \${new Date().toISOString()}\`);
    
    const backupStatus = this.checkRecentBackup();
    this.checkBackupFiles();
    
    console.log(\`\\n📊 监控结果: \${backupStatus ? '✅ 正常' : '❌ 异常'}\`);
    
    process.exit(backupStatus ? 0 : 1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new BackupMonitor();
  monitor.run();
}

module.exports = BackupMonitor;
`;

    fs.writeFileSync(monitorPath, monitorContent);
    console.log(`✅ 创建备份监控脚本: ${monitorPath}`);
    
    return monitorPath;
  }

  /**
   * 生成备份说明文档
   */
  generateDocumentation() {
    const docPath = path.join(this.projectRoot, 'docs/backup-recovery.md');
    const docContent = `# 数据备份与恢复指南

## 概述

本项目提供了完整的数据库备份和恢复解决方案，支持PostgreSQL和Redis数据库的自动备份、手动备份和灾难恢复。

## 快速开始

### 手动备份

\`\`\`bash
# 完整备份（PostgreSQL + Redis）
npm run backup

# 仅备份PostgreSQL
npm run backup:postgres

# 仅备份Redis  
npm run backup:redis
\`\`\`

### 数据恢复

\`\`\`bash
# 交互式恢复（推荐）
npm run restore

# 恢复PostgreSQL
npm run restore:postgres /path/to/backup.sql

# 恢复Redis
npm run restore:redis /path/to/backup.rdb
\`\`\`

## 自动化备份

### 定时任务

项目配置了以下自动备份计划：

- **每日备份**: 每天凌晨2点执行完整备份
- **每周备份**: 每周日凌晨3点执行额外备份

### 配置环境变量

在 \`.env\` 文件中配置备份相关参数：

\`\`\`env
# 备份配置
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7
BACKUP_COMPRESSION=true

# 数据库连接
DB_HOST=localhost
DB_PORT=5432
DB_NAME=company_portal
DB_USER=postgres
DB_PASSWORD=your_password

# Redis连接
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
\`\`\`

## 备份文件结构

\`\`\`
backups/
├── postgres/          # PostgreSQL备份文件
│   ├── postgres_company_portal_2025-01-30T10-00-00Z.sql
│   └── postgres_company_portal_2025-01-30T10-00-00Z.sql.gz
├── redis/             # Redis备份文件
│   ├── redis_2025-01-30T10-00-00Z.rdb
│   └── redis_2025-01-30T10-00-00Z.rdb.gz
└── full/              # 备份报告
    └── backup_report_2025-01-30T10-00-00Z.json
\`\`\`

## 监控和告警

### 备份状态检查

\`\`\`bash
# 检查备份状态
node scripts/backup-monitor.js
\`\`\`

### 日志文件

备份日志存储在 \`logs/backup.log\` 文件中，包含：

- 备份开始/结束时间
- 备份成功/失败状态
- 错误信息和警告
- 文件大小和压缩信息

## 最佳实践

### 备份策略

1. **3-2-1原则**: 3份数据副本，2种不同存储介质，1份异地备份
2. **定期测试**: 定期测试备份恢复流程
3. **监控告警**: 配置备份失败告警通知
4. **文档记录**: 记录备份和恢复操作

### 安全考虑

1. **备份加密**: 生产环境建议对备份文件进行加密
2. **访问控制**: 限制备份文件的访问权限
3. **传输安全**: 使用安全连接传输备份文件
4. **审计日志**: 记录备份和恢复操作的审计日志

## 故障排除

### 常见问题

**问题**: PostgreSQL备份失败
**解决**: 检查数据库连接配置和pg_dump工具是否安装

**问题**: Redis备份文件为空
**解决**: 确认Redis服务运行正常，检查BGSAVE权限

**问题**: 恢复操作被拒绝
**解决**: 确认有足够的数据库权限执行DROP/CREATE操作

### 手动恢复步骤

如果自动恢复脚本失败，可以手动执行：

\`\`\`bash
# 手动恢复PostgreSQL
psql -h localhost -U postgres -d postgres -f backup.sql

# 手动恢复Redis
redis-cli FLUSHALL
cp backup.rdb /var/lib/redis/dump.rdb
sudo systemctl restart redis
\`\`\`

## 联系支持

如遇到备份恢复相关问题，请联系技术支持团队。
`;

    // 确保docs目录存在
    const docsDir = path.dirname(docPath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(docPath, docContent);
    console.log(`📚 创建备份文档: ${docPath}`);
  }

  /**
   * 主安装流程
   */
  async run() {
    console.log('🔧 开始配置自动化备份系统...');
    
    try {
      // 初始化环境
      this.initLogDirectory();
      
      // 检查环境
      await this.checkEnvironment();
      
      // 生成脚本和配置
      this.generateCronConfig();
      this.generateMonitoringScript();
      this.generateDocumentation();
      
      // 安装cron任务（可选）
      console.log('\n❓ 是否要自动安装cron任务？');
      console.log('  如果选择"否"，您需要手动配置定时任务');
      
      // 这里可以添加用户交互，现在先跳过自动安装
      console.log('\n✅ 自动化备份系统配置完成!');
      console.log('\n📋 下一步操作:');
      console.log('1. 检查环境变量配置（.env文件）');
      console.log('2. 测试备份功能：npm run backup');
      console.log('3. 配置定时任务（可选）');
      console.log('4. 阅读文档：docs/backup-recovery.md');
      
    } catch (error) {
      console.error('❌ 配置过程中出现错误:', error);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const setup = new BackupCronSetup();
  setup.run();
}

module.exports = BackupCronSetup; 