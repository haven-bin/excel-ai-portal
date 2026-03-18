#!/bin/bash

# 快速启动脚本（Linux/Mac）
echo "🚀 启动 Excel/Word 文档分析门户..."

# 检查并创建上传目录
mkdir -p server/uploads

# 在后台启动后端
echo "📡 启动后端服务器..."
cd server
npm install 2>/dev/null
npm run dev &
BACKEND_PID=$!
cd ..

# 启动前端
echo "🎨 启动前端开发服务器..."
npm install 2>/dev/null
npm run dev

# 清理
kill $BACKEND_PID 2>/dev/null
