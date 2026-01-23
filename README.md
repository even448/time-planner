# ⏰ 时间规划助手

一个现代化的时间管理和专注力提升应用，集成倒计时、待办事项、番茄钟和数据统计功能。

<div align="center">
  
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite)
![NextUI](https://img.shields.io/badge/NextUI-2.6-000000?style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss)

</div>

## ✨ 核心功能

### 📅 倒计时管理
- **重要日期追踪**：记录生日、纪念日、考试等重要时刻
- **多维度显示**：天数、小时、分钟精确倒计时
- **进度可视化**：直观的进度条和百分比显示
- **归档管理**：已过期事件自动归档，保持界面整洁

### ✅ 智能待办清单
- **艾森豪威尔矩阵**：按重要性和紧急性四象限分类任务
  - 重要且紧急（立即执行）
  - 重要不紧急（计划执行）
  - 紧急不重要（委托执行）
  - 不紧急不重要（选择执行）
- **习惯追踪**：建立日常习惯，记录连续完成天数
- **我的一天**：每日任务精选，专注当前目标
- **子任务系统**：将复杂任务拆分为可管理的小步骤
- **分区管理**：工作、生活、学习等自定义分类
- **历史记录**：完整的完成历史和统计数据

### 🍅 专注计时器
- **番茄工作法**：25分钟专注 + 5分钟休息的经典节奏
- **自定义时长**：灵活调整工作和休息时间
- **任务关联**：为每个专注时段关联具体任务
- **禅模式**：全屏沉浸式专注体验
- **标签管理**：通过标签组织和筛选专注任务
- **会话历史**：完整记录每次专注会话的详细信息

### 📊 数据统计分析
- **整体概览**：总专注时长、完成任务数、平均专注时长
- **趋势分析**：30天专注时长和任务完成趋势图表
- **时段分布**：24小时生产力热力图
- **任务占比**：各类任务时间分配饼图
- **每周统计**：周度专注时长和任务分布对比
- **热力日历**：GitHub风格的年度活动热力图

## 🛠 技术栈

### 前端框架
- **React 18** - 现代化UI构建
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发构建工具

### UI组件库
- **NextUI** - 精美的React UI组件库
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 流畅的动画效果
- **Lucide React** - 简洁的图标库

### 状态管理
- **Zustand** - 轻量级状态管理方案
- **zustand/middleware** - 持久化存储支持

### 数据可视化
- **Recharts** - React图表库
- **react-activity-calendar** - GitHub风格活动日历
- **react-circular-progressbar** - 圆形进度条

### 路由
- **React Router v6** - 单页应用路由管理

### 其他工具
- **date-fns** - 现代化日期处理库
- **@dnd-kit** - 拖拽排序功能

## 🚀 快速开始

### 环境要求
- Node.js >= 16.x
- npm >= 7.x 或 yarn >= 1.22.x

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/time-planner-pwa.git
cd time-planner-pwa
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
# 如果遇到PowerShell执行策略限制
node node_modules/vite/bin/vite.js

# 或使用npm（需要管理员权限设置执行策略）
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

5. **预览生产构建**
```bash
npm run preview
```

## 📁 项目结构

```
time-planner-pwa/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout.tsx       # 主布局和导航
│   │   ├── CountdownCard.tsx    # 倒计时卡片
│   │   ├── TodoItem.tsx         # 待办事项
│   │   ├── EisenhowerMatrix.tsx # 四象限矩阵
│   │   ├── FocusTimer.tsx       # 番茄钟计时器
│   │   └── ...
│   ├── pages/               # 页面组件
│   │   ├── CountdownPage.tsx    # 倒计时页面
│   │   ├── TodoPage.tsx         # 待办清单页面
│   │   ├── FocusPage.tsx        # 专注页面
│   │   └── StatsPage.tsx        # 统计页面
│   ├── store/               # 状态管理
│   │   └── useAppStore.ts       # Zustand store
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── index.ts             # 通用工具
│   │   └── statistics.ts        # 统计计算
│   ├── hooks/               # 自定义Hooks
│   │   └── useFocusTimer.ts     # 计时器Hook
│   ├── App.tsx              # 应用根组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML模板
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── package.json             # 项目依赖
```

## 💡 使用技巧

### 艾森豪威尔矩阵使用
1. 创建任务时设置"重要"和"紧急"标签
2. 任务会自动分配到对应象限
3. 优先处理"重要且紧急"象限的任务
4. 为"重要不紧急"的任务制定计划

### 习惯养成
1. 创建任务时选择类型为"习惯"
2. 每天完成后打勾，系统自动记录连续天数
3. 连续完成可查看当前连续记录
4. 在统计页面查看习惯完成热力图

### 专注会话管理
1. 开始专注前选择或创建任务
2. 添加标签便于后续筛选（如：工作、学习、阅读）
3. 使用禅模式获得沉浸式体验
4. 会话结束后可添加笔记记录心得

### 数据分析
1. 在统计页面查看整体专注数据
2. 通过趋势图了解时间管理改善情况
3. 利用时段分布图找到最佳工作时段
4. 定期回顾任务分配，优化时间投入

## 🎨 主题定制

应用支持深色/浅色主题切换，可在设置中调整：
- 浅色主题：适合白天使用
- 深色主题：适合夜间使用，保护视力

## 📱 PWA支持

本应用支持Progressive Web App特性：
- 离线使用
- 添加到主屏幕
- 快速加载
- 推送通知（规划中）

## 🔮 未来规划

- [ ] 云端同步功能
- [ ] 多设备数据同步
- [ ] 番茄钟完成提醒音效
- [ ] 任务标签系统增强
- [ ] 数据导出功能（CSV/PDF）
- [ ] 周报/月报生成
- [ ] 团队协作功能
- [ ] AI智能任务推荐

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源 - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

[@your-username](https://github.com/your-username)

## 🙏 致谢

- [NextUI](https://nextui.org/) - 精美的UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - 强大的CSS框架
- [Recharts](https://recharts.org/) - 优秀的图表库
- [Lucide](https://lucide.dev/) - 漂亮的图标集

---

⭐ 如果这个项目对你有帮助，请给一个Star支持一下！
