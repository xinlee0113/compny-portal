#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 
 * 检查项目的代码质量、测试覆盖率、安全漏洞等
 * 使用方法: npm run quality-check
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityChecker {
  constructor() {
    this.results = {
      lint: null,
      tests: null,
      coverage: null,
      security: null,
      performance: null,
    };
    this.passed = true;
  }

  async run() {
    console.log('🚀 开始代码质量检查...\n');

    try {
      await this.checkLint();
      await this.runTests();
      await this.checkCoverage();
      await this.checkSecurity();
      await this.generateReport();
      
      console.log('\n📊 质量检查完成');
      
      if (this.passed) {
        console.log('✅ 所有检查通过！');
        process.exit(0);
      } else {
        console.log('❌ 质量检查未通过，请修复问题后重试');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ 质量检查过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  async checkLint() {
    console.log('🔍 检查代码规范...');
    
    try {
                    const output = execSync('npm run lint', { 
         encoding: 'utf8',
         stdio: 'pipe'
       });
      
      this.results.lint = {
        passed: true,
        message: '代码规范检查通过',
        details: output
      };
      
      console.log('✅ 代码规范检查通过');
    } catch (error) {
      this.results.lint = {
        passed: false,
        message: '代码规范检查失败',
        details: error.stdout || error.message
      };
      
      console.log('❌ 代码规范检查失败');
      console.log(error.stdout);
      this.passed = false;
    }
  }

  async runTests() {
    console.log('🧪 运行测试套件...');
    
    try {
                    const output = execSync('npm run test:ci', { 
         encoding: 'utf8',
         stdio: 'pipe'
       });
      
      // 解析测试结果
      const testResults = this.parseTestOutput(output);
      
      this.results.tests = {
        passed: testResults.passed === testResults.total,
        message: `测试结果: ${testResults.passed}/${testResults.total} 通过`,
        details: testResults
      };
      
      if (this.results.tests.passed) {
        console.log(`✅ 测试通过 (${testResults.passed}/${testResults.total})`);
      } else {
        console.log(`❌ 测试失败 (${testResults.passed}/${testResults.total})`);
        this.passed = false;
      }
    } catch (error) {
      this.results.tests = {
        passed: false,
        message: '测试执行失败',
        details: error.stdout || error.message
      };
      
      console.log('❌ 测试执行失败');
      this.passed = false;
    }
  }

  async checkCoverage() {
    console.log('📊 检查测试覆盖率...');
    
    try {
      // 读取覆盖率报告
      const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
      
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const totalCoverage = coverage.total;
        
        const coverageThreshold = {
          lines: 90,
          functions: 90,
          branches: 80,
          statements: 90
        };
        
        const coverageResults = {
          lines: totalCoverage.lines.pct,
          functions: totalCoverage.functions.pct,
          branches: totalCoverage.branches.pct,
          statements: totalCoverage.statements.pct
        };
        
        const passed = Object.keys(coverageThreshold).every(key => 
          coverageResults[key] >= coverageThreshold[key]
        );
        
        this.results.coverage = {
          passed,
          message: passed ? '测试覆盖率达标' : '测试覆盖率不足',
          details: {
            results: coverageResults,
            thresholds: coverageThreshold
          }
        };
        
        if (passed) {
          console.log('✅ 测试覆盖率达标');
          console.log(`   行覆盖率: ${coverageResults.lines}%`);
          console.log(`   函数覆盖率: ${coverageResults.functions}%`);
          console.log(`   分支覆盖率: ${coverageResults.branches}%`);
          console.log(`   语句覆盖率: ${coverageResults.statements}%`);
        } else {
          console.log('❌ 测试覆盖率不足');
          Object.keys(coverageThreshold).forEach(key => {
            const actual = coverageResults[key];
            const required = coverageThreshold[key];
            const status = actual >= required ? '✅' : '❌';
            console.log(`   ${status} ${key}: ${actual}% (需要 ${required}%)`);
          });
          this.passed = false;
        }
      } else {
        console.log('⚠️  未找到覆盖率报告');
      }
    } catch (error) {
      console.log('❌ 覆盖率检查失败:', error.message);
    }
  }

  async checkSecurity() {
    console.log('🔒 检查安全漏洞...');
    
    try {
                    const output = execSync('npm audit --audit-level=moderate', { 
         encoding: 'utf8',
         stdio: 'pipe'
       });
      
      this.results.security = {
        passed: true,
        message: '安全检查通过',
        details: '未发现安全漏洞'
      };
      
      console.log('✅ 安全检查通过');
    } catch (error) {
      const auditOutput = error.stdout || error.message;
      
      // 检查是否有高危漏洞
      const hasHighVulnerabilities = auditOutput.includes('high') || 
                                   auditOutput.includes('critical');
      
      this.results.security = {
        passed: !hasHighVulnerabilities,
        message: hasHighVulnerabilities ? '发现安全漏洞' : '发现低级别漏洞',
        details: auditOutput
      };
      
      if (hasHighVulnerabilities) {
        console.log('❌ 发现高级别安全漏洞');
        this.passed = false;
      } else {
        console.log('⚠️  发现低级别安全问题');
      }
    }
  }

  parseTestOutput(output) {
    // 解析Jest测试输出
    const testSuiteRegex = /Test Suites: (\d+) passed(?:, (\d+) failed)?/;
    const testRegex = /Tests:\s+(\d+) passed(?:, (\d+) failed)?/;
    
    const suiteMatch = output.match(testSuiteRegex);
    const testMatch = output.match(testRegex);
    
    return {
      suites: {
        passed: parseInt(suiteMatch?.[1] || '0'),
        failed: parseInt(suiteMatch?.[2] || '0'),
        total: parseInt(suiteMatch?.[1] || '0') + parseInt(suiteMatch?.[2] || '0')
      },
      tests: {
        passed: parseInt(testMatch?.[1] || '0'),
        failed: parseInt(testMatch?.[2] || '0'),
        total: parseInt(testMatch?.[1] || '0') + parseInt(testMatch?.[2] || '0')
      },
      passed: parseInt(testMatch?.[1] || '0'),
      total: parseInt(testMatch?.[1] || '0') + parseInt(testMatch?.[2] || '0')
    };
  }

  generateReport() {
    console.log('\n📋 质量检查报告:');
    console.log('================');
    
    const checks = [
      { name: '代码规范', result: this.results.lint },
      { name: '单元测试', result: this.results.tests },
      { name: '测试覆盖率', result: this.results.coverage },
      { name: '安全检查', result: this.results.security }
    ];
    
    checks.forEach(check => {
      if (check.result) {
        const status = check.result.passed ? '✅ 通过' : '❌ 失败';
        console.log(`${check.name}: ${status}`);
        if (!check.result.passed && check.result.message) {
          console.log(`   ${check.result.message}`);
        }
      }
    });
    
    // 生成质量评分
    const score = this.calculateQualityScore();
    console.log(`\n📈 质量评分: ${score}/100`);
    
    // 保存报告到文件
    this.saveReport(score);
  }

  calculateQualityScore() {
    let score = 0;
    let maxScore = 0;
    
    // 代码规范 (25分)
    maxScore += 25;
    if (this.results.lint?.passed) score += 25;
    
    // 测试通过率 (30分)
    maxScore += 30;
    if (this.results.tests?.passed) score += 30;
    
    // 测试覆盖率 (25分)
    maxScore += 25;
    if (this.results.coverage?.passed) score += 25;
    
    // 安全性 (20分)
    maxScore += 20;
    if (this.results.security?.passed) score += 20;
    
    return Math.round((score / maxScore) * 100);
  }

  saveReport(score) {
    const report = {
      timestamp: new Date().toISOString(),
      score,
      passed: this.passed,
      results: this.results
    };
    
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(reportDir, `quality-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 详细报告已保存: ${reportFile}`);
  }
}

// 执行质量检查
if (require.main === module) {
  const checker = new QualityChecker();
  checker.run().catch(console.error);
}

module.exports = QualityChecker;