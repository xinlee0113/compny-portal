# 认证系统 API 文档

**版本**: v1.0.0  
**基础URL**: `http://localhost:3001/api/auth`  
**更新时间**: 2025-07-29

---

## 📋 概述

车载应用开发服务公司门户网站认证系统提供完整的用户管理和身份验证功能，包括用户注册、登录、权限控制、会话管理等企业级特性。

### 🔐 认证机制

本API使用 **JWT (JSON Web Token)** 双令牌机制：
- **Access Token**: 用于API访问，有效期7天
- **Refresh Token**: 用于令牌刷新，有效期30天

### 🛡️ 安全特性

- **bcryptjs密码加密**: 12轮散列强度
- **速率限制**: 防止暴力攻击
- **角色权限控制**: 4级RBAC系统
- **会话管理**: 多设备登录追踪
- **令牌黑名单**: 即时撤销机制

---

## 🎯 快速开始

### 认证流程
```bash
1. 用户注册 → POST /register
2. 用户登录 → POST /login  
3. 获取资料 → GET /profile (需要认证)
4. 刷新令牌 → POST /refresh
5. 用户登出 → POST /logout
```

### 认证头部
```bash
Authorization: Bearer <access_token>
```

### Cookie认证 (可选)
```bash
Cookie: accessToken=<token>; refreshToken=<refresh_token>
```

---

## 📚 API端点列表

### 🟢 公开端点 (无需认证)
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `POST /refresh` - 刷新令牌
- `GET /status` - 认证状态检查

### 🔒 受保护端点 (需要认证)
- `POST /logout` - 用户登出
- `GET /verify` - 验证令牌
- `GET /profile` - 获取用户资料
- `PUT /profile` - 更新用户资料
- `POST /change-password` - 修改密码
- `GET /me` - 获取当前用户 (别名)
- `POST /logout-all` - 登出所有设备
- `GET /sessions` - 获取会话列表
- `DELETE /sessions/:id` - 撤销特定会话

---

## 🔗 详细API文档

### 1. 用户注册

**端点**: `POST /api/auth/register`  
**描述**: 创建新用户账户  
**认证**: 无需认证  
**速率限制**: 每小时3次

#### 请求体
```json
{
  "username": "string",      // 必填，3-50字符，字母数字
  "email": "string",         // 必填，有效邮箱格式
  "password": "string",      // 必填，至少6字符
  "confirmPassword": "string", // 必填，需与password一致
  "firstName": "string",     // 可选，名字
  "lastName": "string",      // 可选，姓氏
  "phone": "string"          // 可选，手机号码
}
```

#### 成功响应 (201)
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "张",
      "lastName": "三",
      "role": "user",
      "status": "active"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "7d",
      "tokenType": "Bearer"
    }
  }
}
```

#### 错误响应
```json
// 400 - 输入验证失败
{
  "success": false,
  "message": "用户名、邮箱和密码不能为空",
  "code": "MISSING_REQUIRED_FIELDS"
}

// 409 - 用户名已存在
{
  "success": false,
  "message": "用户名已被注册",
  "code": "USERNAME_ALREADY_EXISTS"
}

// 503 - 服务不可用
{
  "success": false,
  "message": "用户注册服务暂时不可用，请稍后再试",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

### 2. 用户登录

**端点**: `POST /api/auth/login`  
**描述**: 用户身份验证并获取访问令牌  
**认证**: 无需认证  
**速率限制**: 每15分钟5次

#### 请求体
```json
{
  "login": "string",        // 必填，用户名或邮箱
  "password": "string",     // 必填，用户密码
  "rememberMe": "boolean"   // 可选，记住我选项
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "张",
      "lastName": "三",
      "role": "user",
      "status": "active",
      "lastLogin": "2025-07-29T01:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "7d",
      "tokenType": "Bearer"
    }
  }
}
```

#### 错误响应
```json
// 401 - 认证失败
{
  "success": false,
  "message": "用户名/邮箱或密码错误",
  "code": "INVALID_CREDENTIALS"
}

// 403 - 账户被暂停
{
  "success": false,
  "message": "账户已被暂停，请联系管理员",
  "code": "ACCOUNT_SUSPENDED"
}

// 423 - 账户被锁定
{
  "success": false,
  "message": "账户已被锁定，请稍后再试",
  "code": "ACCOUNT_LOCKED"
}
```

---

### 3. 用户登出

**端点**: `POST /api/auth/logout`  
**描述**: 登出当前用户并撤销令牌  
**认证**: 需要认证

#### 请求体
```json
{}  // 空请求体
```

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "登出成功",
  "data": null
}
```

---

### 4. 刷新令牌

**端点**: `POST /api/auth/refresh`  
**描述**: 使用refresh token获取新的access token  
**认证**: 需要refresh token

#### 请求体
```json
{
  "refreshToken": "string"  // 可选，也可通过Cookie提供
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "令牌刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d",
    "tokenType": "Bearer"
  }
}
```

#### 错误响应
```json
// 401 - Refresh Token无效
{
  "success": false,
  "message": "无效的刷新令牌",
  "code": "INVALID_REFRESH_TOKEN"
}
```

---

### 5. 验证令牌

**端点**: `GET /api/auth/verify`  
**描述**: 验证当前访问令牌的有效性  
**认证**: 需要认证

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "令牌有效",
  "data": {
    "valid": true,
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "status": "active"
    },
    "token": {
      "issuer": "company-portal",
      "audience": "company-portal-users",
      "issuedAt": "2025-07-29T01:00:00.000Z",
      "expiresAt": "2025-08-05T01:00:00.000Z"
    }
  }
}
```

