# 📊 Excel/Word 文档分析门户

A full-stack web application for analyzing Excel and Word documents with a modern React frontend and Express.js backend.

一个全栈 Web 应用，用于分析 Excel 和 Word 文档，包含现代化的 React 前端和 Express.js 后端。

## ✨ 特性 / Features

- 📤 **文件上传** - 支持 Excel 和 Word 文档上传
- 📊 **实时分析** - 快速解析文件内容
- 📋 **数据预览** - 查看表格数据（Excel）或文档内容（Word）
- 🎨 **现代 UI** - 响应式设计，美观易用
- ⚡ **快速部署** - 一键启动脚本
- 🛡️ **跨域支持** - CORS 已配置

## 🚀 快速开始 / Quick Start

### Windows 用户

**双击运行：** `start.bat` 或 `start.ps1`

```powershell
.\start.bat
```

然后打开浏览器访问：http://localhost:5173

### Mac/Linux 用户

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

**终端 1 - 后端 (Port 3001):**
```bash
cd server
npm install
npm run dev
```

**终端 2 - 前端 (Port 5173):**
```bash
npm install
npm run dev
```

## 📁 项目结构 / Project Structure

```
excel-ai-portal/
├── src/                          # React 前端
│   ├── App.tsx                  # 主应用组件
│   ├── App.css                  # 应用样式
│   ├── main.tsx                 # 入口文件
│   └── index.css                # 全局样式
├── server/                       # Express 后端
│   ├── index.js                 # 服务器主文件
│   ├── package.json             # 后端依赖
│   └── uploads/                 # 临时文件目录
├── start.bat                     # Windows 启动脚本
├── start.ps1                     # PowerShell 启动脚本
├── start.sh                      # Linux/Mac 启动脚本
├── QUICKSTART.md                 # 快速开始指南
└── SETUP.md                      # 详细设置文档
```

## 📚 文档 / Documentation

- **[快速开始](./QUICKSTART.md)** - 5分钟快速上手
- **[详细设置](./SETUP.md)** - 完整的功能说明和 API 文档

## 🛠 技术栈 / Tech Stack

### 前端
- React 19.2 + TypeScript 5.9
- Vite 8.0 (快速开发)
- 现代 CSS 特性

### 后端
- Express.js 4.18 + Node.js
- Multer (文件上传)
- XLSX (Excel 解析)
- Mammoth (Word 解析)

## 📖 API 接口 / API

### 健康检查
```
GET http://localhost:3001/api/health
```

### 文件分析
```
POST http://localhost:3001/api/analyze
Content-Type: multipart/form-data
```

详细 API 说明请查看 [SETUP.md](./SETUP.md)

## 📋 支持的文件格式

| 格式 | 扩展名 |
|------|--------|
| Excel 2007+ | `.xlsx` |
| Excel 97-2003 | `.xls` |
| Word 2007+ | `.docx` |
| Word 97-2003 | `.doc` |

## 🎯 使用步骤

1. 启动前后端服务
2. 访问 http://localhost:5173
3. 选择 Excel 或 Word 文件
4. 点击"上传并分析"
5. 查看分析结果

## 🚨 故障排查

❌ **无法连接到后端** → 确认后端正在运行
❌ **文件上传失败** → 检查文件格式和大小
❌ **缺少依赖** → 运行 `npm install`

# React + TypeScript + Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
