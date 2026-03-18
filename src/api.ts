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
        const response = await fetch(API_ENDPOINTS.HEALTH)
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
        const response = await fetch(API_ENDPOINTS.ANALYZE, {
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
        'application/msword'
    ]

    // 验证文件类型
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: `不支持的文件类型。请选择 Excel (.xlsx, .xls) 或 Word (.docx, .doc) 文件`
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