---

### 6. 获取用户资料

**端点**: `GET /api/auth/profile`  
**描述**: 获取当前用户的详细资料  
**认证**: 需要认证

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "获取用户资料成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "张",
      "lastName": "三",
      "phone": "+86-138-0000-0000",
      "role": "user",
      "status": "active",
      "emailVerified": false,
      "lastLogin": "2025-07-29T01:30:00.000Z",
      "createdAt": "2025-07-20T10:00:00.000Z",
      "updatedAt": "2025-07-29T01:30:00.000Z"
    }
  }
}
```

---

### 7. 更新用户资料

**端点**: `PUT /api/auth/profile`  
**描述**: 更新当前用户的基本信息  
**认证**: 需要认证

#### 请求体
```json
{
  "firstName": "string",  // 可选，名字
  "lastName": "string",   // 可选，姓氏
  "phone": "string"       // 可选，手机号码
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "用户资料更新成功",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "李",
      "lastName": "四",
      "phone": "+86-139-0000-0000",
      "role": "user",
      "status": "active"
    }
  }
}
```

#### 错误响应
```json
// 400 - 无更新数据
{
  "success": false,
  "message": "没有要更新的数据",
  "code": "NO_UPDATE_DATA"
}
```

---

### 8. 修改密码

**端点**: `POST /api/auth/change-password`  
**描述**: 修改当前用户的登录密码  
**认证**: 需要认证

#### 请求体
```json
{
  "currentPassword": "string",     // 必填，当前密码
  "newPassword": "string",         // 必填，新密码，至少6字符
  "confirmNewPassword": "string"   // 必填，确认新密码
}
```

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "密码修改成功",
  "data": null
}
```

#### 错误响应
```json
// 401 - 当前密码错误
{
  "success": false,
  "message": "当前密码错误",
  "code": "INVALID_CURRENT_PASSWORD"
}

// 400 - 密码不匹配
{
  "success": false,
  "message": "新密码确认不匹配",
  "code": "PASSWORD_MISMATCH"
}
```

---

### 9. 认证状态检查

**端点**: `GET /api/auth/status`  
**描述**: 检查当前认证状态，支持可选认证  
**认证**: 可选

#### 成功响应 (200)
```json
// 已认证用户
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "status": "active"
    }
  }
}

// 未认证用户
{
  "success": true,
  "data": {
    "authenticated": false,
    "user": null
  }
}
```

---

### 10. 登出所有设备

**端点**: `POST /api/auth/logout-all`  
**描述**: 撤销用户在所有设备上的会话  
**认证**: 需要认证

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "已从所有设备登出",
  "data": null
}
```

---

### 11. 获取会话列表

**端点**: `GET /api/auth/sessions`  
**描述**: 获取当前用户的所有活跃会话  
**认证**: 需要认证

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "获取会话列表成功",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "deviceType": "desktop",
        "browser": "Chrome",
        "os": "Windows",
        "ipAddress": "192.168.1.100",
        "lastActivity": "2025-07-29T01:30:00.000Z",
        "createdAt": "2025-07-29T01:00:00.000Z",
        "current": true
      },
      {
        "id": "uuid",
        "deviceType": "mobile",
        "browser": "Safari",
        "os": "iOS",
        "ipAddress": "192.168.1.101",
        "lastActivity": "2025-07-28T20:00:00.000Z",
        "createdAt": "2025-07-28T19:30:00.000Z",
        "current": false
      }
    ],
    "total": 2
  }
}
```

---

### 12. 撤销特定会话

**端点**: `DELETE /api/auth/sessions/:sessionId`  
**描述**: 撤销指定的用户会话  
**认证**: 需要认证

