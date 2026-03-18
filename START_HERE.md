# 🎯 Excel/Word 文档分析门户 - 使用指南

欢迎使用本门户！这是一个完整的文件上传和分析系统。

## ⚡ 30 秒快速开始

### Windows 用户
1. **双击运行** → `start.bat`
2. **打开浏览器** → http://localhost:5173
3. **开始使用** ✨

### Mac/Linux 用户
```bash
bash start.sh
```
然后访问 http://localhost:5173

### 所有用户（手动启动）
```bash
# 终端 1
cd server && npm install && npm run dev

# 终端 2（新开）
npm install && npm run dev
```

## 📚 完整文档

| 📄 文档 | 📝 说明 | ⏱️ 用时 |
|---------|--------|--------|
| **[README.md](./README.md)** | 项目概览、特性介绍 | 2 分钟 |
| **[QUICKSTART.md](./QUICKSTART.md)** | 最快的安装方法 | **5 分钟** ⭐ |
| **[SETUP.md](./SETUP.md)** | 详细的功能说明 | 10 分钟 |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 部署和优化指南 | 15 分钟 |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | 项目完整总结 | 20 分钟 |

**→ 建议按顺序阅读上述文档**

## ✨ 功能一览

### 🎨 前端功能
- ✅ 美观的文件选择界面
- ✅ 拖放和点击上传
- ✅ 实时文件验证
- ✅ 后端连接检测
- ✅ 优雅的错误提示

### 🔧 后端功能
- ✅ Excel (.xlsx, .xls) 解析
- ✅ Word (.docx, .doc) 解析
- ✅ 数据提取和展示
- ✅ 自动文件清理
- ✅ 完整的 API 接口

### 📊 结果展示
- ✅ Excel Sheet 列表
- ✅ 数据表格预览（前 10 行）
- ✅ Word 段落内容
- ✅ 文件统计信息

## 🚀 运行状态检查

启动后，您应该看到：

```
✅ 前端：http://localhost:5173
✅ 后端：http://localhost:3001
```

### 快速验证
```bash
# 检查后端是否运行
curl http://localhost:3001/api/health

# 预期输出
{"status":"ok","message":"后台服务正常运行"}
```

## 🎯 使用步骤

1. **访问应用** → 打开 http://localhost:5173
2. **选择文件** → 点击上传区域或拖放文件
3. **上传分析** → 点击绿色的"上传并分析"按钮
4. **查看结果** → 分析结果会显示在下方
5. **重新开始** → 点击红色的"重新开始"按钮

## 💡 提示

```
📁 支持的文件：Excel (.xlsx, .xls) 和 Word (.docx, .doc)
📦 文件大小：最大 10MB
⏱️ 处理时间：通常 1-3 秒
```

## 🆘 遇到问题？

### ❌ 后端不运行
```bash
# 检查是否发生错误
cd server && npm run dev

# 看到这个就成功了：
# 📊 后台服务已启动: http://localhost:3001
```

### ❌ 文件无法上传
- 确认文件格式正确
- 确认文件大小 < 10MB
- 检查后端服务是否运行

### ❌ 按钮是灰色的
- 已经选择文件了吗？
- 后端服务运行中吗？

查看 **[SETUP.md](./SETUP.md)** 的故障排查部分获取更多帮助。

## 📦 项目结构

```
excel-ai-portal/
├── src/                  # 前端应用
│   ├── App.tsx          # 主应用
│   ├── api.ts           # API 接口
│   └── config.ts        # 配置文件
├── server/              # 后端服务
│   └── index.js         # Express 服务器
├── start.bat            # Windows 快速启动
├── start.ps1            # PowerShell 启动
├── start.sh             # Linux/Mac 启动
└── 📚 文档文件夹        # 完整文档
```

## 🔧 常用命令

```bash
# 安装依赖
npm install                    # 前端
cd server && npm install      # 后端

# 开发模式
npm run dev                    # 前端（端口 5173）
cd server && npm run dev       # 后端（端口 3001）

# 生产构建
npm run build                  # 构建前端
npm run preview               # 预览构建结果

# 代码检查
npm run lint                  # 检查代码质量
```

## 🌟 下一步

### 刚开始？
1. 阅读 [QUICKSTART.md](./QUICKSTART.md)
2. 启动应用
3. 上传一个 Excel 或 Word 文件试试

### 想深入了解？
1. 查看 [SETUP.md](./SETUP.md) 了解详细功能
2. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 学习部署
3. 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解项目结构

### 想要自定义？
1. 修改 `src/config.ts` 改变 API 地址
2. 修改 `src/App.css` 改变样式
3. 修改 `server/index.js` 改变后端逻辑

## 📞 需要帮助？

| 问题 | 查看文档 |
|------|--------|
| 如何快速开始？ | [QUICKSTART.md](./QUICKSTART.md) |
| 具体怎么用？ | [SETUP.md](./SETUP.md) |
| 怎么部署？ | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| 项目详情？ | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| 总体介绍？ | [README.md](./README.md) |

## 🎉 你已经准备好了！

```
✨ 启动应用   →  npm run dev (终端1)
              cd server && npm run dev (终端2)

🌐 打开浏览器  →  http://localhost:5173

📁 选择文件   →  点击上传区域

🚀 上传分析   →  点击"上传并分析"按钮

✅ 完成！    →  查看分析结果
```

---

**祝您使用愉快！** 🎊

如有任何问题，请查阅相关文档或查看浏览器控制台的错误信息。
