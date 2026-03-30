import { utils, writeFile } from 'xlsx'
import type { DynamicAnalysisResult } from './api'

/**
 * 自动调整列宽
 * @param sheet - xlsx 工作表对象
 * @param data - 数据数组
 */
function autoFitColumns(sheet: any, data: Record<string, any>[]): void {
    if (!sheet['!cols']) {
        sheet['!cols'] = []
    }

    const cols = sheet['!cols']
    const headers = Object.keys(data[0] || {})

    headers.forEach((header, index) => {
        let maxLength = header.length

        // 计算该列中最长的内容
        data.forEach((row) => {
            const cellValue = row[header]
            const length = String(cellValue || '').length
            if (length > maxLength) {
                maxLength = length
            }
        })

        // 设置列宽，乘以1.5系数以适应中文字符和留出余量
        // 中文字符通常占用更多宽度，所以使用较大的系数
        cols[index] = {
            wch: Math.min(maxLength * 1.5, 50) // 最大宽度限制为 50
        }
    })
}

/**
 * 导出分析结果为 Excel
 * @param analysisResult - 分析结果对象
 * @param fileName - 导出文件名（不含扩展名）
 */
export function exportAnalysisToExcel(
    analysisResult: DynamicAnalysisResult,
    fileName: string = '数据分析报告'
): void {
    try {
        const workbook = utils.book_new()

        // 0. 导出完整分析结果（JSON格式）
        if (analysisResult.analysis) {
            const analysisJSON = convertAnalysisToSheet(analysisResult.analysis)
            const analysisSheet = utils.json_to_sheet(analysisJSON)
            autoFitColumns(analysisSheet, analysisJSON)
            utils.book_append_sheet(workbook, analysisSheet, '完整分析结果')
        }

        // 1. 导出统计摘要（最重要）
        const summary = buildAnalysisSummary(analysisResult)
        const summarySheet = utils.json_to_sheet(summary)
        autoFitColumns(summarySheet, summary)
        utils.book_append_sheet(workbook, summarySheet, '统计摘要')

        // 2. 导出详细分析（按字段）- 核心分析结果
        if (analysisResult.analysis?.fields) {
            const fieldAnalysis = buildFieldAnalysis(analysisResult.analysis)
            const fieldSheet = utils.json_to_sheet(fieldAnalysis)
            autoFitColumns(fieldSheet, fieldAnalysis)
            utils.book_append_sheet(workbook, fieldSheet, '字段分析')
        }

        // 3. 导出唯一值统计
        if (analysisResult.analysis) {
            const uniqueStats = buildUniqueStats(analysisResult.analysis)
            if (uniqueStats.length > 0) {
                const uniqueSheet = utils.json_to_sheet(uniqueStats)
                autoFitColumns(uniqueSheet, uniqueStats)
                utils.book_append_sheet(workbook, uniqueSheet, '唯一值统计')
            }
        }

        // 4. 导出聚合统计
        if (analysisResult.analysis) {
            const aggregates = buildAggregateStats(analysisResult.analysis)
            if (aggregates.length > 0) {
                const aggregateSheet = utils.json_to_sheet(aggregates)
                autoFitColumns(aggregateSheet, aggregates)
                utils.book_append_sheet(workbook, aggregateSheet, '聚合统计')
            }
        }

        // 5. 导出样本数据（放在最后）
        if (analysisResult.sample_data) {
            const sampleData = analysisResult.sample_data.fields || analysisResult.sample_data
            const sampleArray = Array.isArray(sampleData) ? sampleData : [sampleData]
            const sampleSheet = utils.json_to_sheet(sampleArray)
            autoFitColumns(sampleSheet, sampleArray)
            utils.book_append_sheet(workbook, sampleSheet, '样本数据')
        }

        // 写入文件
        writeFile(workbook, `${fileName}_${Date.now()}.xlsx`)
        console.log('[Export] Excel 文件导出成功')
    } catch (error) {
        console.error('[Export] Excel 导出失败:', error)
        alert('导出失败，请查看控制台错误信息')
    }
}

/**
 * 将完整的分析结果转换为可导出的格式
 */
function convertAnalysisToSheet(analysis: Record<string, any>): Record<string, any>[] {
    const result: Record<string, any>[] = []

    for (const key in analysis) {
        if (key === 'fields') {
            // fields 特殊处理，显示为列表
            result.push({
                属性名: 'fields',
                内容: Array.isArray(analysis[key]) ? analysis[key].join(', ') : String(analysis[key])
            })
        } else if (key.startsWith('field_')) {
            // field_* 处理为详细的字段信息
            const fieldName = key.replace('field_', '')
            const fieldInfo = analysis[key]
            result.push({
                字段名: fieldName,
                字段详情: JSON.stringify(fieldInfo, null, 0)
            })
        } else if (key.startsWith('unique_')) {
            // unique_* 处理为唯一值统计
            const fieldName = key.replace('unique_', '')
            result.push({
                字段名: fieldName,
                唯一值数: analysis[key]
            })
        } else if (key.startsWith('total_')) {
            // total_* 处理为合计
            const fieldName = key.replace('total_', '')
            result.push({
                字段名: fieldName,
                合计值: analysis[key]
            })
        } else {
            // 其他属性
            result.push({
                属性: key,
                值: typeof analysis[key] === 'object' ? JSON.stringify(analysis[key], null, 0) : String(analysis[key])
            })
        }
    }

    return result
}

