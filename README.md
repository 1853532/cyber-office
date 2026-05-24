# 🏢 Cyber Office - 系统进程可视化监控台

<img width="1456" height="911" alt="截屏2026-05-24 19 58 04" src="https://github.com/user-attachments/assets/76e41eb1-5dbb-4e4e-a55e-4bb1b9f4d302" />


**Cyber Office** 是一个将枯燥的系统进程（Processes）变成赛博朋克风格“虚拟办公室”的开源项目。它通过读取 macOS/Linux 的系统进程资源占用情况，在网页端实时映射为一个个生动的“打工人”。

内存溢出？那是因为他面前堆满了文件。
CPU 爆满？你将看到他疯狂在健身房挥洒汗水。
占用极低？他可能已经跑到茶水间去摸鱼，甚至在休息区躺平睡着了！

> 彻底告别无聊的 `htop` 和活动监视器，来看看你的电脑里，是谁在替你负重前行吧！

## ✨ 核心特性 (Features)

- 🐎 **进程拟人化**：将系统进程映射为一只只努力工作的“赛博小黑马”。
- ⚡️ **实时监控映射**：
  - **正常搬砖**：坐在极简扁平化工位上疯狂敲击键盘，身体随节奏抖动。
  - **爆肝中 (CPU 过高)**：转移到 Gym (跑步机) 上疯狂奔跑、挥汗如雨。
  - **文件堆积 (内存过高)**：手忙脚乱，随时准备被系统 OOM Kill。
  - **摸鱼休眠 (低负载)**：跑到 Rest Area 侧躺着呼呼大睡，或者在 Pantry 喝着咖啡。
- 🏢 **集群式部门划分**：按 App 智能归类（如 Google Chrome 部门、VSCode 专属集群），双击高科技磨砂玻璃门牌，即可深入该部门的独立监控室。
- 🎨 **极致美学 UI**：高级的现代扁平化设计，支持沉浸式的 Glassmorphism (毛玻璃) 和流畅微动画。所有物理场景、人物全由代码和 SVG 原生驱动，拒绝粗糙的贴图。
- 🔫 **一键解雇 (Kill Process)**：看谁不爽，或者谁在吃太多内存？点击他，弹出 KPI 绩效面板，一键 “Fire” (结束进程)！

## 🛠️ 技术栈 (Tech Stack)

- **前端 (Frontend)**: React 18, Vite, TailwindCSS (纯手工打造 CSS 扁平化场景、纯代码 SVG 矢量动画绘制)
- **后端 (Backend)**: Python, FastAPI, psutil, WebSockets
- **系统架构**: Backend 实时抓取系统硬件与进程指标 -> WebSocket 双向推送实时数据 -> Frontend 根据状态机驱动渲染和物理引擎。

## 🚀 快速启动 (Quick Start)

我们提供了一键自动化部署脚本，只需要短短一分钟，即可在你的电脑上直接拉起前后端服务。

### 1. 环境准备
确保你的电脑上已经安装了以下环境：
- Node.js (推荐 v18+)
- Python 3 (推荐 v3.9+)

### 2. 克隆仓库
```bash
git clone https://github.com/your-username/cyber-office.git
cd cyber-office
```

### 3. 一键部署并启动
在 macOS 或 Linux 终端下直接运行我们提供的自动化脚本：

```bash
chmod +x start.sh
./start.sh
```

脚本将自动执行以下操作：
1. 建立 Python 虚拟环境并安装 `psutil`、`fastapi`、`uvicorn` 等依赖。
2. 自动下载并安装前端所需的 `node_modules`。
3. 在后台同时启动 Python WebSocket 引擎和 Vite 前端页面。
4. 启动完成后，在浏览器中打开 `http://localhost:5173` 即可开启监工模式！

## 📂 项目结构 (Structure)

```text
cyber-office/
├── backend/                # Python FastAPI 后端
│   ├── main.py             # WebSocket 服务入口
│   ├── process_manager.py  # 进程抓取、分组、黑白名单过滤逻辑
│   └── requirements.txt    # 后端依赖包
├── frontend/               # React + Tailwind 前端
│   ├── src/
│   │   ├── components/     # 所有可视化的 UI 组件 (办公室网格、小黑马、门牌等)
│   │   ├── utils/          # 状态映射器 (将 CPU/内存等生硬指标映射为 UI 的动作)
│   │   ├── App.jsx         # 前端主入口
│   │   └── index.css       # 全局样式及大量 CSS 关键帧动画声明
│   ├── package.json
│   └── vite.config.js
└── start.sh                # 🚀 一键自动化启动脚本
```

## 🤝 参与贡献 (Contributing)
非常欢迎各位极客提交 PR 或 Issue 来丰富这个赛博办公室的生态！比如你可以：
- 添加新的工位样式
- 设计新的动物或程序员形象
- 添加诸如网络带宽监控等全新的工作状态
- 对 Windows 系统提供更深度的兼容方案

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 将你的修改推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起一个 Pull Request

## 📄 许可证 (License)

Distributed under the MIT License. See `LICENSE` for more information.
