@echo off
REM Windows 快速启动脚本
echo 🚀 启动 Excel/Word 文档分析门户...

REM 创建上传目录
if not exist "server\uploads" mkdir server\uploads

REM 安装后端依赖
echo 📦 安装后端依赖...
cd server
call npm install
echo.
echo 📡 启动后端服务器（端口 3001）...
start cmd /k "npm run dev"
cd ..

REM 暂停以便后端启动
timeout /t 3

REM 安装前端依赖
echo 📦 安装前端依赖...
call npm install
echo.
echo 🎨 启动前端开发服务器（端口 5173）...
echo.
echo ✨ 前后端都已启动！
echo 📱 在浏览器中打开: http://localhost:5173
echo.

REM 启动前端
call npm run dev