/**
 * 构建分析摘要
 */
function buildAnalysisSummary(result: DynamicAnalysisResult): Record<string, any>[] {
    const analysis = result.analysis || {}
    const summary: Record<string, any>[] = [
        { 指标: '总记录数', 值: result.records_count || 0 },
        { 指标: '使用模板', 值: result.template_id || '通用' },
        { 指标: '分析时间戳', 值: analysis.analysisTime || '-' },
        { 指标: '字段总数', 值: analysis.fields?.length || 0 },
    ]

    // 添加分析时间（更可读的格式）
    if (analysis.analysisTime) {
        const date = new Date(analysis.analysisTime)
        summary.push({ 指标: '分析日期', 值: date.toLocaleString('zh-CN') })
    }

    return summary
}

/**
 * 构建字段分析详情
 */
function buildFieldAnalysis(analysis: Record<string, any>): Record<string, any>[] {
    const fields = analysis.fields as string[] | undefined
    if (!fields) return []

    const fieldData: Record<string, any>[] = []

    for (const fieldName of fields) {
        const fieldKey = `field_${fieldName}`
        const fieldInfo = analysis[fieldKey]

        if (fieldInfo) {
            const row: Record<string, any> = {
                字段名: fieldName,
                数据类型: fieldInfo.type || '-',
                非空数: fieldInfo.nonNullCount || 0,
                空值数: fieldInfo.nullCount || 0,
            }

            // 对于文本类型
            if (fieldInfo.type === 'text') {
                row['唯一值数'] = fieldInfo.uniqueCount || 0
                row['平均长度'] = formatNumber(fieldInfo.avgLength)
                row['最大长度'] = fieldInfo.maxLength || '-'
                row['最小长度'] = fieldInfo.minLength || '-'

                // 添加最常见的值
                if (fieldInfo.topValues) {
                    const topValues = Object.entries(fieldInfo.topValues)
                        .slice(0, 3)
                        .map(([val, count]) => `${val}(${count})`)
                        .join('; ')
                    row['常见值'] = topValues
                }
            }

            // 对于数值类型
            if (fieldInfo.type === 'numeric') {
                row['总和'] = formatNumber(fieldInfo.sum)
                row['平均值'] = formatNumber(fieldInfo.average)
                row['最大值'] = fieldInfo.max || '-'
                row['最小值'] = fieldInfo.min || '-'
            }

            fieldData.push(row)
        }
    }

    return fieldData
}

/**
 * 构建唯一值统计
 */
function buildUniqueStats(analysis: Record<string, any>): Record<string, any>[] {
    const stats: Record<string, any>[] = []

    for (const key in analysis) {
        if (key.startsWith('unique_')) {
            const fieldName = key.replace('unique_', '')
            stats.push({
                字段名: fieldName,
                唯一值数: analysis[key],
            })
        }
    }

    return stats.sort((a, b) => b['唯一值数'] - a['唯一值数'])
}

/**
 * 构建聚合统计
 */
function buildAggregateStats(analysis: Record<string, any>): Record<string, any>[] {
    const stats: Record<string, any>[] = []

    for (const key in analysis) {
        if (key.startsWith('total_')) {
            const fieldName = key.replace('total_', '')
            stats.push({
                字段名: fieldName,
                合计: analysis[key],
            })
        }
    }

    return stats
}

/**
 * 格式化数字（保留2位小数）
 */
function formatNumber(num: any): string {
    if (num === null || num === undefined) return '-'
    const n = parseFloat(num)
    return isNaN(n) ? '-' : n.toFixed(2)
}

/**
 * 导出原始数据为 Excel（用于导出完整数据集）
 * @param data - 数据数组
 * @param fields - 字段列表
 * @param fileName - 文件名
 */
export function exportRawDataToExcel(
    data: Record<string, any>[],
    fields?: string[],
    fileName: string = '原始数据'
): void {
    try {
        const workbook = utils.book_new()

        // 如果指定了字段，只导出这些字段
        let exportData = data
        if (fields && fields.length > 0) {
            exportData = data.map((row) => {
                const filtered: Record<string, any> = {}
                fields.forEach((field) => {
                    filtered[field] = row[field]
                })
                return filtered
            })
        }

        const sheet = utils.json_to_sheet(exportData)
        autoFitColumns(sheet, exportData)
        utils.book_append_sheet(workbook, sheet, '数据')

        writeFile(workbook, `${fileName}_${Date.now()}.xlsx`)
        console.log('[Export] 原始数据导出成功')
    } catch (error) {
        console.error('[Export] 原始数据导出失败:', error)
        alert('导出失败，请查看控制台错误信息')
    }
}

