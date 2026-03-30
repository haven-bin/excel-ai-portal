# 后台 Java 模型与前端 TypeScript 接口对应关系

## 概述

前端已更新为完全支持后台 Java 的 `DataTemplate` 数据模型。该文档说明两端的完全映射关系。

---

## 📋 核心数据模型对应

### DataTemplate（数据模板）

#### Java 后台模型
```java
@Data
public class DataTemplate {
    private String templateId;           // 模板ID
    private String templateName;         // 模板名称
    private String businessType;         // 业务类型
    private String description;          // 描述
    private List<FieldDefinition> fields;              // 字段定义
    private List<ColumnMapping> columnMappings;        // 列映射
    private Map<String, DataTransformRule> transformRules;  // 转换规则
    private boolean isBuiltIn;           // 是否内置（默认false）
    private int usageCount;              // 使用次数（默认0）
    private long createdTime;            // 创建时间（毫秒）
}
```

#### TypeScript 前端接口
```typescript
export interface DataTemplate {
    templateId?: string                                    // 模板ID
    templateName: string                                   // 模板名称
    businessType: string                                   // 业务类型
    description?: string                                   // 描述
    fields?: FieldDefinition[]                             // 字段定义
    columnMappings?: ColumnMapping[]                       // 列映射
    transformRules?: Record<string, DataTransformRule>     // 转换规则
    isBuiltIn?: boolean                                    // 是否内置
    usageCount?: number                                    // 使用次数
    createdTime?: number                                   // 创建时间（毫秒）
}
```

### FieldDefinition（字段定义）

#### Java 后台模型
```java
@Data
public static class FieldDefinition {
    private String fieldName;        // 字段名
    private String fieldType;        // 字段类型
    private String description;      // 字段描述
    private boolean required;        // 是否必需
    private Object defaultValue;     // 默认值
}
```

#### TypeScript 前端接口
```typescript
export interface FieldDefinition {
    fieldName: string        // 字段名
    fieldType: string        // 字段类型 (String, Integer, BigDecimal, Date, Boolean 等)
    description?: string     // 字段描述
    required?: boolean       // 是否必需
    defaultValue?: any       // 默认值
}
```

### ColumnMapping（列映射）

无需更改，保持原样：
```typescript
export interface ColumnMapping {
    columnName: string      // 源列名
    fieldName: string       // 目标字段名
    dataType: string        // 数据类型
    isRequired?: boolean    // 是否必需
    transformer?: string    // 转换器
    description?: string    // 描述
}
```

### DataTransformRule（数据转换规则）

```typescript
export interface DataTransformRule {
    type?: string                           // 规则类型
    config?: Record<string, any>            // 规则配置
}
```

---

## 🛠️ 前端工具函数

为了方便创建符合后台数据模型的对象，提供了以下工具函数：

### 1. 创建空模板
```typescript
import { createEmptyTemplate } from './api'

// 创建空的数据模板
const template = createEmptyTemplate('我的模板', 'ecommerce')

// 返回结构:
// {
//   templateName: '我的模板',
//   businessType: 'ecommerce',
//   description: '',
//   fields: [],
//   columnMappings: [],
//   transformRules: {},
//   isBuiltIn: false,
//   usageCount: 0,
//   createdTime: 1663897200000  // 当前时间戳
// }
```

### 2. 创建字段定义
```typescript
import { createFieldDefinition } from './api'

const field = createFieldDefinition(
    'orderId',              // 字段名
    'String',               // 字段类型
    '订单ID',               // 描述
    true,                   // 是否必需
    'ORD-'                  // 默认值
)

// 返回结构:
// {
//   fieldName: 'orderId',
//   fieldType: 'String',
//   description: '订单ID',
//   required: true,
//   defaultValue: 'ORD-'
// }
```

### 3. 创建列映射
```typescript
import { createColumnMapping } from './api'

const mapping = createColumnMapping(
    'Order ID',             // 源列名
    'orderId',              // 目标字段名
    'String',               // 数据类型
    true,                   // 是否必需
    '来自 Excel 第一列'      // 描述
)

// 返回结构:
// {
//   columnName: 'Order ID',
//   fieldName: 'orderId',
//   dataType: 'String',
//   isRequired: true,
//   description: '来自 Excel 第一列'
// }
```

