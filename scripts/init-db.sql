-- 公司门户网站数据库初始化脚本
-- 支持中文字符和全文搜索

-- 设置客户端编码
SET client_encoding = 'UTF8';

-- 创建扩展（如果不存在）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建中文分词配置（简化版本）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'chinese') THEN
        CREATE TEXT SEARCH CONFIGURATION chinese (COPY = simple);
    END IF;
END
$$;

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建数据库用户（如果在容器外需要）
-- CREATE USER company_portal WITH PASSWORD 'company_portal_2025';
-- GRANT ALL PRIVILEGES ON DATABASE company_portal TO company_portal;

COMMENT ON DATABASE company_portal IS '车载应用开发服务公司门户网站数据库';