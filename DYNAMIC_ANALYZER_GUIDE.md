# 动态分析器（DynamicAnalyzer）前端集成指南

## 概述

本文档说明如何在前端应用中集成动态分析器组件，与后台的 `DynamicAnalysisController` 进行交互。

## 📦 已经为你生成的文件

### 1. **config.ts** - API 配置更新
添加了动态分析服务的所有端点配置：
```typescript
DYNAMIC_ANALYZE:          // POST /api/dynamic/analyze
DYNAMIC_ANALYZE_WITH_MAPPING:  // POST /api/dynamic/analyze-with-mapping
DYNAMIC_TEMPLATES:        // GET /api/dynamic/templates
DYNAMIC_TEMPLATE_DETAIL:  // GET /api/dynamic/templates/{templateId}
DYNAMIC_HEALTH:          // GET /api/dynamic/health
```

### 2. **api.ts** - 新增 API 函数
添加了完整的数据类型和 API 调用函数：

#### 数据类型
- `DataTemplate` - 模板配置
- `FieldDefinition` - 字段定义
- `ColumnMapping` - 列映射
- `DynamicAnalysisResult` - 分析结果

#### API 函数
- `analyzeDynamicFile()` - 使用预置模板分析
- `analyzeDynamicFileWithMapping()` - 使用自定义映射分析
- `listDynamicTemplates()` - 获取模板列表
- `getDynamicTemplate()` - 获取模板详情
- `createDynamicTemplate()` - 创建自定义模板
- `checkDynamicServiceHealth()` - 检查服务状态

### 3. **DynamicAnalyzer.tsx** - 完整的 React 组件
包含以下功能：
- 文件上传和验证
- 模板列表加载和选择
- 预置模板分析
- 自定义列映射配置
- 自定义模板保存
- 实时服务健康检查
- 分析结果展示

### 4. **DynamicAnalyzer.css** - 样式文件
响应式 CSS 设计，支持移动端和桌面端

## 🚀 快速开始

### 第1步：将组件添加到您的应用

在 `src/App.tsx` 中引入并使用组件：

```typescript
import { DynamicAnalyzer } from './DynamicAnalyzer'
import './App.css'

function App() {
  return (
    <div className="app">
      <DynamicAnalyzer />
    </div>
  )
}

export default App
```

### 第2步：验证后台 API 连接

确保后台 Spring Boot 应用在 `http://localhost:8080` 上运行：
- 检查 CORS 配置是否允许跨域请求（你的后台已配置 `@CrossOrigin(origins = "*")` ✓）
- 验证数据库中的模板已初始化

### 第3步：启动应用

```bash
npm run dev
```

访问应用，应该能看到动态分析器界面。

## 📋 使用场景

### 场景 1: 用户使用预置模板分析文件

```mermaid
graph LR
    A[选择文件] --> B[选择模板<br/>generic/ecommerce]
    B --> C[点击分析]
    C --> D[发送到 POST /api/dynamic/analyze]
    D --> E[返回分析结果]
```

**流程代码**:
```typescript
const result = await analyzeDynamicFile(file, 'ecommerce')
// 返回: {
//   status: 'success',
//   records_count: 100,
//   template_id: 'ecommerce',
//   analysis: { ... },
//   sample_data: { ... }
// }
```

### 场景 2: 用户自定义列映射

```mermaid
graph LR
    A[选择自定义模式] --> B[配置列映射]
    B --> C[点击分析]
    C --> D[POST /api/dynamic/analyze-with-mapping]
    D --> E[返回分析结果]
    E --> F[可选: 保存为新模板]
```

**代码示例**:
```typescript
const customTemplate: DataTemplate = {
    templateName: '我的电商模板',
    businessType: 'ecommerce',
    columnMappings: [
        { columnName: 'OrderID', fieldName: 'orderId', dataType: 'String', isRequired: true },
        { columnName: 'Amount', fieldName: 'amount', dataType: 'BigDecimal', isRequired: true },
        { columnName: 'Date', fieldName: 'orderTime', dataType: 'Date', isRequired: false }
    ]
}

const result = await analyzeDynamicFileWithMapping(file, customTemplate)
```

### 场景 3: 管理员创建新模板

```typescript
const newTemplate: DataTemplate = {
    templateName: '采购订单模板',
    businessType: 'procurement',
    description: '用于分析采购订单数据',
    columnMappings: [
        { columnName: 'PO ID', fieldName: 'poId', dataType: 'String', isRequired: true },
        { columnName: 'Supplier', fieldName: 'supplier', dataType: 'String', isRequired: true },
        { columnName: 'Amount', fieldName: 'amount', dataType: 'BigDecimal', isRequired: true }
    ]
}

const response = await createDynamicTemplate(newTemplate)
// 返回: { status: 'success', templateId: 'custom_abc12345', message: '模板创建成功' }
```

## 🔧 自定义和扩展

### 修改支持的文件类型

