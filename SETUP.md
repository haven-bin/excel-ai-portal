# 📊 Excel/Word 文档分析门户

这是一个全栈应用，包含 React 前端和 Node.js/Express 后端，用于上传和分析 Excel 和 Word 文档。

## 项目结构

```
excel-ai-portal/
├── src/                    # React 前端
│   ├── App.tsx            # 主应用组件
│   ├── App.css            # 应用样式
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── server/                # Express 后端
│   ├── index.js           # 服务器主文件
│   ├── package.json       # 后端依赖
│   └── uploads/           # 临时上传文件目录
└── package.json           # 前端依赖
```

## 功能特性

✨ **前端功能**
- 🎯 优雅的文件上传界面
- 📋 支持 Excel (.xlsx, .xls) 文件  
- 📄 支持 Word (.docx, .doc) 文件
- 📊 实时显示文件分析结果
- 📈 表格数据预览（限制前 10 行）
- ⚡ 错误处理和用户提示

🔧 **后端功能**
- 🚀 Express.js API 服务
- 📤 Multer 文件上传处理
- 📊 XLSX 库解析 Excel 文件
- 📝 Mammoth 库解析 Word 文件
- 🛡️ CORS 跨域支持
- ⚙️ 自动临时文件清理

## 安装依赖

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd server
npm install
cd ..
```

## 运行项目

### 方式 1：分别运行前后端

**终端 1 - 启动前端开发服务器（端口 5173）**
```bash
npm run dev
```

**终端 2 - 启动后端服务器（端口 3001）**
```bash
cd server
npm run dev
```

### 方式 2：快速启动脚本

Windows PowerShell:
```powershell
# 创建并运行启动脚本
$paths = @(
  "B:\workpace\excel-ai-portal",
  "B:\workpace\excel-ai-portal\server"
)

# 先等待用户手动创建两个终端，或使用以下命令
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'B:\workpace\excel-ai-portal' ; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'B:\workpace\excel-ai-portal\server' ; npm run dev"
```

## API 接口

### 健康检查
```
GET http://localhost:3001/api/health
```
**响应：**
```json
{
  "status": "ok",
  "message": "后台服务正常运行"
}
```

### 文件分析
```
POST http://localhost:3001/api/analyze
```

**请求：**
- 方式：multipart/form-data  
- 参数：`file` (文件)

**Excel 文件响应示例：**
```json
{
  "filename": "data.xlsx",
  "fileType": "Excel",
  "sheets": ["Sheet1", "Sheet2"],
  "data": [{ "name": "张三", "age": 30 }, ...],
  "totalRows": 150
}
```

**Word 文件响应示例：**
```json
{
  "filename": "document.docx",
  "fileType": "Word",
  "paragraphs": ["这是第一段...", "这是第二段..."],
  "totalParagraphs": 45,
  "tables": []
}
```

## 如何使用

1. **启动前后端服务**
2. **在浏览器中打开** `http://localhost:5173`
3. **选择 Excel 或 Word 文件**
4. **点击"上传并分析"按钮**
5. **查看分析结果**

## 支持的文件格式

### Excel
- `.xlsx` - Excel 2007+ 格式
- `.xls` - Excel 97-2003 格式

### Word  
- `.docx` - Word 2007+ 格式
- `.doc` - Word 97-2003 格式

## 技术栈

### 前端
- React 19.2.4
- TypeScript 5.9
- Vite 8.0

### 后端
- Express.js 4.18.2
- Multer 1.4.5 (文件上传)
- XLSX 0.18.5 (Excel 解析)
- Mammoth 1.7.0 (Word 解析)
- CORS 2.8.5 (跨域支持)

## 注意事项

⚠️ **安全考虑：**
- 此项目为演示用，生产环境需要添加文件大小限制
- 建议添加文件类型验证和病毒扫描
- 上传文件应定期清理

🔒 **文件大小限制建议：**
```javascript
// 在 server/index.js 中添加
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
```

## 常见问题

**Q: 后端无法连接错误？**
- 确认后端服务已启动（端口 3001）
- 检查防火墙设置
- 确认前端 API 地址正确

**Q: 文件解析失败？**
- 确认文件格式正确
- 文件大小不超过限制
- 尝试重新保存文件

**Q: 跨域错误？**
- 后端已配置 CORS，确认后端正常运行
- 清除浏览器缓存

## 后续改进方向

- [ ] 添加文件大小和类型更严格的验证
- [ ] 实现更详细的 Excel 数据分析（图表、公式等）
- [ ] 增强 Word 文档解析（表格、图片等）
- [ ] 添加文件分析历史记录
- [ ] 实现数据导出（CSV、JSON 等）
- [ ] 添加用户认证和管理
- [ ] 数据库存储分析结果
- [ ] 实时进度显示
- [ ] 批量文件上传

## 许可证

MIT
