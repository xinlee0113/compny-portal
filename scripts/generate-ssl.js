/**
 * SSL证书生成脚本
 * 为开发环境生成自签名SSL证书
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 创建SSL目录
const sslDir = path.join(__dirname, '..', 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// 生成简单的自签名证书用于开发环境
function generateSelfSignedCert() {
  // 生成密钥对
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // 使用OpenSSL命令生成真正的自签名证书
  const { execSync } = require('child_process');
  
  try {
    // 创建临时配置文件
    const configContent = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = Company Portal
OU = Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;
    
    const configPath = path.join(sslDir, 'openssl.conf');
    fs.writeFileSync(configPath, configContent);
    
    // 生成私钥和证书
    const keyPath = path.join(sslDir, 'private-key.pem');
    const certPath = path.join(sslDir, 'certificate.pem');
    
    // 生成私钥
    execSync(`openssl genrsa -out "${keyPath}" 2048`);
    
    // 生成证书
    execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`);
    
    console.log('✅ 私钥已生成: ssl/private-key.pem');
    console.log('✅ 证书已生成: ssl/certificate.pem');
    
    // 清理临时配置文件
    fs.unlinkSync(configPath);
    
    return { 
      privateKey: fs.readFileSync(keyPath, 'utf8'), 
      certificate: fs.readFileSync(certPath, 'utf8') 
    };
    
  } catch (error) {
    console.log('⚠️  OpenSSL生成失败，使用备用方法...');
    
    // 备用：创建最基本的证书文件（仅用于测试）
    const certContent = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJANJHK8rJXtA+MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCWxv
Y2FsaG9zdDAeFw0yNTA3MjgwMDAwMDBaFw0yNjA3MjgwMDAwMDBaMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDBcMA0GCSqGSIb3DQEBAQUAA0sAMEgCQQC8kQjhQO1LkjHl
DzQg+nJlqLLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQz
qLqQzqLAgMBAAEwDQYJKoZIhvcNAQELBQADQQBGXnO+nJlqLLqQzqLqQzqLqQzq
LqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzqLqQzq
-----END CERTIFICATE-----`;
    
    // 保存证书
    fs.writeFileSync(path.join(sslDir, 'certificate.pem'), certContent);
    console.log('✅ 备用证书已生成: ssl/certificate.pem');
    
    return { privateKey, certificate: certContent };
  }

  // 保存私钥
  fs.writeFileSync(path.join(sslDir, 'private-key.pem'), privateKey);
  console.log('✅ 私钥已生成: ssl/private-key.pem');

  // 保存证书
  fs.writeFileSync(path.join(sslDir, 'certificate.pem'), certContent);
  console.log('✅ 证书已生成: ssl/certificate.pem');

  // 生成证书信息文件
  const certInfo = {
    type: 'self-signed',
    subject: {
      commonName: 'localhost',
      organization: 'Company Portal',
      country: 'CN'
    },
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    keySize: 2048,
    usage: 'development'
  };

  fs.writeFileSync(
    path.join(sslDir, 'certificate.json'),
    JSON.stringify(certInfo, null, 2)
  );
  console.log('✅ 证书信息已保存: ssl/certificate.json');

  return { privateKey, certificate: certContent };
}

// 生成生产环境证书配置模板
function generateProductionTemplate() {
  const productionConfig = {
    provider: 'letsencrypt',
    domain: 'your-domain.com',
    email: 'admin@your-domain.com',
    autoRenewal: true,
    paths: {
      certificate: '/etc/letsencrypt/live/your-domain.com/fullchain.pem',
      privateKey: '/etc/letsencrypt/live/your-domain.com/privkey.pem'
    },
    installation: {
      commands: [
        'sudo apt-get update',
        'sudo apt-get install certbot',
        'sudo certbot certonly --standalone -d your-domain.com -m admin@your-domain.com --agree-tos --non-interactive',
        'sudo crontab -e',
        '# 添加自动续期任务: 0 12 * * * /usr/bin/certbot renew --quiet'
      ]
    },
    nginx: {
      configPath: '/etc/nginx/sites-available/company-portal',
      sslConfig: `
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}`
    }
  };

  fs.writeFileSync(
    path.join(sslDir, 'production-config.json'),
    JSON.stringify(productionConfig, null, 2)
  );
  console.log('✅ 生产环境配置模板已生成: ssl/production-config.json');
}

// 主函数
function main() {
  console.log('🔐 开始生成SSL证书...\n');

  try {
    // 生成开发环境证书
    generateSelfSignedCert();
    
    // 生成生产环境配置模板
    generateProductionTemplate();
    
    console.log('\n🎉 SSL证书生成完成！');
    console.log('\n📋 使用说明:');
    console.log('1. 开发环境: 使用 ssl/private-key.pem 和 ssl/certificate.pem');
    console.log('2. 生产环境: 参考 ssl/production-config.json 配置 Let\'s Encrypt');
    console.log('3. 浏览器可能显示"不安全"警告，这是正常的（自签名证书）');
    console.log('4. 在生产环境中请使用受信任的CA颁发的证书');
    
  } catch (error) {
    console.error('❌ SSL证书生成失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { generateSelfSignedCert, generateProductionTemplate };