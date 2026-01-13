# CLIProxyAPI 监控中心

<div align="center">

![CLIProxyAPI Monitor](https://img.shields.io/badge/CLIProxyAPI-Monitor-4ef0c3?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Language](https://img.shields.io/badge/language-JavaScript-yellow?style=for-the-badge)
![i18n](https://img.shields.io/badge/i18n-中文%20%7C%20English-green?style=for-the-badge)

**可视化监控请求状态与资源消耗，快速定位问题渠道**

[English](#english-documentation) | [中文文档](#中文文档)

</div>

---

## 中文文档

### 📖 项目简介

CLIProxyAPI 监控中心是一个单页面监控仪表板，专为 CLIProxyAPI 服务设计。它提供实时的请求监控、Token 用量分析、渠道状态追踪和失败来源定位等功能，帮助用户快速了解 API 使用情况并定位问题。

### 📸 界面预览

#### 数据概览与趋势分析
![数据概览](assets/overview.png)

#### 趋势分布与模型分析
![趋势分布](assets/trends.png)

#### 渠道统计与失败分析
![渠道统计](assets/channel-stats.png)

#### 请求日志
![请求日志](assets/logs.png)

### ⚙️ 前置要求

- 一个运行中的 [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 服务实例（推荐版本 >= 0.5.0，需 `启用使用统计` 与 `启用日志记录到文件`）
- 管理密钥（用于访问 `/v0/management/usage` 等管理接口）
- 现代浏览器（Chrome、Firefox、Safari、Edge 等）

### 🚀 快速开始

#### 为什么没有在线版本？

CLIProxyAPI 的管理接口（`/v0/management/*`）出于安全考虑禁用了 CORS，不允许浏览器跨域访问。因此在线部署的 Dashboard 无法调用 API。

#### 使用方法

1. **下载项目**

   [点击下载 ZIP](https://codeload.github.com/kongkongyo/CLIProxyAPI-Web-Dashboard/zip/refs/heads/main) 并解压到任意目录

   或使用 Git 克隆：
   ```bash
   git clone https://github.com/kongkongyo/CLIProxyAPI-Web-Dashboard.git
   ```

2. **打开监控页面**

   直接双击 `index.html` 在浏览器中打开

3. **配置连接信息**

   首次打开会自动弹出设置对话框：
   - **API 地址**：输入你的 CLIProxyAPI 服务地址（如 `http://localhost:8317`）
   - **管理密钥**：输入管理密钥
   - 点击"保存并刷新"

4. **开始使用**

   配置完成后，页面会自动加载数据并展示监控信息

### ✨ 核心特性

#### 📊 数据可视化
- **实时统计卡片**：请求数、Token 用量、TPM/RPM/RPD 等关键指标
- **每日用量趋势**：多维度展示请求数和 Token 消耗趋势
- **模型用量分布**：Top 10 模型的请求和 Token 占比分析
- **每小时分析**：按小时统计模型请求和 Token 用量

#### 🔍 渠道监控
- **渠道统计**：按来源渠道分类，展示请求数、成功率和最近请求状态
- **失败来源分析**：快速定位失败最多的渠道和模型
- **模型详情展开**：点击渠道行可查看该渠道下所有模型的详细统计
- **状态可视化**：最近 12 次请求的成功/失败状态条

#### 📝 请求日志
- **详细日志记录**：认证索引、API、模型、渠道、状态、Token 等完整信息
- **多维度筛选**：支持按 API、模型、来源渠道、状态筛选
- **时间范围选择**：今天、最近 7/14/30 天或自定义日期范围
- **自动刷新**：支持 5/10/15/30/60 秒自动刷新
- **分页浏览**：每页 50 条记录，支持快速翻页

#### 🛠️ 管理功能
- **一键禁用模型**：在渠道统计、失败分析和日志中快速禁用问题模型
- **三次确认机制**：防止误操作，循序渐进提示风险
- **配置管理**：API 地址和管理密钥本地存储，安全可靠

#### 🌍 国际化支持
- **中英文切换**：一键切换界面语言
- **完整翻译**：所有界面元素、提示信息、错误消息均支持双语
- **语言记忆**：自动保存用户语言偏好

#### 🎨 用户体验
- **响应式设计**：适配桌面和移动设备
- **深色主题**：护眼的深色科技风格界面
- **平滑动画**：流畅的过渡效果和交互反馈
- **URL 书签**：滚动自动更新 URL，支持直接分享和收藏
- **侧边导航**：快速跳转到各个功能区块

### 📋 功能详解

#### 数据概览

顶部展示关键指标：
- **请求数**：总请求数、成功数、失败数和成功率
- **Tokens**：输入、输出、思考、缓存 Token 的详细统计
- **平均 TPM**：每分钟 Token 数
- **平均 RPM**：每分钟请求数
- **日均 RPD**：每日请求数

#### 趋势分布

- **每日用量趋势**：折线图展示请求数，堆叠柱状图展示各类 Token 用量
- **模型用量分布**：环形图展示 Top 10 模型的占比，支持切换请求数/Token 视图

#### 每小时分析

- **模型请求分布**：堆叠柱状图展示 Top 6 模型的每小时请求数，叠加成功率折线
- **Token 用量**：展示每小时各类 Token 的用量趋势
- 支持查看最近 12/24 小时或全部数据

#### 渠道统计

- **渠道列表**：展示所有活跃渠道的统计信息
- **筛选功能**：按渠道、模型、状态筛选
- **时间范围**：今天、最近 7/14/30 天或自定义日期
- **展开详情**：点击渠道行查看该渠道下所有模型的详细统计
- **快速操作**：点击渠道名复制完整信息，点击禁用按钮快速禁用模型

#### 失败来源分析

- **失败排行**：按失败数降序展示问题渠道
- **主要失败模型**：显示每个渠道失败最多的模型
- **详细统计**：展开查看所有失败模型的成功率和请求状态
- **已禁用标记**：已移除的模型会显示"已移除"标签

#### 请求日志

- **完整记录**：每条请求的详细信息
- **多维筛选**：API、模型、来源渠道、状态
- **时间筛选**：支持预设时间范围和自定义日期
- **自动刷新**：可设置自动刷新间隔，实时监控
- **分页浏览**：支持首页、上一页、下一页、末页快速导航

### 🔧 配置说明

#### 本地存储

所有配置信息保存在浏览器的 localStorage 中：
- `cli_proxy_api_url`：API 服务地址
- `cli_proxy_secret_key`：管理密钥
- `cli_proxy_language`：界面语言（zh/en）

> ⚠️ 安全提示：localStorage 以明文保存上述内容，同一浏览器上下文的脚本都能读取。请勿在公共/共享设备上勾选"记住配置"，使用完毕后立刻删除 `cli_proxy_*` 键（浏览器设置 → 隐私 → 清除站点数据，或在开发者工具 Application → Local Storage 中手动移除），并定期轮换管理密钥。

### 🔒 安全说明

- **本地存储**：所有配置信息仅保存在浏览器本地，不会上传到任何服务器，但以明文形式存在，任何同源脚本都可读取
- **共享设备**：在公共环境使用后务必清除 `cli_proxy_*` localStorage 项或直接使用浏览器隐身模式，避免管理密钥泄露
- **HTTPS 建议**：生产环境建议使用 HTTPS 访问 API 服务
- **密钥保护**：管理密钥具有完全管理权限，请妥善保管

### 🐛 故障排查

#### 无法连接到 API

1. 检查 API 地址是否正确（包括协议和端口）
2. 确认 CLIProxyAPI 服务正在运行
3. 检查浏览器控制台是否有跨域错误
4. 验证管理密钥是否正确

#### 数据不显示

1. 打开浏览器开发者工具查看网络请求
2. 检查 API 响应状态码和内容
3. 确认管理密钥具有访问权限
4. 查看浏览器控制台是否有 JavaScript 错误

#### 图表显示异常

1. 确认 Chart.js 库已正确加载
2. 检查浏览器是否支持 Canvas
3. 尝试刷新页面重新加载数据

### 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

### 🙏 致谢

- [Chart.js](https://www.chartjs.org/) - 强大的图表库
- [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) - API 代理服务
- [Claude](https://claude.ai/) - Anthropic 的 AI 助手，协助完成代码开发

---

## English Documentation

### 📖 Introduction

CLIProxyAPI Monitor Center is a powerful single-page monitoring dashboard designed for CLIProxyAPI services. It provides real-time request monitoring, token usage analysis, channel status tracking, and failure source location, helping users quickly understand API usage and locate issues.

### 📸 Screenshots

#### Overview & Trend Analysis
![Overview](assets/overview.png)

#### Trends & Model Distribution
![Trends](assets/trends.png)

#### Channel Statistics & Failure Analysis
![Channel Stats](assets/channel-stats.png)

#### Request Logs
![Logs](assets/logs.png)

### ⚙️ Prerequisites

- A running [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) service instance (recommended version >= 0.5.0 with `/v0/management/usage` and `/v0/management/openai-compatibility` enabled)
- Admin secret key (for accessing `/v0/management/usage` and other management endpoints)
- Modern browser (Chrome, Firefox, Safari, Edge, etc.)

### 🚀 Quick Start

#### Why No Online Version?

CLIProxyAPI's management endpoints (`/v0/management/*`) have CORS disabled for security reasons, preventing browser cross-origin access. Therefore, an online deployed Dashboard cannot call the API.

#### Usage

1. **Download Project**

   [Click to download ZIP](https://codeload.github.com/kongkongyo/CLIProxyAPI-Web-Dashboard/zip/refs/heads/main) and extract to any directory

   Or clone with Git:
   ```bash
   git clone https://github.com/kongkongyo/CLIProxyAPI-Web-Dashboard.git
   ```

2. **Open Monitor Page**

   Double-click `index.html` to open in browser

3. **Configure Connection**

   Settings dialog will appear on first open:
   - **API URL**: Enter your CLIProxyAPI service address (e.g., `http://localhost:8317`)
   - **Admin Secret Key**: Enter your admin secret key
   - Click "Save & Refresh"

4. **Start Using**

   After configuration, the page will automatically load and display monitoring data

### ✨ Key Features

#### 📊 Data Visualization
- **Real-time Statistics**: Requests, tokens, TPM/RPM/RPD metrics
- **Daily Usage Trends**: Multi-dimensional display of requests and token consumption
- **Model Distribution**: Top 10 models by requests and token share
- **Hourly Analysis**: Hourly statistics for model requests and token usage

#### 🔍 Channel Monitoring
- **Channel Statistics**: Categorized by source channel with request count, success rate, and recent status
- **Failure Analysis**: Quickly locate channels and models with the most failures
- **Model Details**: Click channel rows to view detailed statistics for all models
- **Status Visualization**: Success/failure status bars for the last 12 requests

#### 📝 Request Logs
- **Detailed Records**: Complete information including auth index, API, model, channel, status, tokens
- **Multi-dimensional Filtering**: Filter by API, model, source channel, status
- **Time Range Selection**: Today, last 7/14/30 days, or custom date range
- **Auto Refresh**: Support 5/10/15/30/60 second auto-refresh intervals
- **Pagination**: 50 records per page with quick navigation

#### 🛠️ Management Features
- **One-click Model Disable**: Quickly disable problematic models from channel stats, failure analysis, and logs
- **Triple Confirmation**: Prevent accidental operations with progressive risk warnings
- **Configuration Management**: API URL and admin key stored locally for security

#### 🌍 Internationalization
- **Language Toggle**: Switch between Chinese and English with one click
- **Complete Translation**: All UI elements, prompts, and error messages support both languages
- **Language Memory**: Automatically saves user language preference

#### 🎨 User Experience
- **Responsive Design**: Adapts to desktop and mobile devices
- **Dark Theme**: Eye-friendly dark tech-style interface
- **Smooth Animations**: Fluid transitions and interaction feedback
- **URL Bookmarks**: Auto-update URL on scroll, support direct sharing and bookmarking
- **Side Navigation**: Quick jump to different functional sections

### 📋 Feature Details

#### Data Overview

Top section displays key metrics:
- **Requests**: Total requests, success count, failure count, and success rate
- **Tokens**: Detailed statistics for input, output, reasoning, and cache tokens
- **Avg TPM**: Tokens per minute
- **Avg RPM**: Requests per minute
- **Avg RPD**: Requests per day

#### Trends & Distribution

- **Daily Usage Trend**: Line chart for requests, stacked bar chart for token types
- **Model Distribution**: Doughnut chart showing Top 10 models, toggle between requests/tokens view

#### Hourly Analysis

- **Model Request Distribution**: Stacked bar chart for Top 6 models' hourly requests with success rate line
- **Token Usage**: Hourly trends for different token types
- View last 12/24 hours or all data

#### Channel Statistics

- **Channel List**: Statistics for all active channels
- **Filtering**: Filter by channel, model, status
- **Time Range**: Today, last 7/14/30 days, or custom date
- **Expand Details**: Click channel row to view all models' detailed statistics
- **Quick Actions**: Click channel name to copy info, click disable button to disable model

#### Failure Analysis

- **Failure Ranking**: Channels sorted by failure count
- **Main Failed Models**: Shows models with most failures per channel
- **Detailed Stats**: Expand to view all failed models' success rates and request status
- **Disabled Markers**: Removed models show "Removed" tag

#### Request Logs

- **Complete Records**: Detailed information for each request
- **Multi-filtering**: API, model, source channel, status
- **Time Filtering**: Preset time ranges and custom dates
- **Auto Refresh**: Configurable auto-refresh intervals for real-time monitoring
- **Pagination**: Quick navigation with first, previous, next, last page buttons

### 🔧 Configuration

#### Local Storage

All configuration is saved in browser localStorage:
- `cli_proxy_api_url`: API service address
- `cli_proxy_secret_key`: Admin secret key
- `cli_proxy_language`: Interface language (zh/en)

> ⚠️ Security note: localStorage keeps these values in plaintext, so any script running in the same browser context can read them. Avoid persisting the admin key on shared/public devices, wipe the `cli_proxy_*` entries after each session (Settings → Privacy → Clear site data or DevTools → Application → Local Storage), and rotate the key regularly.

### 🔒 Security Notes

- **Local Storage**: Configuration stays in the browser but is plaintext, so any same-origin script can read it
- **Shared Devices**: Use private/incognito windows or wipe the `cli_proxy_*` keys after every session when working on shared machines
- **HTTPS Recommended**: Use HTTPS for API service in production
- **Key Protection**: Admin key has full management privileges, keep it secure

### 🐛 Troubleshooting

#### Cannot Connect to API

1. Check if API URL is correct (including protocol and port)
2. Confirm CLIProxyAPI service is running
3. Check browser console for CORS errors
4. Verify admin secret key is correct

#### Data Not Displaying

1. Open browser developer tools to check network requests
2. Check API response status code and content
3. Confirm admin key has access permissions
4. Check browser console for JavaScript errors

#### Chart Display Issues

1. Confirm Chart.js library is loaded correctly
2. Check if browser supports Canvas
3. Try refreshing page to reload data

### 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) - Powerful charting library
- [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) - API proxy service
- [Claude](https://claude.ai/) - Anthropic's AI assistant for code development

---

<div align="center">

[Report Bug](https://github.com/kongkongyo/CLIProxyAPI-Web-Dashboard/issues) · [Request Feature](https://github.com/kongkongyo/CLIProxyAPI-Web-Dashboard/issues)

</div>
