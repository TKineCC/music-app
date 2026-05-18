# Music App

基于 Next.js 构建的轻量级音乐播放器，使用网易云音乐 API 提供音乐资源。

## 功能特性

- **首页推荐** - 展示推荐歌单，支持点击播放全部歌曲
- **音乐搜索** - 关键词搜索歌曲，显示封面、歌手、专辑信息
- **全屏播放器** - 大尺寸专辑封面（播放时旋转动画）、同步歌词自动滚动、可点击进度条、播放控制（上一首/播放暂停/下一首）
- **迷你播放栏** - 底部固定显示，包含封面、歌曲信息、播放控制、进度条
- **收藏功能** - 收藏喜欢的歌曲，支持收藏和最近播放两个标签页
- **登录系统** - 支持手机号+验证码、扫码登录、手机号+密码三种登录方式
- **状态持久化** - 使用 Zustand persist 中间件，播放状态和收藏列表保存到 localStorage

## 技术栈

| 类别 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js | 16.2.6 |
| UI 库 | React | 19.2.4 |
| 语言 | TypeScript | ^5 |
| 样式 | Tailwind CSS | ^4 |
| UI 组件 | shadcn/ui (base-nova 风格) | ^4.7.0 |
| 动画 | Framer Motion | ^12.38.0 |
| 图标 | Lucide React | ^1.16.0 |
| 状态管理 | Zustand | ^5.0.13 |
| 音乐 API | NeteaseCloudMusicApi | ^4.31.0 |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                    # 根布局（暗色主题、底部导航、播放栏）
│   ├── page.tsx                      # 首页
│   ├── api/music/[...path]/route.ts  # API 代理层
│   ├── search/page.tsx               # 搜索页
│   ├── player/page.tsx               # 全屏播放器
│   └── favorites/page.tsx            # 收藏和最近播放页
├── components/
│   ├── AlbumCover.tsx                # 专辑封面（旋转动画）
│   ├── BottomNav.tsx                 # 底部导航栏
│   ├── LoginModal.tsx                # 登录弹窗
│   ├── Lyrics.tsx                    # 同步歌词显示
│   ├── MusicCard.tsx                 # 歌曲列表项
│   ├── PlayerBar.tsx                 # 迷你播放栏
│   └── SearchInput.tsx               # 搜索输入框
├── services/
│   └── musicApi.ts                   # API 服务层
├── store/
│   ├── playerStore.ts                # 播放器状态管理
│   └── favoriteStore.ts              # 收藏状态管理
├── types/
│   └── music.ts                      # TypeScript 类型定义
└── lib/
    ├── audioManager.ts               # 音频管理单例
    └── utils.ts                      # 工具函数
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm / bun

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动项目

**方式一：同时启动 API 服务器和开发服务器（推荐）**

```bash
npm run dev:full
```

这会同时启动：
- NeteaseCloudMusicApi 服务器 (http://localhost:3001)
- Next.js 开发服务器 (http://localhost:3000)

**方式二：分别启动**

```bash
# 终端 1：启动 API 服务器
npm run server

# 终端 2：启动开发服务器
npm run dev
```

### 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## API 架构

项目使用 Next.js API 路由 (`src/app/api/music/[...path]/route.ts`) 作为代理层，将所有请求转发到本地运行的 NeteaseCloudMusicApi 服务器。代理支持 GET、POST、PUT 方法，并透传 Set-Cookie 头以支持认证。

## 状态管理

两个 Zustand store，均使用 persist 中间件保存到 localStorage：

- **playerStore** - 当前歌曲、播放状态、当前时间、时长、播放列表
- **favoriteStore** - 收藏列表和最近播放列表（最多 20 条）

## 许可证

MIT