在 `api.ts` 的 `validateFile()` 函数中更新 `validTypes` 数组：

```typescript
const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    // 添加更多类型...
]
```

### 自定义分析结果显示

编辑 `DynamicAnalyzer.tsx` 中的结果渲染部分：

```typescript
{result.analysis && (
    <div className="analysis-data">
        <h3>自定义分析结果</h3>
        {/* 添加你的自定义渲染逻辑 */}
        <div>总行数: {result.records_count}</div>
        <div>关键指标: {result.analysis.keyMetrics}</div>
    </div>
)}
```

### 添加更多列映射字段类型

在 `DynamicAnalyzer.tsx` 中的 `select` 元素中添加选项：

```typescript
<select value={mapping.dataType} onChange={...}>
    <option>String</option>
    <option>Integer</option>
    <option>BigDecimal</option>
    <option>Date</option>
    <option>Boolean</option>
    <option>Array</option>
    <option>Object</option>
</select>
```

## 🐛 常见问题

### Q1: CORS 错误
**症状**: 浏览器控制台显示 "Cross-Origin Request Blocked"

**解决**:
- 确保后台配置了 `@CrossOrigin(origins = "*")`  ✓ 已配置
- 检查 `API_BASE_URL` 是否正确指向后台地址

### Q2: 文件上传失败
**症状**: "文件验证失败" 或 "上传失败"

**解决**:
- 检查文件格式是否为 .xlsx、.xls、.csv 或 .docx
- 文件大小是否超过 10MB 限制
- 后台是否正确处理了 MultipartFile

### Q3: 模板列表为空
**症状**: 选择预置模板时没有看到任何模板

**解决**:
- 确认后台 `DynamicAnalysisController` 的 `initializeBuiltInTemplates()` 已执行
- 检查网络请求是否成功（浏览器开发者工具 > Network）
- 验证 `DYNAMIC_TEMPLATES` 端点是否正确

## 📊 API 请求/响应示例

### 1. 分析请求（使用模板）
```http
POST /api/dynamic/analyze?templateId=ecommerce
Content-Type: multipart/form-data

[文件数据]
```

**响应**:
```json
{
  "status": "success",
  "records_count": 150,
  "template_id": "ecommerce",
  "analysis": {
    "totalSales": 50000,
    "averageOrderValue": 333.33,
    "topCategory": "Electronics"
  },
  "sample_data": {
    "orderId": "ORD-001",
    "userId": "USER-123",
    "amount": 1500.00,
    "productCategory": "Electronics"
  }
}
```

### 2. 自定义映射分析
```http
POST /api/dynamic/analyze-with-mapping
Content-Type: application/json

{
  "templateName": "自定义模板",
  "businessType": "custom",
  "columnMappings": [
    {"columnName": "col1", "fieldName": "field1", "dataType": "String", "isRequired": true}
  ]
}
```

### 3. 获取模板列表
```http
GET /api/dynamic/templates
```

**响应**:
```json
{
  "status": "success",
  "templates": [
    {
      "id": "generic",
      "name": "通用模板",
      "businessType": "generic",
      "description": "支持任意字段结构",
      "fieldCount": 0,
      "isBuiltIn": true
    },
    {
      "id": "ecommerce",
      "name": "电商数据模板",
      "businessType": "ecommerce",
      "description": "适用于电商订单、销售数据分析",
      "fieldCount": 6,
      "isBuiltIn": true
    }
  ],
  "total": 2
}
```

## 📝 TypeScript 类型参考

```typescript
interface DataTemplate {
    templateId?: string
    templateName: string
    businessType: string
    description?: string
    fields?: FieldDefinition[]
    columnMappings?: ColumnMapping[]
    isBuiltIn?: boolean
}

interface DynamicAnalysisResult {
    status: 'success' | 'error'
    records_count?: number
    template_id?: string
    analysis?: Record<string, any>
    sample_data?: Record<string, any>
    message?: string
}
```

## 🎨 主题支持

组件支持亮色和暗色主题。可以通过修改 CSS 变量来定制：

```css
:root {
    --primary-color: #4a90e2;
    --success-color: #2ecc71;
    --error-color: #c33;
    --bg-color: #f9f9f9;
    --text-color: #333;
}

[data-theme='dark'] {
    --primary-color: #5aa3ff;
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
}
```

## 🔐 安全性建议

1. **输入验证**: 所有输入都应在前端验证，后台也需要再次验证
2. **文件上传**: 实现文件类型、大小和内容的双重检查
3. **认证**: 为 API 端点添加认证令牌
4. **SQL 注入防护**: 确保后台正确参数化所有查询

## 📈 性能优化

1. **分页加载**: 对大型数据集实现分页
2. **缓存**: 缓存模板列表以减少网络请求
3. **延迟加载**: 只在需要时加载模板详情
4. **文件大小限制**: 实现客户端和服务器两端的限制

---

**需要帮助?** 检查浏览器开发者工具的 Network 和 Console 选项卡获取详细错误信息。
