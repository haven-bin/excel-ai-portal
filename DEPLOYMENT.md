# 📦 项目部署指南

## 环境要求

- Node.js 16+ （推荐 18+）
- npm 8+ 或 yarn/pnpm

## 快速启动（3 步）

### 第一步：安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 第二步：启动后端（新终端）

```bash
cd server
npm run dev
```

您应该看到：
```
📊 后台服务已启动: http://localhost:3001
✅ 文件分析 API: POST http://localhost:3001/api/analyze
✅ 健康检查: GET http://localhost:3001/api/health
```

### 第三步：启动前端（新终端）

```bash
npm run dev
```

您应该看到：
```
  VITE v8.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

最后，**在浏览器中打开** http://localhost:5173 ✨

## 文件介绍

### 前端文件

| 文件 | 说明 |
|------|------|
| `src/App.tsx` | 主应用组件，包含上传和结果显示 |
| `src/App.css` | 应用样式（渐变背景、卡片等） |
| `src/api.ts` | API 服务层，处理文件上传和验证 |
| `src/config.ts` | 应用配置（API 地址、文件限制等） |
| `src/main.tsx` | React 应用入口 |
| `src/index.css` | 全局样式 |

### 后端文件

| 文件 | 说明 |
|------|------|
| `server/index.js` | Express 服务器主文件 |
| `server/package.json` | 后端依赖配置 |
| `server/uploads/` | 临时文件目录（自动创建） |

### 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 前端项目配置和依赖 |
| `tsconfig.json` | TypeScript 配置 |
| `vite.config.ts` | Vite 构建配置 |
| `.gitignore` | Git 忽略规则 |

## 核心依赖

### 前端
- **react** - UI 框架
- **typescript** - 类型检查
- **vite** - 高速开发工具

### 后端
- **express** - Web 框架
- **multer** - 文件上传处理
- **xlsx** - Excel 文件解析
- **mammoth** - Word 文件解析
- **cors** - 跨域资源共享

## 功能特性详解

### 1. 文件上传与验证

✅ **前端验证**
- 文件类型检查（MIME 类型）
- 文件大小检查（最大 10MB）
- 实时错误提示

✅ **后端验证**
- 再次验证文件类型
- Multer 安全控制
- 错误日志记录

### 2. Excel 文件分析

```typescript
// 获取所有 Sheet 名称
sheets: ["Sheet1", "Sheet2", ...]

// 获取第一个 Sheet 的数据（前 100 行）
data: [
  { name: "张三", age: 30, city: "北京" },
  { name: "李四", age: 28, city: "上海" },
  ...
]

// 总行数
totalRows: 1500
```

### 3. Word 文件分析

```typescript
// 文档段落
paragraphs: [
  "这是第一段文本...",
  "这是第二段文本...",
  ...
]

// 总段落数
totalParagraphs: 45

// 表格信息（预留）
tables: []
```

### 4. 错误处理

- 后端服务离线检测
- 网络错误捕获
- 文件解析失败提示
- 用户友好的错误信息

## 新增功能建议

### 短期（易实现）
- [ ] 支持 CSV 文件格式
- [ ] 导出分析结果为 JSON
- [ ] 拖放文件上传支持
- [ ] 文件分析历史记录

### 中期（中等复杂度）
- [ ] 数据搜索和过滤
- [ ] 表格数据导出
- [ ] 图表展示（饼图、柱状图等）
- [ ] 批量文件上传

### 长期（复杂功能）
- [ ] 数据库存储分析结果
- [ ] 用户认证系统
- [ ] 权限管理
- [ ] 实时协作编辑
- [ ] AI 自动总结内容

## 性能优化建议

| 优化项 | 实现难度 | 效果 |
|--------|--------|------|
| 图片压缩 | ⭐☆☆ | 减少 50% 初始加载 |
| 代码分割 | ⭐☆☆ | 加快首屏时间 |
| 缓存策略 | ⭐☆☆ | 减少重复代码下载 |
| 虚拟滚动表格 | ⭐⭐☆ | 支持超大数据集 |
| 后端缓存 | ⭐⭐☆ | 加快相同文件处理 |
| 数据库存储 | ⭐⭐⭐ | 保存分析历史 |

## 安全建议

⚠️ **生产环境必须考虑**

1. **文件上传安全**
   ```javascript
   // 限制文件大小
   limits: { fileSize: 10 * 1024 * 1024 }
   
   // 验证文件类型
   fileFilter: (req, file, cb) => {
     allowedTypes.includes(file.mimetype)
   }
   ```

2. **扫描恶意文件**
   - 集成病毒扫描（ClamAV）
   - 沙盒执行环境

3. **速率限制**
   ```javascript
   const rateLimit = require('express-rate-limit')
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 分钟
     max: 100 // 最多 100 请求
   })
   ```

4. **数据隐私**
   - 加密敏感信息
   - HTTPS 传输
   - 定期清理临时文件

5. **认证和授权**
   - 用户登录
   - JWT 令牌
   - 权限验证

## 常见问题解决

### Q: 启动后看不到页面
**A:** 确认 Vite 服务器已启动，检查终端输出

### Q: 上传按钮是灰色的
**A:** 
1. 未选择文件
2. 后端服务未运行
3. 文件格式不支持

### Q: 文件无法分析
**A:**
1. 检查文件是否损坏
2. 查看后端错误日志
3. 确认文件格式正确

### Q: 大文件上传超时
**A:** 
```javascript
// 在 server/index.js 调整超时
app.use(express.json({ limit: '50mb' }))
app.use(cors())
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } })
```

## 开发工具

### 前端调试
```bash
# 启用开发者工具
npm run dev

# 访问 DevTools: Ctrl+Shift+I (Windows/Linux) 或 Cmd+Option+I (Mac)
```

### 后端调试
```bash
# 使用 VS Code 调试器
# 在 launch.json 中配置

# 或使用 Node 内置调试
node --inspect server/index.js
```

### API 测试
```bash
# 测试健康检查
curl http://localhost:3001/api/health

# 测试文件上传
curl -X POST -F "file=@test.xlsx" http://localhost:3001/api/analyze
```

## 构建生产版本

```bash
# 构建前端
npm run build

# 构建后清理
npm run preview

# 启动生产服务器（需要配置）
NODE_ENV=production node server/index.js
```

## 部署到云服务

### Vercel（前端）
```bash
npm install -g vercel
vercel
```

### Heroku（后端）
```bash
heroku create app-name
git push heroku main
```

### Docker
```dockerfile
# 在项目根目录创建 Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3001 5173
CMD ["node", "server/index.js"]
```

## 获取帮助

- 📖 [Vite 文档](https://cn.vitejs.dev/)
- 📖 [Express 文档](https://expressjs.com/)
- 📖 [React 文档](https://react.dev/)
- 🐛 [GitHub Issues](https://github.com)

---

**祝部署顺利！** 🚀
