/**
 * HTTPS服务器配置
 * 支持HTTP到HTTPS自动重定向和增强安全配置
 */

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const security = require('./middleware/security');
const monitor = require('./utils/monitor');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 环境配置
const NODE_ENV = process.env.NODE_ENV || 'development';
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const FORCE_HTTPS = process.env.FORCE_HTTPS === 'true';

// SSL证书路径
const SSL_KEY_PATH =
  process.env.SSL_KEY_PATH ||
  path.join(__dirname, '..', 'ssl', 'private-key.pem');
const SSL_CERT_PATH =
  process.env.SSL_CERT_PATH ||
  path.join(__dirname, '..', 'ssl', 'certificate.pem');

// 创建Express应用
const app = express();

// 信任代理（用于Nginx等反向代理）
app.set('trust proxy', true);

// 视图引擎配置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件配置
app.use(express.static(path.join(__dirname, '..', 'public')));

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// HTTPS重定向中间件（仅在生产环境或强制HTTPS时启用）
if (NODE_ENV === 'production' || FORCE_HTTPS) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https' && !req.secure) {
      const httpsUrl = `https://${req.get('host')}${req.url}`;
      console.log(`🔒 重定向到HTTPS: ${req.url} -> ${httpsUrl}`);
      return res.redirect(301, httpsUrl);
    }
    next();
  });
}

// 增强安全中间件
app.use(security.helmet);
app.use(security.cors);
app.use(security.sanitizeInput);
app.use(security.securityHeaders);
app.use(security.requestLogger);

// HTTPS特定安全头
app.use((req, res, next) => {
  if (req.secure || req.header('x-forwarded-proto') === 'https') {
    // 强制HTTPS传输安全（HSTS）
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // 升级不安全请求
    res.setHeader(
      'Content-Security-Policy',
      'default-src \'self\'; ' +
        'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' cdn.jsdelivr.net; ' +
        'style-src \'self\' \'unsafe-inline\' cdn.jsdelivr.net; ' +
        'img-src \'self\' data: https:; ' +
        'font-src \'self\' cdn.jsdelivr.net; ' +
        'connect-src \'self\'; ' +
        'upgrade-insecure-requests'
    );
  }
  next();
});

// 速率限制中间件
app.use('/api', security.apiRateLimit);

// 监控中间件
app.use(monitor.requestMiddleware());

// 路由配置
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth-pages'));
app.use('/api', require('./routes/api'));

// 健康检查端点（支持负载均衡器检查）
app.get('/health', (req, res) => {
  const healthStatus = monitor.getHealthStatus();
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    ...healthStatus,
    timestamp: new Date().toISOString(),
    protocol: req.secure ? 'https' : 'http',
    environment: NODE_ENV,
  });
});

// SSL状态检查端点
app.get('/ssl-status', (req, res) => {
  const sslStatus = {
    enabled: req.secure || req.header('x-forwarded-proto') === 'https',
    protocol: req.protocol,
    secure: req.secure,
    forwardedProto: req.header('x-forwarded-proto'),
    host: req.get('host'),
    environment: NODE_ENV,
    certificates: {
      development: fs.existsSync(SSL_CERT_PATH),
      production:
        NODE_ENV === 'production' ? 'check-letsencrypt' : 'not-applicable',
    },
    timestamp: new Date().toISOString(),
  };

  res.json(sslStatus);
});

// 404错误处理
app.use((req, res) => {
  res.status(404).render('404', {
    title: '页面未找到',
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error('服务器错误:', err.stack);
  monitor.logError({
    level: 'error',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(500).render('500', {
    title: '服务器内部错误',
  });
});

// 启动服务器函数
function startServers() {
  // HTTP服务器（用于重定向或开发环境）
  const httpServer = http.createServer(app);

  httpServer.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP服务器运行在端口 ${HTTP_PORT}`);
    console.log(`📝 HTTP地址: http://localhost:${HTTP_PORT}`);

    if (NODE_ENV === 'production' || FORCE_HTTPS) {
      console.log('🔒 HTTP请求将自动重定向到HTTPS');
    }
  });

  // HTTPS服务器（如果证书存在）
  if (fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH)) {
    try {
      const sslOptions = {
        key: fs.readFileSync(SSL_KEY_PATH),
        cert: fs.readFileSync(SSL_CERT_PATH),
        // 安全配置
        secureProtocol: 'TLSv1_2_method',
        ciphers: [
          'ECDHE-RSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES256-SHA384',
          'ECDHE-RSA-AES128-SHA256',
          'ECDHE-RSA-AES256-SHA',
          'ECDHE-RSA-AES128-SHA',
        ].join(':'),
        honorCipherOrder: true,
      };

      const httpsServer = https.createServer(sslOptions, app);

      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🔒 HTTPS服务器运行在端口 ${HTTPS_PORT}`);
        console.log(`📝 HTTPS地址: https://localhost:${HTTPS_PORT}`);
        console.log('🛡️  SSL/TLS安全连接已启用');

        // 启动监控
        monitor.startPeriodicMonitoring();
        console.log('📊 监控系统已启动');

        // 显示API端点
        console.log('\n📚 API端点:');
        console.log(`   https://localhost:${HTTPS_PORT}/api/docs`);
        console.log(`   https://localhost:${HTTPS_PORT}/api/health`);
        console.log(`   https://localhost:${HTTPS_PORT}/ssl-status`);

        // 显示环境信息
        console.log(`\n🏷️  环境: ${NODE_ENV}`);
        console.log(`🔧 配置: ${FORCE_HTTPS ? '强制HTTPS' : 'HTTP/HTTPS并存'}`);
      });

      httpsServer.on('error', err => {
        console.error('❌ HTTPS服务器启动失败:', err.message);
      });
    } catch (err) {
      console.error('❌ SSL证书加载失败:', err.message);
      console.log('💡 提示: 运行 `node scripts/generate-ssl.js` 生成开发证书');
    }
  } else {
    console.log('⚠️  SSL证书未找到，仅启动HTTP服务器');
    console.log('💡 提示: 运行 `node scripts/generate-ssl.js` 生成开发证书');
  }

  // 优雅关闭处理
  process.on('SIGTERM', () => {
    console.log('\n🛑 收到SIGTERM信号，正在优雅关闭服务器...');
    httpServer.close(() => {
      console.log('✅ HTTP服务器已关闭');
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 收到SIGINT信号，正在优雅关闭服务器...');
    httpServer.close(() => {
      console.log('✅ HTTP服务器已关闭');
      process.exit(0);
    });
  });
}

// 导出应用和启动函数
module.exports = { app, startServers };

// 如果直接运行此文件，启动服务器
if (require.main === module) {
  startServers();
}
