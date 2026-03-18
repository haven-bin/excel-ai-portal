import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import mammoth from 'mammoth'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, 'uploads'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('只支持 Excel 和 Word 文件'))
        }
    }
})

// Helper functions
async function analyzeExcel(filePath) {
    try {
        const fileContent = readFileSync(filePath)
        const workbook = XLSX.read(fileContent, { type: 'buffer' })

        const sheets = workbook.SheetNames
        const data = []

        // Get data from first sheet
        if (sheets.length > 0) {
            const firstSheet = workbook.Sheets[sheets[0]]
            const sheetData = XLSX.utils.sheet_to_json(firstSheet)
            data.push(...sheetData)
        }

        return {
            filename: filePath.split('/').pop(),
            fileType: 'Excel',
            sheets: sheets,
            data: data.slice(0, 100), // Limit to 100 rows for preview
            totalRows: data.length
        }
    } catch (error) {
        throw new Error('Excel 文件解析失败: ' + error.message)
    }
}

async function analyzeWord(filePath) {
    try {
        const fileContent = readFileSync(filePath)

        const result = await mammoth.extractRawText({ buffer: fileContent })
        const paragraphs = result.value
            .split('\n')
            .filter(p => p.trim().length > 0)

        const tables = []
        try {
            const tableResult = await mammoth.extractRawText({
                buffer: fileContent,
                styleMap: ["b => strong", "i => em"]
            })
            // Note: mammoth doesn't provide detailed table info, 
            // but we can extract table structure if needed
        } catch (e) {
            // Continue if table extraction fails
        }

        return {
            filename: filePath.split('/').pop(),
            fileType: 'Word',
            paragraphs: paragraphs.slice(0, 50), // Limit for preview
            totalParagraphs: paragraphs.length,
            tables: tables
        }
    } catch (error) {
        throw new Error('Word 文件解析失败: ' + error.message)
    }
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '后台服务正常运行' })
})

app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未收到文件' })
        }

        const filePath = req.file.path
        const fileType = req.file.mimetype
        let result

        // Determine file type and analyze accordingly
        if (fileType.includes('spreadsheetml') || fileType.includes('excel')) {
            result = await analyzeExcel(filePath)
        } else if (fileType.includes('wordprocessingml') || fileType.includes('word')) {
            result = await analyzeWord(filePath)
        } else {
            throw new Error('不支持的文件类型')
        }

        // Clean up uploaded file
        try {
            unlinkSync(filePath)
        } catch (e) {
            console.error('删除临时文件失败:', e)
        }

        res.json(result)
    } catch (error) {
        // Clean up on error
        if (req.file) {
            try {
                unlinkSync(req.file.path)
            } catch (e) {
                console.error('删除临时文件失败:', e)
            }
        }

        res.status(500).json({
            error: error.message || '文件分析过程中出错'
        })
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({
        error: err.message || '服务器内部错误'
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`📊 后台服务已启动: http://localhost:${PORT}`)
    console.log(`✅ 文件分析 API: POST http://localhost:${PORT}/api/analyze`)
    console.log(`✅ 健康检查: GET http://localhost:${PORT}/api/health`)
})
