# 前端快速集成步骤

## ✅ 已为你生成的文件

- `src/DynamicAnalyzer.tsx` - 完整的动态分析器组件
- `src/DynamicAnalyzer.css` - 样式文件
- `src/api.ts` - 已更新，添加所有动态分析 API 函数和类型
- `src/config.ts` - 已更新，添加动态分析端点配置
- `DYNAMIC_ANALYZER_GUIDE.md` - 完整使用文档

## 🚀 下一步操作

### 1️⃣ 更新 App.tsx

打开 `src/App.tsx`，将 `DynamicAnalyzer` 组件添加到你的应用：

```typescript
import { DynamicAnalyzer } from './DynamicAnalyzer'

function App() {
  return (
    <div className="app">
      <DynamicAnalyzer />
    </div>
  )
}

export default App
```

### 2️⃣ 启动应用

```bash
npm run dev
```

### 3️⃣ 启动后台服务

在另一个终端启动 Spring Boot 应用：
```bash
mvn spring-boot:run
# 或者你的启动命令
```

确保后台运行在 `http://localhost:8080`

### 4️⃣ 打开浏览器

访问 `http://localhost:5173`（Vite 默认端口），应该能看到：

```
📊 动态数据分析器
```

## 📌 关键功能

| 功能 | 描述 | API 端点 |
|------|------|---------|
| 分析文件 | 上传 Excel/CSV 使用预置模板 | `POST /api/dynamic/analyze` |
| 自定义映射 | 自定义列映射后分析 | `POST /api/dynamic/analyze-with-mapping` |
| 模板列表 | 获取所有可用模板 | `GET /api/dynamic/templates` |
| 模板详情 | 获取单个模板详情 | `GET /api/dynamic/templates/{id}` |
| 保存模板 | 创建并保存自定义模板 | `POST /api/dynamic/templates` |
| 健康检查 | 检查服务状态 | `GET /api/dynamic/health` |

## 🔧 自定义建议

### 修改 API 基础 URL

如果后台不在 localhost:8080，编辑 `src/config.ts`：

```typescript
export const API_BASE_URL = 'http://your-api-server:port'
```

### 修改支持的文件类型

编辑 `src/api.ts` 中的 `validateFile()` 函数：

```typescript
const validTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // 添加更多...
]
```

### 更改最大文件大小

在 `src/config.ts` 中：

```typescript
export const FILE_CONFIG = {
    MAX_SIZE: 50 * 1024 * 1024, // 改为 50MB
    // ...
}
```

## 📱 组件架构

```
DynamicAnalyzer
├── 文件上传区 (支持拖放)
├── 模式选择器 (预置模板/自定义映射)
├── 预置模板模式
│   └── 模板列表 (自动从后台加载)
├── 自定义映射模式
│   ├── 模板配置表单
│   ├── 列映射编辑器
│   └── 保存按钮
├── 分析按钮
└── 结果展示区
    ├── 统计摘要
    ├── 样本数据
    └── 分析结果
```

## 🧪 测试 API 连接

可以使用 curl 或 Postman 测试后台 API：

```bash
# 检查健康状态
curl http://localhost:8080/api/dynamic/health

# 获取模板列表
curl http://localhost:8080/api/dynamic/templates

# 上传文件进行分析
curl -X POST \
  http://localhost:8080/api/dynamic/analyze?templateId=generic \
  -F "file=@your-file.xlsx"
```

## ✨ 组件特性

✅ 文件拖放上传
✅ 实时文件验证
✅ 自动模板加载
✅ 自定义列映射编辑器
✅ 模板创建/保存功能
✅ 实时服务健康检查
✅ 详细的错误提示
✅ 响应式设计（移动端支持）
✅ 分析结果格式化展示
✅ TypeScript 类型安全

## 🆘 故障排除

### 问题：模板列表为空
- ✓ 检查后台服务是否运行
- ✓ 查看浏览器 DevTools Network 标签
- ✓ 确认 CORS 配置正确

### 问题：文件上传失败
- ✓ 检查 API_BASE_URL 配置
- ✓ 验证文件格式和大小
- ✓ 查看浏览器控制台错误

### 问题：分析结果为空
- ✓ 确保文件格式正确
- ✓ 检查选择的模板是否适配文件结构
- ✓ 查看后台日志错误信息

## 📚 更多信息

详细文档请查看 `DYNAMIC_ANALYZER_GUIDE.md`

---

**祝你使用愉快！** 🎉
