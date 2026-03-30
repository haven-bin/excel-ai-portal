import { useState, useEffect } from 'react'
import {
    analyzeDynamicFile,
    analyzeDynamicFileWithMapping,
    listDynamicTemplates,
    getDynamicTemplate,
    createDynamicTemplate,
    checkDynamicServiceHealth,
    createEmptyTemplate,
    createColumnMapping,
    type DataTemplate,
    type TemplateInfo,
    type DynamicAnalysisResult,
} from './api'
import { validateFile } from './api'
import {
    exportAnalysisToExcel,
    exportAnalysisToCSV,
    downloadAnalysisReport,
} from './exportUtils'
import './DynamicAnalyzer.css'

/**
 * 动态分析器组件
 * 支持使用预置模板或自定义列映射进行文件分析
 */
export function DynamicAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<DynamicAnalysisResult | null>(null)
    const [serviceOnline, setServiceOnline] = useState(true)

    // 模板相关状态
    const [templates, setTemplates] = useState<TemplateInfo[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState('generic')
    const [showCustomMapping, setShowCustomMapping] = useState(false)
    const [customTemplate, setCustomTemplate] = useState<DataTemplate>(
        createEmptyTemplate('新建模板', 'custom')
    )

    // 检查服务健康状态
    useEffect(() => {
        const checkService = async () => {
            const isOnline = await checkDynamicServiceHealth()
            setServiceOnline(isOnline)
            if (!isOnline) {
                setError('⚠️ 动态分析服务未运行')
            } else {
                // 清除服务未运行的错误消息
                if (error === '⚠️ 动态分析服务未运行') {
                    setError(null)
                }
            }
        }

        checkService()
        const interval = setInterval(checkService, 5000)
        return () => clearInterval(interval)
    }, [error])

    // 加载模板列表
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await listDynamicTemplates()
                if (response.status === 'success') {
                    setTemplates(response.templates)
                }
            } catch (err) {
                console.error('Failed to load templates:', err)
            }
        }

        if (serviceOnline) {
            loadTemplates()
        }
    }, [serviceOnline])

    const [dragActive, setDragActive] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            const validation = validateFile(selectedFile)
            if (validation.valid) {
                setFile(selectedFile)
                setError(null)
            } else {
                setError(validation.error || '文件验证失败')
                setFile(null)
            }
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0]
            const validation = validateFile(droppedFile)
            if (validation.valid) {
                setFile(droppedFile)
                setError(null)
            } else {
                setError(validation.error || '文件验证失败')
                setFile(null)
            }
        }
    }

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplateId(templateId)
        try {
            const template = await getDynamicTemplate(templateId)
            console.log('Template loaded:', template)
        } catch (err) {
            console.error('Failed to load template:', err)
        }
    }

    const handleAnalyzeWithTemplate = async () => {
        if (!file) {
            setError('请先选择文件')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const analysisResult = await analyzeDynamicFile(file, selectedTemplateId)
            setResult(analysisResult)
            if (analysisResult.status === 'error') {
                setError(analysisResult.message || '分析失败')
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '未知错误'
            setError(errorMsg)
            console.error('Analysis failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyzeWithCustomMapping = async () => {
        if (!file) {
            setError('请先选择文件')
            return
        }

        if (!customTemplate.templateName || !customTemplate.columnMappings?.length) {
            setError('请配置模板名称和列映射')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const analysisResult = await analyzeDynamicFileWithMapping(file, customTemplate)
            setResult(analysisResult)
            if (analysisResult.status === 'error') {
                setError(analysisResult.message || '分析失败')
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '未知错误'
            setError(errorMsg)
            console.error('Analysis failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCustomTemplate = async () => {
        try {
            const response = await createDynamicTemplate(customTemplate)
            if (response.status === 'success') {
                setError(null)
                alert(`模板创建成功！模板ID: ${response.templateId}`)
                // 重新加载模板列表
                const templatesResponse = await listDynamicTemplates()
                if (templatesResponse.status === 'success') {
                    setTemplates(templatesResponse.templates)
                }
            } else {
                setError(response.message || '创建模板失败')
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '未知错误'
            setError(errorMsg)
        }
    }

    const addColumnMapping = () => {
        const newMapping = createColumnMapping('', '', 'String', false, '')
        setCustomTemplate({
            ...customTemplate,
            columnMappings: [...(customTemplate.columnMappings || []), newMapping],
        })
    }

    const updateColumnMapping = (index: number, field: string, value: string) => {
        const updatedMappings = [...(customTemplate.columnMappings || [])]
        updatedMappings[index] = { ...updatedMappings[index], [field]: value }
        setCustomTemplate({ ...customTemplate, columnMappings: updatedMappings })
    }

    const removeColumnMapping = (index: number) => {
        const updatedMappings = customTemplate.columnMappings?.filter((_, i) => i !== index) || []
        setCustomTemplate({ ...customTemplate, columnMappings: updatedMappings })
    }

    return (
        <div className="dynamic-analyzer">
            <div className="analyzer-header">
                <h1>📊 动态数据分析器</h1>
                <p className="service-status">
                    {serviceOnline ? '✅ 服务正常' : '❌ 服务离线'}
                </p>
            </div>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>&times;</button>
                </div>
            )}

            {/* 文件上传区域 */}
            <div className="upload-section" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                <h2>第1步: 选择文件</h2>
                <div className={`file-input-wrapper ${dragActive ? 'drag-active' : ''}`}>
                    <input
                        type="file"
                        id="file-input"
                        onChange={handleFileChange}
                        accept=".xlsx,.xls,.csv,.docx,.doc"
                        disabled={loading}
                    />
                    <label htmlFor="file-input" className={file ? 'has-file' : ''}>
                        {file ? `✓ ${file.name}` : '选择 Excel/CSV/Word 文件 (最大 10MB)'}
                    </label>
                </div>
            </div>

            {/* 模板选择区域 */}
            <div className="template-section">
                <h2>第2步: 选择分析方式</h2>

                <div className="mode-selector">
                    <button
                        className={`mode-btn ${!showCustomMapping ? 'active' : ''}`}
                        onClick={() => setShowCustomMapping(false)}
                        disabled={loading}
                    >
                        使用预置模板
                    </button>
                    <button
                        className={`mode-btn ${showCustomMapping ? 'active' : ''}`}
                        onClick={() => setShowCustomMapping(true)}
                        disabled={loading}
                    >
                        自定义列映射
                    </button>
                </div>

                {/* 预置模板模式 */}
                {!showCustomMapping && (
                    <div className="preset-template-mode">
                        <div className="template-list">
                            {templates.length > 0 ? (
                                <>
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`template-item ${selectedTemplateId === template.id ? 'selected' : ''}`}
                                            onClick={() => handleTemplateSelect(template.id)}
                                        >
                                            <div className="template-header">
                                                <h3>{template.name}</h3>
                                                {template.isBuiltIn && <span className="badge">内置</span>}
                                            </div>
                                            <p className="template-description">{template.description}</p>
                                            <div className="template-meta">
                                                <span>类型: {template.businessType}</span>
                                                <span>字段数: {template.fieldCount}</span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="no-templates">暂无可用模板</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 自定义列映射模式 */}
                {showCustomMapping && (
                    <div className="custom-mapping-mode">
                        <div className="form-group">
                            <label>模板名称</label>
                            <input
                                type="text"
                                value={customTemplate.templateName}
                                onChange={(e) =>
                                    setCustomTemplate({ ...customTemplate, templateName: e.target.value })
                                }
                                placeholder="输入模板名称"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>业务类型</label>
                            <input
                                type="text"
                                value={customTemplate.businessType}
                                onChange={(e) =>
                                    setCustomTemplate({ ...customTemplate, businessType: e.target.value })
                                }
                                placeholder="输入业务类型"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>描述 (可选)</label>
                            <textarea
                                value={customTemplate.description || ''}
                                onChange={(e) =>
                                    setCustomTemplate({ ...customTemplate, description: e.target.value })
                                }
                                placeholder="输入模板描述"
                                rows={3}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <h4>列映射配置</h4>
                            <div className="mappings-container">
                                {customTemplate.columnMappings?.map((mapping, index) => (
                                    <div key={index} className="mapping-row">
                                        <input
                                            type="text"
                                            placeholder="源列名"
                                            value={mapping.columnName}
                                            onChange={(e) =>
                                                updateColumnMapping(index, 'columnName', e.target.value)
                                            }
                                            disabled={loading}
                                        />
                                        <span className="arrow">→</span>
                                        <input
                                            type="text"
                                            placeholder="目标字段名"
                                            value={mapping.fieldName}
                                            onChange={(e) =>
                                                updateColumnMapping(index, 'fieldName', e.target.value)
                                            }
                                            disabled={loading}
                                        />
                                        <select
                                            value={mapping.dataType}
                                            onChange={(e) =>
                                                updateColumnMapping(index, 'dataType', e.target.value)
                                            }
                                            disabled={loading}
                                        >
                                            <option>String</option>
                                            <option>Integer</option>
                                            <option>BigDecimal</option>
                                            <option>Date</option>
                                            <option>Boolean</option>
                                        </select>
                                        <button
                                            onClick={() => removeColumnMapping(index)}
                                            disabled={loading}
                                            className="remove-btn"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addColumnMapping}
                                disabled={loading}
                                className="add-mapping-btn"
                            >
                                + 添加列映射
                            </button>
                        </div>

                        <button
                            onClick={handleSaveCustomTemplate}
                            disabled={loading}
                            className="save-template-btn"
                        >
                            💾 保存为模板
                        </button>
                    </div>
                )}
            </div>

            {/* 分析按钮 */}
            <div className="action-section">
                <h2>第3步: 执行分析</h2>
                <button
                    onClick={
                        showCustomMapping
                            ? handleAnalyzeWithCustomMapping
                            : handleAnalyzeWithTemplate
                    }
                    disabled={!file || loading || !serviceOnline}
                    className="analyze-btn"
                >
                    {loading ? '分析中...' : '🚀 开始分析'}
                </button>
            </div>

            {/* 分析结果 */}
            {result && (
                <div className="result-section">
                    <div className="result-header">
                        <h2>分析结果</h2>
                        <div className="export-buttons">
                            {result.status === 'success' && (
                                <>
                                    <button
                                        onClick={() => {
                                            console.log('[Export] 点击导出 Excel 按钮，分析结果:', result)
                                            exportAnalysisToExcel(result, `分析报告_${result.template_id}`)
                                        }}
                                        className="export-btn export-excel"
                                        title="导出为 Excel 格式，包含统计摘要、字段分析等多个工作表"
                                    >
                                        📊 导出 Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('[Export] 点击导出 HTML 按钮，分析结果:', result)
                                            downloadAnalysisReport(result, `分析报告_${result.template_id}`)
                                        }}
                                        className="export-btn export-html"
                                        title="导出为 HTML 报告，包含完整的统计信息和可视化展示"
                                    >
                                        📄 导出 HTML 报告
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {result.status === 'success' ? (
                        <>
                            <div className="result-summary">
                                <div className="stat">
                                    <span className="label">记录数</span>
                                    <span className="value">{result.records_count}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">使用模板</span>
                                    <span className="value">{result.template_id}</span>
                                </div>
                            </div>

                            {result.sample_data && (
                                <div className="sample-data">
                                    <h3>样本数据</h3>
                                    <pre>{JSON.stringify(result.sample_data, null, 2)}</pre>
                                </div>
                            )}

                            {result.analysis && (
                                <div className="analysis-data">
                                    <h3>分析结果</h3>
                                    <pre>{JSON.stringify(result.analysis, null, 2)}</pre>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="error-result">
                            <p>分析失败: {result.message}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
