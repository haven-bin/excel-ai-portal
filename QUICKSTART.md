# 🚀 快速开始指南

## Windows 用户

### 方式 1：一键启动（推荐）

**双击运行** `start.bat` 或 `start.ps1`，系统会自动：
- 创建上传目录
- 安装所有依赖
- 启动后端服务（端口 3001）
- 启动前端服务（端口 5173）

然后在浏览器中访问 `http://localhost:5173`

### 方式 2：手动启动

**终端 1 - 启动后端：**
```powershell
cd server
npm install
npm run dev
```

**终端 2 - 启动前端：**
```powershell
npm install
npm run dev
```

## Mac/Linux 用户

### 执行启动脚本

```bash
chmod +x start.sh
./start.sh
```

或手动启动：

**终端 1 - 启动后端：**
```bash
cd server
npm install
npm run dev
```

**终端 2 - 启动前端：**
```bash
npm install
npm run dev
```

## 验证安装

打开新终端检查服务器状态：

```bash
curl http://localhost:3001/api/health
```

预期响应：
```json
{"status":"ok","message":"后台服务正常运行"}
```

## 使用步骤

1. **打开应用** → http://localhost:5173
2. **选择文件** → 点击上传区域选择 Excel 或 Word 文件
3. **上传分析** → 点击"上传并分析"按钮
4. **查看结果** → 结果会显示在页面下方

## 支持的文件类型

- **Excel**: `.xlsx`, `.xls`
- **Word**: `.docx`, `.doc`

## 常见问题

❌ **错误：无法连接到后端**
- 检查后端是否正在运行
- 检查端口 3001 是否被占用
- 尝试：`netstat -ano | findstr :3001` (Windows) 或 `lsof -i :3001` (Mac/Linux)

❌ **错误：找不到模块**
- 确保在项目根目录和 server 目录都运行过 `npm install`

❌ **文件无法上传**
- 确保只上传支持的文件类型
- 文件大小不超过限制

## 项目文件说明

```
├── src/
│   ├── App.tsx         ← 主应用（文件上传、显示结果）
│   ├── App.css         ← 应用样式
│   ├── main.tsx        ← React 入口
│   └── index.css       ← 全局样式
│
├── server/
│   ├── index.js        ← Express 服务器（文件处理、分析）
│   ├── package.json    ← 后端依赖
│   ├── uploads/        ← 临时文件目录（自动创建）
│   └── .gitignore      ← Git 忽略规则
│
├── package.json        ← 前端依赖
├── start.bat           ← Windows 启动脚本
├── start.ps1           ← PowerShell 启动脚本
├── start.sh            ← Linux/Mac 启动脚本
├── SETUP.md            ← 详细设置说明
└── QUICKSTART.md       ← 本文件
```

## 下一步

- 📖 查看 [SETUP.md](SETUP.md) 了解详细功能说明
- 🔧 修改代码或样式
- 📦 部署到服务器
- 🎨 自定义界面和功能

祝使用愉快！🎉
