# 月相日历部署说明

这是一个静态 PWA 应用，不需要后端服务。

## Vercel

1. 把当前目录上传到 GitHub、GitLab 或 Bitbucket。
2. 打开 Vercel，选择 `Add New Project`。
3. 选择这个仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空，Output Directory 留空或填 `.`。
6. 点击 `Deploy`。

## Netlify

1. 把当前目录上传到 GitHub、GitLab 或 Bitbucket。
2. 打开 Netlify，选择 `Add new site`。
3. 选择 `Import an existing project`。
4. 选择这个仓库。
5. Build command 留空，Publish directory 填 `.`。
6. 点击 `Deploy`。

## 安装应用

部署完成后，用浏览器打开 HTTPS 地址。Chrome、Edge、Safari 移动端会提供安装入口，例如“安装应用”或“添加到主屏幕”。

本地 `file://` 预览不会启用 service worker；部署到 Vercel 或 Netlify 后会正常启用离线缓存。