#### 路径参数
- `sessionId`: 要撤销的会话ID

#### 成功响应 (200)
```json
{
  "success": true,
  "message": "会话已撤销",
  "data": null
}
```

#### 错误响应
```json
// 404 - 会话不存在
{
  "success": false,
  "message": "会话不存在",
  "code": "SESSION_NOT_FOUND"
}

// 403 - 权限不足
{
  "success": false,
  "message": "无权限操作此会话",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

---

## 🔒 权限控制

### 角色层级
```bash
admin    # 管理员 - 最高权限
manager  # 经理 - 管理权限
employee # 员工 - 业务权限  
user     # 用户 - 基础权限
```

### 权限检查中间件
```javascript
// 示例：需要管理员权限
app.get('/admin/users', requireAdmin, controller.getUsers);

// 示例：需要员工以上权限
app.get('/dashboard', requireStaff, controller.getDashboard);
```

---

## 📊 错误码参考

### 认证相关 (4xx)
| 错误码 | HTTP状态 | 描述 |
|--------|----------|------|
| `MISSING_TOKEN` | 401 | 缺少访问令牌 |
| `INVALID_TOKEN` | 401 | 无效的访问令牌 |
| `TOKEN_REVOKED` | 401 | 令牌已被撤销 |
| `USER_NOT_FOUND` | 401 | 用户不存在 |
| `USER_DISABLED` | 401 | 用户账户已被禁用 |
| `INVALID_CREDENTIALS` | 401 | 登录凭据错误 |
| `ACCOUNT_SUSPENDED` | 403 | 账户已被暂停 |
| `ACCOUNT_LOCKED` | 423 | 账户已被锁定 |
| `INSUFFICIENT_PERMISSIONS` | 403 | 权限不足 |

### 业务相关 (4xx)
| 错误码 | HTTP状态 | 描述 |
|--------|----------|------|
| `MISSING_REQUIRED_FIELDS` | 400 | 缺少必填字段 |
| `PASSWORD_MISMATCH` | 400 | 密码不匹配 |
| `PASSWORD_TOO_SHORT` | 400 | 密码长度不足 |
| `INVALID_EMAIL_FORMAT` | 400 | 邮箱格式错误 |
| `USERNAME_ALREADY_EXISTS` | 409 | 用户名已被注册 |
| `EMAIL_ALREADY_EXISTS` | 409 | 邮箱已被注册 |

### 系统相关 (5xx)
| 错误码 | HTTP状态 | 描述 |
|--------|----------|------|
| `SERVICE_UNAVAILABLE` | 503 | 服务暂时不可用 |
| `AUTH_SERVICE_ERROR` | 500 | 认证服务内部错误 |
| `DATABASE_ERROR` | 500 | 数据库连接错误 |

---

## 🧪 测试示例

### cURL 示例

#### 用户注册
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "firstName": "张",
    "lastName": "三"
  }'
```

#### 用户登录
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "password123",
    "rememberMe": false
  }'
```

#### 获取用户资料
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript 示例

#### 注册新用户
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    firstName: '李',
    lastName: '四'
  })
});

const result = await response.json();
if (result.success) {
  // 保存令牌
  localStorage.setItem('accessToken', result.data.tokens.accessToken);
  localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
}
```

#### 认证请求
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

if (response.status === 401) {
  // 令牌过期，尝试刷新
  await refreshToken();
}
```

#### 令牌刷新
```javascript
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    localStorage.setItem('accessToken', result.data.accessToken);
  } else {
    // 重定向到登录页面
    window.location.href = '/auth/login';
  }
}
```

---

## 🔧 配置参数

### 环境变量
```bash
# JWT配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 速率限制
LOGIN_RATE_LIMIT_WINDOW=15
LOGIN_RATE_LIMIT_MAX=5
REGISTER_RATE_LIMIT_WINDOW=60
REGISTER_RATE_LIMIT_MAX=3

# API密钥 (可选)
API_KEY=your-api-key-here
```

### 安全建议
- 🔑 在生产环境中使用强随机密钥作为JWT_SECRET
- 🚫 不要在客户端代码中暴露API密钥
- 🔒 始终使用HTTPS传输敏感数据
- ⏰ 根据安全需求调整令牌过期时间
- 📊 监控异常登录行为和API调用模式

---

## 📞 支持与反馈

如有API使用问题或建议，请通过以下方式联系：
- 📧 邮箱: dev@company-portal.com
- 📱 技术支持: +86-400-xxx-xxxx
- 🔗 项目地址: [GitHub Repository]

---

**最后更新**: 2025-07-29  
**API版本**: v1.0.0  
**文档版本**: 1.0