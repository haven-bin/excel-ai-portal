import { API_ENDPOINTS } from './config'

export interface AnalysisResult {
    filename: string
    fileType: string
    sheets?: string[]
    data?: Record<string, any>[]
    totalRows?: number
    tables?: Array<{
        title: string
        rows: number
        columns: string[]
    }>
    paragraphs?: string[]
    totalParagraphs?: number
    message?: string
    error?: string
}

/**
 * 检查后端服务健康状态
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_HEALTH)
        return response.ok
    } catch (error) {
        console.error('Health check failed:', error)
        return false
    }
}

/**
 * 上传并分析文件
 * @param file - 要分析的文件
 * @returns 分析结果
 */
export async function analyzeFile(file: File): Promise<AnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_ANALYZE, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || '文件分析失败')
        }

        const result = await response.json()
        return result as AnalysisResult
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('分析过程中出错，请检查后台服务是否正常运行')
    }
}

/**
 * 验证文件是否有效
 * @param file - 要验证的文件
 * @returns 验证结果和错误信息
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/csv' // 支持 CSV
    ]

    // 验证文件类型
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        return {
            valid: false,
            error: `不支持的文件类型。请选择 Excel (.xlsx, .xls)、CSV (.csv) 或 Word (.docx, .doc) 文件`
        }
    }

    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `文件过大。最大支持 ${maxSize / 1024 / 1024}MB，您的文件为 ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }
    }

    return { valid: true }
}

// ==================== 动态分析 API ====================

/**
 * 数据模板 - 与后台 Java com.excel.ai.model.DataTemplate 完全对应
 */
export interface DataTemplate {
    /** 模板ID */
    templateId?: string
    /** 模板名称 */
    templateName: string
    /** 业务类型 */
    businessType: string
    /** 模板描述 */
    description?: string
    /** 字段定义列表 */
    fields?: FieldDefinition[]
    /** 列映射规则 */
    columnMappings?: ColumnMapping[]
    /** 数据预处理规则 */
    transformRules?: Record<string, DataTransformRule>
    /** 是否是预置模板 */
    isBuiltIn?: boolean
    /** 使用次数 */
    usageCount?: number
    /** 创建时间 (毫秒时间戳) */
    createdTime?: number
}

/**
 * 字段定义 - 与后台 Java DataTemplate.FieldDefinition 完全对应
 */
export interface FieldDefinition {
    /** 字段名 */
    fieldName: string
    /** 字段类型 (String, Integer, BigDecimal, Date, Boolean 等) */
    fieldType: string
    /** 字段描述 */
    description?: string
    /** 是否必需 */
    required?: boolean
    /** 默认值 */
    defaultValue?: any
}

/**
 * 列映射规则 - 源列到目标字段的映射
 */
export interface ColumnMapping {
    /** 源列名 */
    columnName: string
    /** 目标字段名 */
    fieldName: string
    /** 数据类型 */
    dataType: string
    /** 是否必需 */
    isRequired?: boolean
    /** 数据转换器 */
    transformer?: string
    /** 描述 */
    description?: string
}

/**
 * 数据转换规则
 */
export interface DataTransformRule {
    /** 规则类型 */
    type?: string
    /** 规则配置 */
    config?: Record<string, any>
}

export interface DynamicAnalysisResult {
    status: 'success' | 'error'
    records_count?: number
    template_id?: string
    analysis?: Record<string, any>
    sample_data?: Record<string, any>
    message?: string
}

export interface TemplateListResponse {
    status: 'success' | 'error'
    templates: TemplateInfo[]
    total: number
}

export interface TemplateInfo {
    id: string
    name: string
    businessType: string
    description?: string
    fieldCount: number
    isBuiltIn: boolean
}

/**
 * 使用预置模板上传并分析文件（动态分析）
 * @param file - 要分析的文件
 * @param templateId - 模板ID，默认为 'generic'
 * @returns 分析结果
 */
export async function analyzeDynamicFile(
    file: File,
    templateId: string = 'generic'
): Promise<DynamicAnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('templateId', templateId)

    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_ANALYZE, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '文件分析失败')
        }

        const result = await response.json()
        return result as DynamicAnalysisResult
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('动态分析过程中出错，请检查后台服务是否正常运行')
    }
}