/**
 * 导出为 CSV 文件
 * @param analysisResult - 分析结果
 * @param fileName - 文件名
 */
export function exportAnalysisToCSV(
    analysisResult: DynamicAnalysisResult,
    fileName: string = '数据分析报告'
): void {
    try {
        const workbook = utils.book_new()

        // 1. 导出统计摘要
        const summary = buildAnalysisSummary(analysisResult)
        const summarySheet = utils.json_to_sheet(summary)
        autoFitColumns(summarySheet, summary)
        utils.book_append_sheet(workbook, summarySheet, '统计摘要')

        // 2. 导出字段分析
        if (analysisResult.analysis?.fields) {
            const fieldAnalysis = buildFieldAnalysis(analysisResult.analysis)
            const fieldSheet = utils.json_to_sheet(fieldAnalysis)
            autoFitColumns(fieldSheet, fieldAnalysis)
            utils.book_append_sheet(workbook, fieldSheet, '字段分析')
        }

        // 3. 导出样本数据
        if (analysisResult.sample_data) {
            const sampleData = analysisResult.sample_data.fields || analysisResult.sample_data
            const sampleArray = Array.isArray(sampleData) ? sampleData : [sampleData]
            const sampleSheet = utils.json_to_sheet(sampleArray)
            autoFitColumns(sampleSheet, sampleArray)
            utils.book_append_sheet(workbook, sampleSheet, '样本数据')
        }

        // 写入为 CSV（这里我们还是用 XLSX，它会处理多 sheet）
        writeFile(workbook, `${fileName}_${Date.now()}.csv`)
        console.log('[Export] CSV 文件导出成功')
    } catch (error) {
        console.error('[Export] CSV 导出失败:', error)
        alert('导出失败，请查看控制台错误信息')
    }
}

/**
 * 生成分析报告 HTML（可选）
 * @param analysisResult - 分析结果
 * @returns HTML 字符串
 */
export function generateAnalysisReport(analysisResult: DynamicAnalysisResult): string {
    const analysis = analysisResult.analysis || {}
    const reportDate = new Date().toLocaleString('zh-CN')

    let html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>数据分析报告</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #3498db; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .stat-item { display: inline-block; margin-right: 30px; }
            .stat-label { color: #7f8c8d; font-size: 12px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        </style>
    </head>
    <body>
        <h1>📊 数据分析报告</h1>
        <div class="summary-box">
            <div class="stat-item">
                <div class="stat-label">总记录数</div>
                <div class="stat-value">${analysisResult.records_count || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">字段数</div>
                <div class="stat-value">${analysis.fields?.length || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">使用模板</div>
                <div class="stat-value">${analysisResult.template_id || '通用'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">生成时间</div>
                <div class="stat-value" style="font-size: 14px;">${reportDate}</div>
            </div>
        </div>

        <h2>字段分析</h2>
        <table>
            <thead>
                <tr>
                    <th>字段名</th>
                    <th>类型</th>
                    <th>非空数</th>
                    <th>空值数</th>
                    <th>统计信息</th>
                </tr>
            </thead>
            <tbody>
    `

    const fields = analysis.fields as string[] | undefined
    if (fields) {
        for (const fieldName of fields) {
            const fieldKey = `field_${fieldName}`
            const fieldInfo = analysis[fieldKey]

            if (fieldInfo) {
                let stats = ''
                if (fieldInfo.type === 'text') {
                    stats = `唯一值: ${fieldInfo.uniqueCount || 0}`
                } else if (fieldInfo.type === 'numeric') {
                    stats = `平均: ${formatNumber(fieldInfo.average)}, 最大: ${fieldInfo.max}`
                }

                html += `
                    <tr>
                        <td>${fieldName}</td>
                        <td>${fieldInfo.type || '-'}</td>
                        <td>${fieldInfo.nonNullCount || 0}</td>
                        <td>${fieldInfo.nullCount || 0}</td>
                        <td>${stats}</td>
                    </tr>
                `
            }
        }
    }

    html += `
            </tbody>
        </table>
        <p style="text-align: center; color: #7f8c8d; margin-top: 40px;">
            本报告由数据分析器自动生成
        </p>
    </body>
    </html>
    `

    return html
}

/**
 * 下载 HTML 报告
 * @param analysisResult - 分析结果
 * @param fileName - 文件名
 */
export function downloadAnalysisReport(
    analysisResult: DynamicAnalysisResult,
    fileName: string = '数据分析报告'
): void {
    try {
        const html = generateAnalysisReport(analysisResult)
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}_${Date.now()}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('[Export] HTML 报告导出成功')
    } catch (error) {
        console.error('[Export] HTML 导出失败:', error)
        alert('导出失败，请查看控制台错误信息')
    }
}
