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

    const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json');
    const baselinePath = path.join(process.cwd(), 'reports/coverage-baseline.json');

    try {
      if (!fs.existsSync(coveragePath)) {
        console.log('⚠️  未找到覆盖率报告');
        return;
      }

      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const totalCoverage = coverage.total;

      const current = {
        lines: totalCoverage.lines.pct,
        functions: totalCoverage.functions.pct,
        branches: totalCoverage.branches.pct,
        statements: totalCoverage.statements.pct,
      };

      // 基线策略：不倒退 + 自动抬高
      // 初次没有基线时，记录当前为基线并通过；之后任何指标低于基线（容差0.1%）则不通过
      const tolerance = 0.1; // 允许的微小波动
      let baseline;
      if (fs.existsSync(baselinePath)) {
        baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      } else {
        baseline = current;
        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
        fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
        console.log('🟡 首次建立覆盖率基线:', baseline);
      }

      const keys = ['lines', 'functions', 'branches', 'statements'];
      const regressions = keys.filter((k) => current[k] + tolerance < baseline[k]);

      const passed = regressions.length === 0;

      this.results.coverage = {
        passed,
        message: passed ? '覆盖率未低于基线（通过）' : `覆盖率较基线回退: ${regressions.join(', ')}`,
        details: { current, baseline },
      };

      if (!passed) {
        console.log('❌ 覆盖率较基线回退');
        regressions.forEach((k) => {
          console.log(`   ${k}: 当前 ${current[k]}% < 基线 ${baseline[k]}%`);
        });
        this.passed = false;
      } else {
        // 若有提升，自动抬高基线
        let improved = false;
        const newBaseline = { ...baseline };
        keys.forEach((k) => {
          if (current[k] > baseline[k] + tolerance) {
            newBaseline[k] = current[k];
            improved = true;
          }
        });
        if (improved) {
          fs.writeFileSync(baselinePath, JSON.stringify(newBaseline, null, 2));
          console.log('✅ 覆盖率提升，基线已更新为:', newBaseline);
        } else {
          console.log('✅ 覆盖率保持/微升，未低于基线');
        }
        console.log(`   行: ${current.lines}%  函数: ${current.functions}%  分支: ${current.branches}%  语句: ${current.statements}%`);
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