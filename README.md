# 知识中心 (Knowledge Hub)

个人知识管理系统，具有AI驱动的内容分类功能。

## 在线演示

访问 [https://knowledge-hub-libohan-ha.vercel.app/](https://knowledge-hub-libohan-ha.vercel.app/) 查看在线演示。

## 功能

- AI内容分类：自动将输入内容分类为待看文章、想法、安排和干货收藏
- Supabase数据库集成：存储和检索分类内容
- 响应式UI：适配各种设备尺寸

## 技术栈

- Next.js
- React
- Tailwind CSS
- Supabase (PostgreSQL)
- DeepSeek AI API

## 设置说明

### 1. 安装依赖

```bash
npm install
```

### 2. 设置Supabase数据库

1. 在Supabase中创建一个新项目
2. 使用`supabase/migrations/create_classified_content_table.sql`中的SQL脚本创建必要的表和权限（包含items表和health_check表）
3. 在`lib/supabase.js`中更新Supabase URL和匿名密钥

### 3. 设置DeepSeek AI API

1. 在DeepSeek获取API密钥
2. 在`lib/ai-service.js`中更新API密钥

### 4. 运行开发服务器

```bash
npm run dev
```

## 使用说明

1. 导航到"AI分类"页面
2. 在文本框中输入任何内容
3. 点击"分类内容"按钮
4. AI将自动分析内容并将其分类为不同类别
5. 分类结果将显示在页面上并保存到数据库中
6. 您可以使用类别过滤器查看已保存的分类内容

## 数据库结构

### items表

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| content | TEXT | 内容文本 |
| category | TEXT | 类别（articles, ideas, tasks, knowledge） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| user_id | UUID | 用户ID |
| is_read | BOOLEAN | 是否已读（用于文章） |

### users表

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| email | TEXT | 用户邮箱 |
| password | TEXT | 加密密码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### sessions表

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID |
| token | TEXT | 会话令牌 |
| expires_at | TIMESTAMP | 过期时间 |
| created_at | TIMESTAMP | 创建时间 |

## 部署到 Vercel

### 1. 准备工作

1. 在 GitHub 上创建仓库
2. 将代码推送到仓库

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/libohan-ha/knowledge-hub.git
git push -u origin main
```

### 2. Vercel 部署

1. 在 [Vercel](https://vercel.com) 上注册账号
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（如果需要）
5. 点击 "Deploy"

## API参考

### AI分类服务

- `classifyContent(userInput)`: 使用DeepSeek API分类用户输入内容

### 数据库服务

- `saveItem(content, category, userId)`: 保存单个分类内容
- `saveMultipleItems(classification, userId)`: 批量保存分类内容
- `getAllItems(userId)`: 获取所有分类内容
- `getItemsByCategory(category, forceRefresh, userId)`: 按类别获取分类内容
- `updateItem(id, options)`: 更新内容项
- `deleteItem(id)`: 删除内容项
