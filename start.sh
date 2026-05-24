#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}🚀 启动 Cyber Office - 系统进程指挥中心${NC}"
echo -e "${BLUE}=================================================${NC}\n"

# 检查依赖
echo "🔍 检查环境依赖..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 未检测到 npm，请先安装 Node.js${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ 未检测到 Python3，请先安装 Python3${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 环境检查通过${NC}\n"

# 停止可能存在的旧进程
echo "🧹 清理可能遗留的旧服务..."
pkill -f "uvicorn main:app" || true
pkill -f "vite" || true

# 安装和启动后端
echo -e "${BLUE}📦 [1/2] 正在初始化后端服务 (FastAPI)...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "创建 Python 虚拟环境..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "安装后端依赖..."
pip install -r requirements.txt > /dev/null 2>&1

echo "启动后端 WebSocket 服务..."
uvicorn main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ 后端已启动运行 (PID: $BACKEND_PID)${NC}\n"
cd ..

# 安装和启动前端
echo -e "${BLUE}📦 [2/2] 正在初始化前端服务 (React + Vite)...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖 (这可能需要几十秒)..."
    npm install > /dev/null 2>&1
fi

echo "启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}🎉 启动成功！Cyber Office 正在运行！${NC}"
echo -e "前端地址: ${BLUE}http://localhost:5173${NC}"
echo -e "后端 API: ${BLUE}http://localhost:8000${NC}"
echo -e "💡 提示: 请在浏览器中打开前端地址进行监工"
echo -e "💡 提示: 按下 ${RED}Ctrl + C${NC} 即可优雅地停止所有服务"
echo -e "${GREEN}=================================================${NC}\n"

# 捕获 Ctrl+C，清理后台进程
trap "echo -e '\n${RED}🛑 正在关闭 Cyber Office...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
