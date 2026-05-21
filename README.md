# 我的树洞 · My Tree Hole

一处安放情绪与思绪的小角落。

文艺、私密、属于自己。米白纸张、衬线字体，配二十四节气和情绪基调。

---

## 它有什么

- **写**：Markdown 编辑器（`/compose`），实时预览，自动保存草稿到浏览器
- **读**：按时间倒序的日志列表 + 归档（`/archive`）
- **找**：全文搜索（`/search`）
- **分**：标签云（`/tags`），文章列表（`/tags/[tag]`）
- **节气**：每篇日志自动标注当日节气（如 *小满*），并附情绪基调（*充盈*）
- **心情 / 天气**：每篇可标记当日心情和天气
- **去年今日**：侧栏自动提示历史上同一天的旧日志
- **导出备份**：一键把所有日志导出为 JSON

## 本地运行

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

## 写一篇新日志

最简单的方式：
1. 打开 [`/compose`](http://localhost:3000/compose)，正常写作 + 选节气 / 心情 / 天气 / 标签
2. 点「下载 .md」，得到一个 `2026-05-21-标题.md` 文件
3. 把它放进项目根目录的 `posts/`
4. （如有图片）把图片放进 `public/images/`
5. `git push`，GitHub Actions 会自动重新构建并发布

也可以直接手写 Markdown：

```markdown
---
title: 标题
date: 2026-05-21
tags: ["日常", "思考"]
mood: 充盈      # 见 src/lib/moods.ts
weather: 晴      # 见 src/lib/moods.ts
---

正文……
```

## 国内访问 · Cloudflare Pages 镜像

`*.github.io` 在国内常被污染，对国内读者不友好。镜像一份到 Cloudflare Pages 解决：

1. 注册 / 登录 https://dash.cloudflare.com（免费、不需要信用卡）
2. 左栏 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 Cloudflare 访问你的 GitHub → 选 `MyTreeHole`
4. 构建配置：
   - **Project name**: `mytreehole`（决定 URL：`mytreehole.pages.dev`）
   - **Production branch**: `main`
   - **Framework preset**: `Next.js (Static HTML Export)` 或 None
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variables**: 留空（**不要**设 `NEXT_PUBLIC_BASE_PATH`，CF Pages 部署到根路径）
5. **Save and Deploy**

部署完毕：
- 国际访问：原来的 `artilor901z-bot.github.io/MyTreeHole/`（仍然由 GitHub Actions 自动维护）
- 国内访问：新的 `mytreehole.pages.dev`（CF Pages 监听 main 分支自动重建）

> 💡 Cusdis 评论：默认按 APP_ID 工作，跨域名无需改设置。如想严格限制来源，可以到 cusdis 后台把新域名加进允许列表。

## 发布到 GitHub Pages

1. 把整个项目 push 到 GitHub
2. 仓库 → **Settings** → **Pages**
3. *Source* 选 **GitHub Actions**
4. 第一次 push 后会自动跑 `.github/workflows/deploy.yml`
5. 几分钟后访问：
   - 用户主页仓库（`<username>.github.io`）→ `https://<username>.github.io/`
   - 项目仓库（如 `MyTreeHole`）→ `https://<username>.github.io/MyTreeHole/`
   - workflow 已经自动处理 `basePath`，不需要手动改

> 💡 想让博客私密？把仓库设为 **Private**，GitHub Pages 在付费计划里支持私有部署。
> 或者不开 Pages、不 push，纯本地 `npm run dev` 自留也完全可以。

## 项目结构

```
.
├── posts/                    # 所有日志（Markdown）
├── public/
│   ├── images/               # 日志图片
│   └── search-index.json     # 构建时自动生成
├── src/
│   ├── app/                  # Next.js App Router 页面
│   ├── components/           # 组件
│   └── lib/
│       ├── posts.ts          # MD 读取与索引
│       ├── solarTerms.ts     # 二十四节气 + 情绪基调
│       └── moods.ts          # 心情 / 天气定义
├── scripts/
│   └── build-search-index.mjs# 构建前生成搜索索引
└── .github/workflows/
    └── deploy.yml            # GitHub Pages 自动部署
```

## 评论系统（Cusdis）

每篇日志底部都有匿名评论区，由 [Cusdis](https://cusdis.com) 提供。

- **管理后台** · https://cusdis.com/dashboard
- **登录账号** · Huang Junwei Justin
- **新评论会发邮件到你的 cusdis 注册邮箱**
- **回复**：在 cusdis dashboard 里点 Reply，或直接在文章页评论框里回复（用 owner 身份会自动加 "owner" 标签）
- **审核 / 删除**：dashboard 里能直接操作
- **更换 APP_ID**：编辑 [src/components/Comments.tsx](src/components/Comments.tsx) 顶部那行，或设环境变量 `NEXT_PUBLIC_CUSDIS_APP_ID`

## 修改外观

- 配色：`src/app/globals.css` 顶部的 CSS 变量（米白 / 印章红 / 墨色）
- 字体：`src/app/layout.tsx` 里的 `Noto Serif SC` + `EB Garamond`
- 关于页：`src/app/about/page.tsx`
- 心情 / 天气选项：`src/lib/moods.ts`
- 节气情绪基调：`src/lib/solarTerms.ts`

—— 愿你也有一处可以慢慢说话的地方。