---

## 💡 使用示例

### 示例 1：创建电商订单模板

```typescript
import { 
    createEmptyTemplate, 
    createFieldDefinition, 
    createColumnMapping, 
    createDynamicTemplate 
} from './api'

// 创建模板
const template = createEmptyTemplate('电商订单模板 v2', 'ecommerce')

// 添加字段
template.fields = [
    createFieldDefinition('orderId', 'String', '订单ID', true),
    createFieldDefinition('userId', 'String', '用户ID', true),
    createFieldDefinition('amount', 'BigDecimal', '订单金额', true),
    createFieldDefinition('orderTime', 'Date', '订单时间', false),
]

// 添加列映射
template.columnMappings = [
    createColumnMapping('订单编号', 'orderId', 'String', true, '必填'),
    createColumnMapping('客户编号', 'userId', 'String', true, '必填'),
    createColumnMapping('金额', 'amount', 'BigDecimal', true, '必填'),
    createColumnMapping('日期', 'orderTime', 'Date', false, '选填'),
]

// 添加转换规则
template.transformRules = {
    'amountFilter': {
        type: 'numeric',
        config: { minValue: 0, maxValue: 999999 }
    }
}

// 保存到后台
const response = await createDynamicTemplate(template)
console.log('模板已保存:', response.templateId)
```

### 示例 2：后台返回的模板在前端使用

```typescript
import { getDynamicTemplate, analyzeDynamicFile } from './api'

// 获取后台模板
const backendTemplate = await getDynamicTemplate('ecommerce')

// 前端接收到的完整数据
// {
//   templateId: 'ecommerce',
//   templateName: '电商数据模板',
//   businessType: 'ecommerce',
//   description: '适用于电商订单、销售数据分析',
//   fields: [
//     { fieldName: 'orderId', fieldType: 'String', required: true, ... },
//     { fieldName: 'userId', fieldType: 'String', required: true, ... },
//     ...
//   ],
//   columnMappings: [...],
//   transformRules: {...},
//   isBuiltIn: true,
//   usageCount: 42,
//   createdTime: 1663897200000
// }

// 使用此模板分析文件
const file = new File(['...'], 'orders.xlsx')
const result = await analyzeDynamicFile(file, 'ecommerce')
```

---

## 🔄 数据流

```
前端                          后台 Java
┌──────────────────────────────────────────────┐
│  DataTemplate (TypeScript)                   │
│  ├─ templateId: string                       │
│  ├─ templateName: string                     │
│  ├─ fields: FieldDefinition[]                │
│  └─ columnMappings: ColumnMapping[]          │
└──────────────────────────────────────────────┘
             ↕  (JSON 序列化/反序列化)
┌──────────────────────────────────────────────┐
│  DataTemplate (Java)                         │
│  ├─ templateId: String                       │
│  ├─ templateName: String                     │
│  ├─ fields: List<FieldDefinition>            │
│  └─ columnMappings: List<ColumnMapping>      │
└──────────────────────────────────────────────┘
```

---

## 📝 支持的字段类型

根据后台模型，`fieldType` 和 `dataType` 支持以下值：

| 类型 | 说明 | Java 对应 |
|------|------|---------|
| String | 字符串 | String |
| Integer | 整数 | Integer / int |
| BigDecimal | 高精度数值 | BigDecimal |
| Date | 日期 | Date / LocalDate |
| Boolean | 布尔值 | Boolean / boolean |
| Long | 长整数 | Long / long |
| Double | 浮点数 | Double / double |
| Object | 复杂对象 | Map / Object |

---

## ✅ 检查清单

- ✓ 前端 TypeScript 接口与后台 Java 模型完全对应
- ✓ 提供了便利的工具函数创建数据对象
- ✓ 支持所有后台返回的字段（包括 usageCount、createdTime 等）
- ✓ 列映射和字段定义字段名已更正
- ✓ 完整的类型安全性（TypeScript）

---

## 📚 相关文件

- **后台**：`com.excel.ai.model.DataTemplate.java`
- **前端**：`src/api.ts` （类型定义）
- **前端**：`src/DynamicAnalyzer.tsx` （组件）
- **工具**：`src/api.ts` （工具函数）

---

**更新日期**：2026-03-18
