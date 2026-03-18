import { useState, useEffect } from 'react'
import type { AnalysisResult } from './api'
import { analyzeFile, validateFile, checkHealth } from './api'
import './App.css'

interface HistoryItem {
  id: string
  filename: string
  timestamp: Date
  type: string
  result: AnalysisResult
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isServerOnline, setIsServerOnline] = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [dragActive, setDragActive] = useState(false)

  const itemsPerPage = 10

  // 检查后端服务
  useEffect(() => {
    const checkServer = async () => {
      const online = await checkHealth()
      setIsServerOnline(online)
      if (!online) {
        setError('⚠️ 后台服务未运行。请确保已启动 `npm run dev`（在 server 目录中）')
      }
    }
    checkServer()
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [])

  // 应用主题
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

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

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const selectedFile = files[0]
      const validation = validateFile(selectedFile)
      if (validation.valid) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError(validation.error || '文件验证失败')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('请先选择文件')
      return
    }

    if (!isServerOnline) {
      setError('后台服务不可用，请先启动后端服务')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeFile(file)
      setResult(data)

      // 添加到历史记录
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        filename: file.name,
        timestamp: new Date(),
        type: data.fileType,
        result: data
      }
      setHistory([historyItem, ...history.slice(0, 19)])
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setCurrentPage(1)
    setSearchQuery('')
    setSortColumn(null)
  }

  const handleExport = () => {
    if (!result) return
    const json = JSON.stringify(result, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename.split('.')[0]}_analysis.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFilteredData = () => {
    if (!result?.data) return []
    let filtered = result.data

    if (searchQuery) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[sortColumn] || '')
        const bVal = String(b[sortColumn] || '')
        const cmp = aVal.localeCompare(bVal)
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return filtered
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatistics = () => {
    if (!result) return null
    return {
      totalRows: result.totalRows || result.data?.length || 0,
      totalSheets: result.sheets?.length || 0,
      totalParagraphs: result.totalParagraphs || 0,
      columns: result.data?.[0] ? Object.keys(result.data[0]).length : 0
    }
  }

  const stats = getStatistics()
  const hasData = result && (result.data?.length || result.paragraphs?.length)

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo">📊</span>
            数据分析工作室
          </h1>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="切换主题"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <p className="header-subtitle">专业的 Excel 和 Word 文档分析平台</p>
      </header>

      <main className="app-main">
        {!isServerOnline && (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            <span>后台服务未连接。请在另一个终端运行：<code>cd server && npm run dev</code></span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="upload-panel">
          <div
            className={`upload-box ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.docx,.doc"
              disabled={loading}
            />
            <label htmlFor="file-input" className="file-label">
              <div className="upload-icon">📤</div>
              <div className="upload-text">
                {file ? (
                  <>
                    <strong>✓ {file.name}</strong>
                    <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                  </>
                ) : (
                  <>
                    <strong>点击选择或拖放文件</strong>
                    <small>支持 Excel 和 Word 格式</small>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="button-group">
            <button
              onClick={handleUpload}
              disabled={!file || loading || !isServerOnline}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner"></span> 分析中...
                </>
              ) : (
                <>🚀 上传并分析</>
              )}
            </button>

            {result && (
              <>
                <button onClick={handleExport} className="btn btn-secondary">
                  💾 导出数据
                </button>
                <button onClick={handleReset} className="btn btn-outline">
                  🔄 重新开始
                </button>
              </>
            )}
          </div>
        </div>

        {hasData && result && (
          <div className="content-panel">
            {/* 统计面板 */}
            {stats && (
              <div className="statistics-panel">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalRows}</div>
                  <div className="stat-label">数据行数</div>
                </div>
                {stats.totalSheets > 0 && (
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalSheets}</div>
                    <div className="stat-label">Sheet 数</div>
                  </div>
                )}
                {stats.columns > 0 && (
                  <div className="stat-card">
                    <div className="stat-number">{stats.columns}</div>
                    <div className="stat-label">列数</div>
                  </div>
                )}
                {stats.totalParagraphs > 0 && (
                  <div className="stat-card">
                    <div className="stat-number">{stats.totalParagraphs}</div>
                    <div className="stat-label">段落数</div>
                  </div>
                )}
              </div>
            )}

            {/* 文件信息 */}
            <div className="file-info-card">
              <h3>📄 文件信息</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">文件名</span>
                  <span className="info-value">{result.filename}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">类型</span>
                  <span className="info-value badge">{result.fileType}</span>
                </div>
                {result.sheets && (
                  <div className="info-item">
                    <span className="info-label">分析时间</span>
                    <span className="info-value">{new Date().toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Excel 内容 */}
            {result.sheets && result.sheets.length > 0 && (
              <div className="content-card">
                <h3>📊 Sheet 列表</h3>
                <div className="sheet-list">
                  {result.sheets.map((sheet, i) => (
                    <span key={i} className="sheet-tag">📋 {sheet}</span>
                  ))}
                </div>
              </div>
            )}

            {result.data && result.data.length > 0 && (
              <div className="content-card">
                <div className="card-header">
                  <h3>📈 数据表格</h3>
                  <input
                    type="text"
                    placeholder="搜索数据..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="search-input"
                  />
                </div>

                {searchQuery && (
                  <p className="search-result">找到 {filteredData.length} 条结果</p>
                )}

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(result.data[0]).map(key => (
                          <th
                            key={key}
                            onClick={() => {
                              if (sortColumn === key) {
                                setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                              } else {
                                setSortColumn(key)
                                setSortDir('asc')
                              }
                            }}
                            className={sortColumn === key ? `sorted ${sortDir}` : ''}
                          >
                            {key}
                            {sortColumn === key && (
                              <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} title={String(val)}>
                              {String(val).length > 50
                                ? String(val).substring(0, 50) + '...'
                                : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ←
                    </button>
                    <span className="page-info">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Word 内容 */}
            {result.paragraphs && result.paragraphs.length > 0 && (
              <div className="content-card">
                <h3>📝 文档内容</h3>
                <div className="paragraphs-container">
                  {result.paragraphs.map((para, i) => (
                    <p key={i} className="paragraph-item">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Sheet 列表 */}
            {result.sheets && (
              <div className="content-card">
                <h3>📑 Sheet 信息</h3>
                <div className="sheets-grid">
                  {result.sheets.map((sheet, i) => (
                    <div key={i} className="sheet-card">
                      <div className="sheet-icon">📄</div>
                      <div className="sheet-name">{sheet}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && !result && (
          <div className="history-panel">
            <h3>📋 最近分析</h3>
            <div className="history-list">
              {history.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => setResult(item.result)}
                >
                  <div className="history-icon">
                    {item.type === 'Excel' ? '📊' : '📄'}
                  </div>
                  <div className="history-info">
                    <div className="history-name">{item.filename}</div>
                    <div className="history-time">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>💡 支持 Excel (.xlsx, .xls) 和 Word (.docx, .doc) 文件 • 最大 10MB</p>
          <p>✨ 使用拖放或点击选择文件即可开始分析</p>
        </div>
      </footer>
    </div>
  )
}

export default App