/**
 * 使用自定义列映射上传并分析文件
 * @param file - 要分析的文件
 * @param customTemplate - 自定义模板配置
 * @returns 分析结果
 */
export async function analyzeDynamicFileWithMapping(
    file: File,
    customTemplate: DataTemplate
): Promise<DynamicAnalysisResult> {
    const formData = new FormData()
    formData.append('file', file)
    // 注意：根据后台 API 设计，这个端点可能需要特殊处理
    // 如果后台同时期望 file 和 JSON body，可能需要调整后台或前端实现

    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_ANALYZE_WITH_MAPPING, {
            method: 'POST',
            body: formData,
            // 不指定 Content-Type，让浏览器自动设置为 multipart/form-data
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `分析失败 (HTTP ${response.status})`)
        }

        const result = await response.json()
        return result as DynamicAnalysisResult
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('自定义映射分析过程中出错')
    }
}

/**
 * 获取所有可用的模板列表
 * @returns 模板列表
 */
export async function listDynamicTemplates(): Promise<TemplateListResponse> {
    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_TEMPLATES)

        if (!response.ok) {
            throw new Error('获取模板列表失败')
        }

        const result = await response.json()
        return result as TemplateListResponse
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('获取模板列表时出错')
    }
}

/**
 * 获取模板详情
 * @param templateId - 模板ID
 * @returns 模板详情
 */
export async function getDynamicTemplate(templateId: string): Promise<DataTemplate> {
    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_TEMPLATE_DETAIL(templateId))

        if (!response.ok) {
            throw new Error('获取模板详情失败')
        }

        const result = await response.json()
        return result.template as DataTemplate
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('获取模板详情时出错')
    }
}

/**
 * 创建或更新自定义模板
 * @param template - 模板配置
 * @returns 创建结果
 */
export async function createDynamicTemplate(
    template: DataTemplate
): Promise<{ status: 'success' | 'error'; templateId?: string; message?: string }> {
    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_ANALYZE_WITH_MAPPING, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(template),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '创建模板失败')
        }

        const result = await response.json()
        return result
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('创建模板时出错')
    }
}

/**
 * 检查动态分析服务健康状态
 */
export async function checkDynamicServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(API_ENDPOINTS.DYNAMIC_HEALTH, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })

        console.log('[Health Check] URL:', API_ENDPOINTS.DYNAMIC_HEALTH)
        console.log('[Health Check] Status:', response.status, response.statusText)
        console.log('[Health Check] OK:', response.ok)

        if (!response.ok) {
            console.warn(`[Health Check] Failed with status ${response.status}`)
            return false
        }

        const data = await response.json()
        console.log('[Health Check] Response:', data)
        return true
    } catch (error) {
        console.error('[Health Check] Request failed:', error)
        return false
    }
}

// ==================== 模板工具函数 ====================

/**
 * 创建空的数据模板对象
 * @param name 模板名称
 * @param businessType 业务类型
 * @returns 新模板对象
 */
export function createEmptyTemplate(
    name: string = '新建模板',
    businessType: string = 'custom'
): DataTemplate {
    return {
        templateName: name,
        businessType: businessType,
        description: '',
        fields: [],
        columnMappings: [],
        transformRules: {},
        isBuiltIn: false,
        usageCount: 0,
        createdTime: Date.now(),
    }
}

/**
 * 创建字段定义
 * @param fieldName 字段名
 * @param fieldType 字段类型 (String, Integer, BigDecimal, Date, Boolean 等)
 * @param description 字段描述
 * @param required 是否必需
 * @param defaultValue 默认值
 * @returns 字段定义
 */
export function createFieldDefinition(
    fieldName: string,
    fieldType: string = 'String',
    description: string = '',
    required: boolean = false,
    defaultValue?: any
): FieldDefinition {
    return {
        fieldName,
        fieldType,
        description,
        required,
        defaultValue,
    }
}

/**
 * 创建列映射规则
 * @param columnName 源列名
 * @param fieldName 目标字段名
 * @param dataType 数据类型
 * @param isRequired 是否必需
 * @param description 描述
 * @returns 列映射规则
 */
export function createColumnMapping(
    columnName: string,
    fieldName: string,
    dataType: string = 'String',
    isRequired: boolean = false,
    description: string = ''
): ColumnMapping {
    return {
        columnName,
        fieldName,
        dataType,
        isRequired,
        description,
    }
}
