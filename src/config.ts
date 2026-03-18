// 应用配置文件
export const API_BASE_URL = 'http://localhost:3001'
export const API_ENDPOINTS = {
    ANALYZE: `${API_BASE_URL}/api/analyze`,
    HEALTH: `${API_BASE_URL}/api/health`,
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
