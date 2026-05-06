# 月相日历

一个轻量、可安装、可离线使用的月相日历 PWA 小系统。应用可以按月份查看每日月相、月龄、照明比例，并标记本月的新月、上弦月、满月和下弦月。

## 功能特性

- 月历视图：按月份展示每日月相。
- 月相图标：图标会随月相变化，支持新月、蛾眉月、上弦月、盈凸月、满月、亏凸月、下弦月、残月等状态。
- 日期详情：点击日期后查看月相名称、月龄、照明比例、距下一次新月天数和说明。
- 本月重点：自动列出本月关键月相节点。
- 月份控制：支持上个月、下个月、回到今天，以及指定年月跳转。
- PWA 支持：部署到 HTTPS 后可添加到主屏幕或安装到桌面。
- 离线可用：通过 service worker 缓存核心文件，安装后可离线打开。

## 技术栈

- HTML
- CSS
- JavaScript
- Web App Manifest
- Service Worker

项目不依赖前端框架，也不需要后端服务，可以作为纯静态站点部署。

## 项目结构

```text
.
├── index.html              # 页面结构和 PWA 注册入口
├── styles.css              # 页面样式
├── app.js                  # 月相算法、日历渲染和交互逻辑
├── manifest.webmanifest    # PWA 安装配置
├── service-worker.js       # 离线缓存逻辑
├── icons/
│   ├── icon-192.png        # PWA 192 图标
│   └── icon-512.png        # PWA 512 图标
├── vercel.json             # Vercel 部署配置
├── netlify.toml            # Netlify 部署配置
├── package.json            # 基础脚本
└── DEPLOY.md               # 部署说明
```

## 本地预览

最简单的方式是直接用浏览器打开 `index.html`。

也可以启动一个本地静态服务：

```bash
npm start
```

或者：

```bash
npx serve .
```

注意：`file://` 方式可以预览页面，但不会启用 service worker。PWA 离线缓存和安装能力需要在 `localhost` 或 HTTPS 环境中测试。

## 部署

### Vercel

1. 打开 Vercel。
2. 选择 `Add New Project`。
3. 导入本仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空。
6. Output Directory 留空或填 `.`。
7. 点击 `Deploy`。

### Netlify

1. 打开 Netlify。
2. 选择 `Add new site`。
3. 选择 `Import an existing project`。
4. 导入本仓库。
5. Build command 留空。
6. Publish directory 填 `.`。
7. 点击 `Deploy`。

更多说明见 [DEPLOY.md](./DEPLOY.md)。

## 安装为应用

部署完成后，用浏览器打开 HTTPS 地址：

- 桌面端 Chrome / Edge：地址栏或菜单中选择“安装应用”。
- Android Chrome：菜单中选择“添加到主屏幕”。
- iOS Safari：分享菜单中选择“添加到主屏幕”。

安装后，应用会以独立窗口或主屏幕图标形式打开。

## 月相计算说明

应用使用朔望月近似值 `29.530588853` 天，并以已知新月时间作为基准计算月龄、月相比例和照明比例。该算法适合日历展示和日常参考，不用于天文观测级精度场景。

## 开发命令

```bash
npm run build
```

当前 `build` 脚本会执行 JavaScript 语法检查。

```bash
npm start
```

启动本地静态服务。

## 仓库

GitHub: [ustbwangziye/yuexiang](https://github.com/ustbwangziye/yuexiang)
