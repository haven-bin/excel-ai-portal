// 应用配置文件
export const API_BASE_URL = 'http://localhost:8080'
export const API_ENDPOINTS = {
    // 动态分析接口
    DYNAMIC_ANALYZE: `${API_BASE_URL}/api/dynamic/analyze`,
    DYNAMIC_ANALYZE_WITH_MAPPING: `${API_BASE_URL}/api/dynamic/analyze-with-mapping`,
    DYNAMIC_TEMPLATES: `${API_BASE_URL}/api/dynamic/templates`,
    DYNAMIC_TEMPLATE_DETAIL: (templateId: string) => `${API_BASE_URL}/api/dynamic/templates/${templateId}`,
    DYNAMIC_HEALTH: `${API_BASE_URL}/api/dynamic/health`,
}

// 文件上传配置
export const FILE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ],
    ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.docx', '.doc']
}

// UI 配置
export const UI_CONFIG = {
    MAX_ROWS_PREVIEW: 10,
    MAX_PARAGRAPHS_PREVIEW: 50,
}
