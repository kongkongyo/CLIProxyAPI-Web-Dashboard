// 配置存储键名
const STORAGE_KEY_API_URL = "cli_proxy_api_url";
const STORAGE_KEY_SECRET = "cli_proxy_secret_key";
const STORAGE_KEY_LANG = "cli_proxy_language";

// 默认语言
const DEFAULT_LANG = localStorage.getItem(STORAGE_KEY_LANG) || "zh";

// 从 localStorage 读取配置，无默认值
const DEFAULT_API_URL = localStorage.getItem(STORAGE_KEY_API_URL) || "";
const DEFAULT_SECRET_KEY = localStorage.getItem(STORAGE_KEY_SECRET) || "";

const PRICE_PER_K_TOKEN = 0.002;
const TOKEN_SCALE = 1000;
const MODEL_COLOR_PALETTE = [
  "#facc15",
  "#22c55e",
  "#f97316",
  "#2dd4bf",
  "#c084fc",
  "#ef4444",
  "#14b8a6",
];
const TOKEN_TREND_SCALE = 1000; // 将 Tokens 缩放为“千”为单位

const state = {
  usage: null,
  details: [],
  timeframeDays: 7,
  keyFilter: "",
  distributionMode: "request",
  loadHourRange: "12",
  modelHourRange: "12",
  currentDetails: [],
  providerMap: {},
  providerModels: {}, // 存储每个渠道可用的模型列表 { providerName: Set<modelAlias> }
  compatibilityLoaded: false,
  logFilterApi: "",
  logFilterModel: "",
  logFilterSource: "",
  logFilterStatus: "",
  channelStatsDays: 7,
  failureStatsDays: 7,
  // 渠道统计筛选
  channelFilterChannel: "",
  channelFilterModel: "",
  channelFilterStatus: "",
  // 失败来源分析筛选
  failureFilterChannel: "",
  failureFilterModel: "",
  // 自定义日期范围状态
  channelCustomRange: null, // { start: Date, end: Date } 或 null
  failureCustomRange: null, // { start: Date, end: Date } 或 null
  // 日志分页状态
  logPage: 1,
  logPageSize: 50,
  // 日志时间筛选
  logTimeDays: 7,
  logCustomRange: null, // { start: Date, end: Date } 或 null
  // 自动刷新
  logAutoRefreshInterval: null,
  logCountdownInterval: null,
  logCountdown: 0,
  // 当前语言
  currentLang: DEFAULT_LANG,
};

let trendChart = null;
let distributionChart = null;
let hourlyChart = null;
let hourlyModelChart = null;

// 注册自定义 tooltip 位置器：智能左右切换
Chart.Tooltip.positioners.smartPosition = function(elements, eventPosition) {
  if (!elements.length) {
    return false;
  }
  const chart = this.chart;
  const chartArea = chart.chartArea;
  const chartWidth = chartArea.right - chartArea.left;
  const midPoint = chartArea.left + chartWidth / 2;

  // 计算元素的平均位置
  let x = 0, y = 0;
  for (const el of elements) {
    x += el.element.x;
    y += el.element.y;
  }
  x /= elements.length;
  y /= elements.length;

  return { x, y };
};

// ==================== 国际化翻译字典 ====================
const i18n = {
  zh: {
    // 页面标题和头部
    pageTitle: "CLIProxyAPI 监控中心",
    pageSubtitle: "可视化监控请求状态与资源消耗，快速定位问题渠道",
    timeRange: "时间范围",
    today: "今天",
    last7Days: "最近 7 天",
    last14Days: "最近 14 天",
    last30Days: "最近 30 天",
    apiQuery: "API查询",
    apiQueryPlaceholder: "查询对应API数据",
    apiUrlPlaceholder: "例如：http://localhost:8317",
    view: "查看",
    switchLang: "切换语言",
    settings: "设置",
    requestLabel: "请求",
    tokenLabel: "Token",

    // 统计卡片
    requests: "请求数",
    tokens: "Tokens",
    avgTpm: "平均 TPM",
    avgRpm: "平均 RPM",
    avgRpd: "日均 RPD",
    lastXDays: "最近 {days} 天",
    successRate: "成功率",
    tokenNote: "最近 7 天 · 输入 输出 思考 缓存 总和",
    tokenTypesSummary: "输入 输出 思考 缓存 总和",
    tpmNote: "最近 7 天 · 每分钟 Token",
    rpmNote: "最近 7 天 · 每分钟请求",
    tokensPerMinute: "每分钟 Token",
    requestsPerMinute: "每分钟请求",
    rpdNote: "最近 7 天 · 每日请求数",
    requestsPerDay: "每日请求数",
    success: "成功 {count}",
    failed: "失败 {count}",

    // 模型用量分布
    modelDistribution: "模型用量分布",
    requestDist: "请求 · Top 10 模型",
    requestShare: "请求占比",
    tokenShare: "Token 占比",

    // 每日用量趋势
    dailyTrend: "每日用量趋势",
    trendCaption: "最近 14 天 · 请求数与 Token 用量趋势",
    trendSuffix: "请求数与 Token 用量趋势",

    // 每小时模型请求分布
    hourlyModelDist: "每小时模型请求分布",
    hourlyModelCaption: "Top 模型 · 全部数据",
    last12Hours: "最近 12 小时",
    last24Hours: "最近 24 小时",
    all: "全部",
    noModelData: "暂无模型分布数据",

    // 每小时 Token 用量
    hourlyTokenUsage: "每小时 Token 用量",
    hourlyTokenCaption: "按类型分布 · 最近 12 小时",
    noHourlyData: "暂无小时级数据",

    // 渠道统计
    channelStats: "渠道统计",
    channelStatsCaption: "最近 7 天 · 按来源渠道分类 · 单击行展开模型详情",
    channel: "渠道",
    requestCount: "请求数",
    successRateColumn: "成功率",
    recentRequestStatus: "最近请求状态",
    lastRequestTime: "最近请求时间",
    noChannelData: "暂无渠道状态数据",
    allChannels: "全部渠道",
    allModels: "全部模型",
    allStatus: "全部状态",
    onlySuccess: "仅成功",
    onlyFailed: "仅失败",
    custom: "自定义",
    dateTo: "至",
    apply: "应用",

    // 失败来源分析
    failureAnalysis: "失败来源分析",
    failureAnalysisCaption: "最近 7 天 · 从来源渠道定位异常 · 单击行展开详情",
    failureCount: "失败数",
    lastFailureTime: "最近失败",
    mainFailureModels: "主要失败模型",
    noFailureData: "暂无失败数据",

    // 请求日志
    requestLogs: "请求日志",
    logCaption: "最近 200 条明细记录 · 自动按时间倒序",
    allApis: "全部 API",
    allSources: "全部来源渠道",
    authIndex: "认证索引",
    api: "API",
    model: "模型",
    requestChannel: "请求渠道",
    status: "状态",
    successStatus: "成功",
    failedStatus: "失败",
    inputTokens: "输入",
    outputTokens: "输出",
    reasoningTokensLabel: "思考",
    cacheTokensLabel: "缓存",
    totalTokens: "总 Token",
    time: "时间",
    actions: "操作",
    waitingForData: "等待加载数据...",
    noDistributionData: "暂无数据，请调整筛选条件。",
    noRankingData: "暂无排行数据",
    noLogData: "暂无日志数据，请调整筛选条件。",
    manualRefresh: "手动刷新",
    refresh5s: "5秒刷新",
    refresh10s: "10秒刷新",
    refresh15s: "15秒刷新",
    refresh30s: "30秒刷新",
    refresh60s: "60秒刷新",

    // 图表标签
    inputTokenLabel: "输入 Token",
    outputTokenLabel: "输出 Token",
    reasoningTokenLabel: "思考 Token",
    cachedTokenLabel: "缓存 Token",
    totalTokenLabel: "总 Token",
    requestsLabel: "请求数",
    overallSuccessRate: "整体成功率",
    times: "次",
    topModels: "Top 模型",
    byType: "按类型分布",

    // 分页
    firstPage: "首页",
    prevPage: "上一页",
    nextPage: "下一页",
    lastPage: "末页",

    // 渠道统计详情
    modelSuccessDetail: "模型成功率详情",
    modelFailureDetail: "模型失败详情",
    channelLabel: "渠道",
    modelsCount: "{count}个模型",
    moreModels: "+{count}个",
    successLabel: "成功",
    failureLabel: "失败",
    disableThisModel: "禁用该渠道的此模型",

    // 自动刷新
    refreshInSeconds: "{seconds}秒后刷新",
    refreshing: "刷新中...",

    // 错误消息
    cannotIdentifyChannel: "无法识别渠道类型",
    disableNotSupported: "暂不支持禁用 {provider} 类型的模型，请使用 oauth-excluded-models 配置",
    fetchConfigFailed: "获取配置失败: HTTP {status}",
    providerNotFound: "未找到提供商: {provider}",
    updateConfigFailed: "更新配置失败: {error}",

    // 侧边导航
    navOverview: "数据概览",
    navTrend: "趋势分布",
    navModelRequest: "模型请求",
    navTokenUsage: "Token用量",
    navChannelStats: "渠道统计",
    navRequestLogs: "请求日志",

    // 模态框
    settingsTitle: "设置",
    settingsDesc: "请输入连接信息以访问统计数据",
    apiUrl: "API 地址",
    secretKey: "管理密钥",
    secretKeyPlaceholder: "输入管理密钥",
    dataSecurityNote: "数据安全：所有设置仅保存于浏览器本地，不会上传至任何服务器",
    cancel: "取消",
    saveAndRefresh: "保存并刷新",
    confirmDisable: "确认禁用",
    confirmDisableMessage: "确定要禁用模型「{model}」吗？",
    confirm: "确认",
    disable: "禁用",
    disabling: "处理中...",
    disabled: "已禁用",
    disableSuccess: "已禁用 {name}",
    disableFailed: "禁用失败",
    tip: "提示",
    confirmOk: "确定",
    copySuccess: "已复制",

    // 状态提示
    pleaseConfigureFirst: "请先配置 API 地址和管理密钥",
    fetchingData: "正在获取最新数据...",
    dataRequestFailed: "数据请求失败：{error}",
    lastUpdate: "最后更新：{time}",

    // 刷新按钮
    refreshData: "刷新数据",
    loading: "加载中...",

    // 语言按钮
    chinese: "中文",
    english: "English",
  },
  en: {
    // Page Title and Header
    pageTitle: "CLIProxyAPI Monitor Center",
    pageSubtitle: "Visual monitoring of request status and resource consumption, quickly locate problematic channels",
    timeRange: "Time Range",
    today: "Today",
    last7Days: "Last 7 Days",
    last14Days: "Last 14 Days",
    last30Days: "Last 30 Days",
    apiQuery: "API Query",
    apiQueryPlaceholder: "Search API data",
    apiUrlPlaceholder: "e.g. http://localhost:8317",
    view: "View",
    switchLang: "Switch Language",
    settings: "Settings",
    requestLabel: "Requests",
    tokenLabel: "Token",

    // Stats Cards
    requests: "Requests",
    tokens: "Tokens",
    avgTpm: "Avg TPM",
    avgRpm: "Avg RPM",
    avgRpd: "Avg RPD",
    lastXDays: "Last {days} Days",
    successRate: "Success Rate",
    tokenNote: "Last 7 Days · Input Output Reasoning Cache Total",
    tokenTypesSummary: "Input Output Reasoning Cache Total",
    tpmNote: "Last 7 Days · Tokens Per Minute",
    rpmNote: "Last 7 Days · Requests Per Minute",
    tokensPerMinute: "Tokens Per Minute",
    requestsPerMinute: "Requests Per Minute",
    rpdNote: "Last 7 Days · Requests Per Day",
    requestsPerDay: "Requests Per Day",
    success: "Success {count}",
    failed: "Failed {count}",

    // Model Distribution
    modelDistribution: "Model Usage Distribution",
    requestDist: "Requests · Top 10 Models",
    requestShare: "Request Share",
    tokenShare: "Token Share",

    // Daily Trend
    dailyTrend: "Daily Usage Trend",
    trendCaption: "Last 14 Days · Requests and Token Usage Trend",
    trendSuffix: "Requests and Token Usage Trend",

    // Hourly Model Distribution
    hourlyModelDist: "Hourly Model Request Distribution",
    hourlyModelCaption: "Top Models · All Data",
    last12Hours: "Last 12 Hours",
    last24Hours: "Last 24 Hours",
    all: "All",
    noModelData: "No model data available",

    // Hourly Token Usage
    hourlyTokenUsage: "Hourly Token Usage",
    hourlyTokenCaption: "By Type · Last 12 Hours",
    noHourlyData: "No hourly data available",

    // Channel Stats
    channelStats: "Channel Statistics",
    channelStatsCaption: "Last 7 Days · By Source Channel · Click row to expand model details",
    channel: "Channel",
    requestCount: "Requests",
    successRateColumn: "Success Rate",
    recentRequestStatus: "Recent Status",
    lastRequestTime: "Last Request",
    noChannelData: "No channel data available",
    allChannels: "All Channels",
    allModels: "All Models",
    allStatus: "All Status",
    onlySuccess: "Success Only",
    onlyFailed: "Failed Only",
    custom: "Custom",
    dateTo: "to",
    apply: "Apply",

    // Failure Analysis
    failureAnalysis: "Failure Source Analysis",
    failureAnalysisCaption: "Last 7 Days · Locate issues by source channel · Click row to expand details",
    failureCount: "Failures",
    lastFailureTime: "Last Failure",
    mainFailureModels: "Main Failed Models",
    noFailureData: "No failure data available",

    // Request Logs
    requestLogs: "Request Logs",
    logCaption: "Last 200 records · Auto sorted by time desc",
    allApis: "All APIs",
    allSources: "All Sources",
    authIndex: "Auth Index",
    api: "API",
    model: "Model",
    requestChannel: "Request Channel",
    status: "Status",
    successStatus: "Success",
    failedStatus: "Failed",
    inputTokens: "Input",
    outputTokens: "Output",
    reasoningTokensLabel: "Reasoning",
    cacheTokensLabel: "Cache",
    totalTokens: "Total Tokens",
    time: "Time",
    actions: "Actions",
    waitingForData: "Waiting for data...",
    noDistributionData: "No data yet, try adjusting filters.",
    noRankingData: "No ranking data",
    noLogData: "No log data yet, adjust filters.",
    manualRefresh: "Manual Refresh",
    refresh5s: "5s Refresh",
    refresh10s: "10s Refresh",
    refresh15s: "15s Refresh",
    refresh30s: "30s Refresh",
    refresh60s: "60s Refresh",

    // Chart Labels
    inputTokenLabel: "Input Token",
    outputTokenLabel: "Output Token",
    reasoningTokenLabel: "Reasoning Token",
    cachedTokenLabel: "Cache Token",
    totalTokenLabel: "Total Token",
    requestsLabel: "Requests",
    overallSuccessRate: "Overall Success Rate",
    times: "",
    topModels: "Top Models",
    byType: "By Type",

    // Pagination
    firstPage: "First",
    prevPage: "Previous",
    nextPage: "Next",
    lastPage: "Last",

    // Channel Stats Details
    modelSuccessDetail: "Model Success Rate Details",
    modelFailureDetail: "Model Failure Details",
    channelLabel: "Channel",
    modelsCount: "{count} models",
    moreModels: "+{count}",
    successLabel: "Success",
    failureLabel: "Failed",
    disableThisModel: "Disable this model from channel",

    // Auto Refresh
    refreshInSeconds: "Refresh in {seconds}s",
    refreshing: "Refreshing...",

    // Error Messages
    cannotIdentifyChannel: "Cannot identify channel type",
    disableNotSupported: "Disabling {provider} type models is not supported, please use oauth-excluded-models config",
    fetchConfigFailed: "Failed to fetch config: HTTP {status}",
    providerNotFound: "Provider not found: {provider}",
    updateConfigFailed: "Failed to update config: {error}",

    // Side Nav
    navOverview: "Overview",
    navTrend: "Trends",
    navModelRequest: "Model Requests",
    navTokenUsage: "Token Usage",
    navChannelStats: "Channel Stats",
    navRequestLogs: "Request Logs",

    // Modals
    settingsTitle: "Settings",
    settingsDesc: "Enter connection information to access statistics",
    apiUrl: "API URL",
    secretKey: "Admin Secret Key",
    secretKeyPlaceholder: "Enter admin secret key",
    dataSecurityNote: "Data Security: All settings are saved locally in browser, never uploaded to any server",
    cancel: "Cancel",
    saveAndRefresh: "Save & Refresh",
    confirmDisable: "Confirm Disable",
    confirmDisableMessage: "Are you sure you want to disable model \"{model}\"?",
    confirm: "Confirm",
    disable: "Disable",
    disabling: "Processing...",
    disabled: "Disabled",
    disableSuccess: "Disabled {name}",
    disableFailed: "Disable Failed",
    tip: "Tip",
    confirmOk: "OK",
    copySuccess: "Copied",

    // Status Messages
    pleaseConfigureFirst: "Please configure API URL and admin secret key first",
    fetchingData: "Fetching latest data...",
    dataRequestFailed: "Data request failed: {error}",
    lastUpdate: "Last Update: {time}",

    // Refresh Button
    refreshData: "Refresh Data",
    loading: "Loading...",

    // Language Button
    chinese: "中文",
    english: "English",
  }
};

const DATA_I18N_MAP = {
  "nav-overview": "navOverview",
  "nav-trend": "navTrend",
  "nav-model-hourly": "navModelRequest",
  "nav-hourly": "navTokenUsage",
  "nav-stats": "navChannelStats",
  "nav-logs": "navRequestLogs",
  "header-title": "pageTitle",
  "header-subtitle": "pageSubtitle",
  "filter-time-label": "timeRange",
  "time-today": "today",
  "time-7d": "last7Days",
  "time-14d": "last14Days",
  "time-30d": "last30Days",
  "filter-api-label": "apiQuery",
  "filter-apply-btn": "view",
  settings: "settings",
  "kpi-requests-title": "requests",
  "kpi-token-title": "tokens",
  "kpi-tpm-title": "avgTpm",
  "kpi-rpm-title": "avgRpm",
  "kpi-rpd-title": "avgRpd",
  "distribution-title": "modelDistribution",
  "distribution-mode-request": "requestLabel",
  "distribution-mode-token": "tokenLabel",
  "distribution-empty": "waitingForData",
  "trend-title": "dailyTrend",
  "hourly-model-title": "hourlyModelDist",
  "time-12h": "last12Hours",
  "time-24h": "last24Hours",
  "time-all": "all",
  "hourly-model-empty": "noModelData",
  "hourly-load-title": "hourlyTokenUsage",
  "hourly-empty": "noHourlyData",
  "channel-title": "channelStats",
  "time-custom": "custom",
  "date-to": "dateTo",
  "date-apply": "apply",
  "option-all-channel": "allChannels",
  "option-all-model": "allModels",
  "option-all-status": "allStatus",
  "option-only-success": "onlySuccess",
  "option-only-failed": "onlyFailed",
  "channel-header-name": "channel",
  "channel-header-count": "requestCount",
  "channel-header-rate": "successRateColumn",
  "channel-header-recent": "recentRequestStatus",
  "channel-header-time": "lastRequestTime",
  "channel-empty": "noChannelData",
  "failure-title": "failureAnalysis",
  "failure-header-name": "channel",
  "failure-header-count": "failureCount",
  "failure-header-time": "lastFailureTime",
  "failure-header-models": "mainFailureModels",
  "failure-empty": "noFailureData",
  "logs-title": "requestLogs",
  "option-all-api": "allApis",
  "option-all-source": "allSources",
  "option-status-success": "successStatus",
  "option-status-failed": "failedStatus",
  "option-refresh-manual": "manualRefresh",
  "option-refresh-5s": "refresh5s",
  "option-refresh-10s": "refresh10s",
  "option-refresh-15s": "refresh15s",
  "option-refresh-30s": "refresh30s",
  "option-refresh-60s": "refresh60s",
  "log-header-auth": "authIndex",
  "log-header-api": "api",
  "log-header-model": "model",
  "log-header-source": "requestChannel",
  "log-header-status": "status",
  "log-header-latest": "recentRequestStatus",
  "log-header-rate": "successRateColumn",
  "log-header-count": "requestCount",
  "log-header-input": "inputTokens",
  "log-header-output": "outputTokens",
  "log-header-total": "totalTokens",
  "log-header-time": "time",
  "log-header-actions": "actions",
  "log-empty": "waitingForData",
  "disable-modal-title": "confirmDisable",
  "common-cancel": "cancel",
  "disable-modal-confirm": "disable",
  "common-ok": "confirmOk",
  "settings-modal-title": "settingsTitle",
  "settings-modal-desc": "settingsDesc",
  "settings-api-label": "apiUrl",
  "settings-secret-label": "secretKey",
  "settings-tip": "dataSecurityNote",
  "settings-save": "saveAndRefresh",
  "filter-api-placeholder": "apiQueryPlaceholder",
  "settings-api-placeholder": "apiUrlPlaceholder",
  "settings-secret-placeholder": "secretKeyPlaceholder",
  "refresh-btn-title": "refreshData",
  "lang-toggle-title": "switchLang",
  "settings-title": "settings"
};

// ==================== 语言切换函数 ====================
function t(key, params = {}) {
  const lang = state.currentLang || "zh";
  const keys = key.split(".");
  let value = i18n[lang];

  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      break;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // 替换参数占位符
  return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
}

function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(STORAGE_KEY_LANG, lang);
  updateLanguageDisplay();
  applyTranslations();
}

function toggleLanguage() {
  const newLang = state.currentLang === "zh" ? "en" : "zh";
  setLanguage(newLang);
}

function updateLanguageDisplay() {
  const langZh = document.getElementById("lang-zh");
  const langEn = document.getElementById("lang-en");
  if (langZh && langEn) {
    if (state.currentLang === "zh") {
      langZh.classList.add("active");
      langEn.classList.remove("active");
    } else {
      langZh.classList.remove("active");
      langEn.classList.add("active");
    }
  }
  document.documentElement.lang = state.currentLang === "zh" ? "zh-CN" : "en";
}

function applyDataAttributeTranslations() {
  const translateKey = (rawKey) => DATA_I18N_MAP[rawKey] || rawKey;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = translateKey(el.dataset.i18n);
    try {
      el.textContent = t(key);
    } catch (err) {
      console.warn("Missing translation for", key);
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = translateKey(el.dataset.i18nPlaceholder);
    el.setAttribute("placeholder", t(key));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = translateKey(el.dataset.i18nTitle);
    el.setAttribute("title", t(key));
  });
}

function applyTranslations() {
  // 更新页面标题
  document.title = t("pageTitle");

  applyDataAttributeTranslations();
  updateStatsTranslations();
  updateChartsTranslations();
  updateHourRangeCaptions();
  updateTrendCaption();
  updateDistributionCaption();
  updateChannelStatsCaption();
  updateFailureStatsCaption();

  // 更新动态生成的文本
  if (state.usage && state.details.length) {
    renderDashboard();
  }
}

function updateStatsTranslations() {
  // 请求数
  const statRequestTag = document.getElementById("stat-request-tag");
  if (statRequestTag) {
    // 保持动态数据，只更新标签文本格式
  }

  // Tokens
  const tokensElements = document.querySelectorAll(".kpi-title");
  tokensElements.forEach(el => {
    if (el.textContent.includes("Tokens") || el.textContent.includes("Tokens")) {
      el.innerHTML = `<span>${t("tokens")}</span>`;
    } else if (el.textContent.trim() === "请求数" || el.textContent.trim() === "Requests") {
      el.innerHTML = `<span>${t("requests")}</span><span class="tag" id="stat-request-tag">--</span>`;
    } else if (el.textContent.trim() === "平均 TPM" || el.textContent.trim() === "Avg TPM") {
      el.textContent = t("avgTpm");
    } else if (el.textContent.trim() === "平均 RPM" || el.textContent.trim() === "Avg RPM") {
      el.textContent = t("avgRpm");
    } else if (el.textContent.trim() === "日均 RPD" || el.textContent.trim() === "Avg RPD") {
      el.textContent = t("avgRpd");
    }
  });

  // 更新副标题
  const statTokenNote = document.getElementById("stat-token-note");
  if (statTokenNote) statTokenNote.textContent = t("tokenNote");

  const statTpmNote = document.getElementById("stat-tpm-note");
  if (statTpmNote) statTpmNote.textContent = t("tpmNote");

  const statRpmNote = document.getElementById("stat-rpm-note");
  if (statRpmNote) statRpmNote.textContent = t("rpmNote");

  const statRpdNote = document.getElementById("stat-rpd-note");
  if (statRpdNote) statRpdNote.textContent = t("rpdNote");
}

function updateChartsTranslations() {
  // 模型用量分布
  const modelDistH3 = document.querySelector("#nav-distribution h3");
  if (modelDistH3) modelDistH3.textContent = t("modelDistribution");

  const distributionCaption = document.getElementById("distribution-caption");
  if (distributionCaption) distributionCaption.textContent = t("requestDist");

  const distributionCenterLabel = document.getElementById("distribution-center-label");
  if (distributionCenterLabel) {
    distributionCenterLabel.textContent = state.distributionMode === "token" ? t("tokenShare") : t("requestShare");
  }

  // 请求/Token 切换按钮
  document.querySelectorAll(".dist-toggle").forEach(btn => {
    if (btn.dataset.mode === "request") btn.textContent = t("requestShare");
    if (btn.dataset.mode === "token") btn.textContent = t("tokenShare");
  });

  // 每日用量趋势
  const trendH3 = document.querySelector("#nav-trend .chart-card:not(#nav-distribution) h3");
  if (trendH3) trendH3.textContent = t("dailyTrend");

  const trendCaption = document.getElementById("trend-caption");
  if (trendCaption) trendCaption.textContent = t("trendCaption");

  // 每小时模型请求分布
  const hourlyModelH3 = document.querySelector("#nav-model-hourly h3");
  if (hourlyModelH3) hourlyModelH3.textContent = t("hourlyModelDist");

  const hourlyModelCaption = document.getElementById("hourly-model-caption");
  if (hourlyModelCaption) hourlyModelCaption.textContent = t("hourlyModelCaption");

  document.querySelectorAll("#nav-model-hourly .hour-range-btn").forEach(btn => {
    const range = btn.dataset.range;
    if (range === "12") btn.textContent = t("last12Hours");
    else if (range === "24") btn.textContent = t("last24Hours");
    else if (range === "all") btn.textContent = t("all");
  });

  const hourlyModelEmpty = document.getElementById("hourly-model-empty");
  if (hourlyModelEmpty) hourlyModelEmpty.textContent = t("noModelData");

  // 每小时 Token 用量
  const hourlyLoadH3 = document.querySelector("#nav-hourly h3");
  if (hourlyLoadH3) hourlyLoadH3.textContent = t("hourlyTokenUsage");

  const hourlyCaption = document.getElementById("hourly-caption");
  if (hourlyCaption) hourlyCaption.textContent = t("hourlyTokenCaption");

  document.querySelectorAll("#nav-hourly .hour-range-btn").forEach(btn => {
    const range = btn.dataset.range;
    if (range === "12") btn.textContent = t("last12Hours");
    else if (range === "24") btn.textContent = t("last24Hours");
    else if (range === "all") btn.textContent = t("all");
  });

  const hourlyEmpty = document.getElementById("hourly-empty");
  if (hourlyEmpty) hourlyEmpty.textContent = t("noHourlyData");
}

function updateSideNavTranslations() {
  const navItems = document.querySelectorAll(".side-nav-item");
  const translations = ["navOverview", "navTrend", "navModelRequest", "navTokenUsage", "navChannelStats", "navRequestLogs"];

  navItems.forEach((item, index) => {
    const label = item.querySelector(".side-nav-label");
    if (label && translations[index]) {
      label.textContent = t(translations[index]);
    }
  });
}

function updateLogsTranslations() {
  // 请求日志
  const logH3 = document.querySelector("#nav-logs h3");
  if (logH3) logH3.textContent = t("requestLogs");

  const logCaption = document.getElementById("log-caption");
  if (logCaption) logCaption.textContent = t("logCaption");

  // 日志时间按钮
  document.querySelectorAll(".log-time-btn").forEach(btn => {
    const days = btn.dataset.days;
    if (days === "1") btn.textContent = t("today");
    else if (days === "7") btn.textContent = t("last7Days");
    else if (days === "14") btn.textContent = t("last14Days");
    else if (days === "30") btn.textContent = t("last30Days");
    else if (days === "custom") btn.textContent = t("custom");
  });

  // 筛选下拉框选项
  updateSelectOptions("log-filter-api", "allApis");
  updateSelectOptions("log-filter-model", "allModels");
  updateSelectOptions("log-filter-source", "allSources");
  updateSelectOptions("log-filter-status", "allStatus", [
    { value: "", text: "allStatus" },
    { value: "success", text: "successStatus" },
    { value: "failed", text: "failedStatus" }
  ]);

  // 自动刷新选项
  updateSelectOptions("log-auto-refresh", null, [
    { value: "0", text: "manualRefresh" },
    { value: "5", text: "refresh5s" },
    { value: "10", text: "refresh10s" },
    { value: "15", text: "refresh15s" },
    { value: "30", text: "refresh30s" },
    { value: "60", text: "refresh60s" }
  ]);

  // 表头
  updateLogTableHeaders();

  // 渠道统计
  updateChannelStatsTranslations();

  // 失败来源分析
  updateFailureAnalysisTranslations();
}

function updateSelectOptions(selectId, defaultKey, customOptions) {
  const select = document.getElementById(selectId);
  if (!select) return;

  if (customOptions) {
    select.querySelectorAll("option").forEach((opt, index) => {
      if (customOptions[index]) {
        opt.textContent = t(customOptions[index].text);
      }
    });
  } else if (defaultKey) {
    const firstOption = select.querySelector("option");
    if (firstOption && firstOption.value === "") {
      firstOption.textContent = t(defaultKey);
    }
  }
}

function updateLogTableHeaders() {
  const headers = {
    "认证索引": "authIndex",
    "Auth Index": "authIndex",
    "API": "api",
    "模型": "model",
    "Model": "model",
    "请求渠道": "requestChannel",
    "Request Channel": "requestChannel",
    "状态": "status",
    "Status": "status",
    "最近请求状态": "recentRequestStatus",
    "Recent Status": "recentRequestStatus",
    "成功率": "successRateColumn",
    "Success Rate": "successRateColumn",
    "请求数": "requestCount",
    "Requests": "requestCount",
    "输入": "inputTokens",
    "Input": "inputTokens",
    "输出": "outputTokens",
    "Output": "outputTokens",
    "总 Token": "totalTokens",
    "Total Tokens": "totalTokens",
    "时间": "time",
    "Time": "time",
    "操作": "actions",
    "Actions": "actions"
  };

  document.querySelectorAll(".log-table th").forEach(th => {
    const key = headers[th.textContent.trim()];
    if (key) {
      th.textContent = t(key);
    }
  });
}

function updateChannelStatsTranslations() {
  const channelH3 = document.querySelector("#nav-stats .chart-card:first-child h3");
  if (channelH3) channelH3.textContent = t("channelStats");

  const channelCaption = document.getElementById("channel-stats-caption");
  if (channelCaption) channelCaption.innerHTML = t("channelStatsCaption");

  // 时间按钮
  document.querySelectorAll(".channel-time-btn").forEach(btn => {
    const days = btn.dataset.days;
    if (days === "1") btn.textContent = t("today");
    else if (days === "7") btn.textContent = t("last7Days");
    else if (days === "14") btn.textContent = t("last14Days");
    else if (days === "30") btn.textContent = t("last30Days");
    else if (days === "custom") btn.textContent = t("custom");
  });

  // 应用按钮
  const channelDateApply = document.getElementById("channel-date-apply");
  if (channelDateApply) channelDateApply.textContent = t("apply");

  // 筛选下拉框
  updateSelectOptions("channel-filter-channel", "allChannels");
  updateSelectOptions("channel-filter-model", "allModels");
  updateSelectOptions("channel-filter-status", "allStatus", [
    { value: "", text: "allStatus" },
    { value: "success", text: "onlySuccess" },
    { value: "failed", text: "onlyFailed" }
  ]);

  // 表头
  const providerHeaders = document.querySelectorAll("#api-status-list .provider-status-header span");
  if (providerHeaders.length >= 4) {
    providerHeaders[0].textContent = t("channel");
    providerHeaders[1].textContent = t("requestCount");
    providerHeaders[2].textContent = t("successRateColumn");
    providerHeaders[3].textContent = t("recentRequestStatus");
  }

  const emptyState = document.querySelector("#api-status-list .empty-state");
  if (emptyState) emptyState.textContent = t("noChannelData");
}

function updateFailureAnalysisTranslations() {
  const failureH3 = document.querySelector("#nav-stats .chart-card:last-child h3");
  if (failureH3) failureH3.textContent = t("failureAnalysis");

  const failureCaption = document.getElementById("failure-stats-caption");
  if (failureCaption) failureCaption.innerHTML = t("failureAnalysisCaption");

  // 时间按钮
  document.querySelectorAll(".failure-time-btn").forEach(btn => {
    const days = btn.dataset.days;
    if (days === "1") btn.textContent = t("today");
    else if (days === "7") btn.textContent = t("last7Days");
    else if (days === "14") btn.textContent = t("last14Days");
    else if (days === "30") btn.textContent = t("last30Days");
    else if (days === "custom") btn.textContent = t("custom");
  });

  // 应用按钮
  const failureDateApply = document.getElementById("failure-date-apply");
  if (failureDateApply) failureDateApply.textContent = t("apply");

  // 筛选下拉框
  updateSelectOptions("failure-filter-channel", "allChannels");
  updateSelectOptions("failure-filter-model", "allModels");

  // 表头
  const failureHeaders = document.querySelectorAll("#failure-source-list .provider-status-header span");
  if (failureHeaders.length >= 4) {
    failureHeaders[0].textContent = t("channel");
    failureHeaders[1].textContent = t("failureCount");
    failureHeaders[2].textContent = t("lastFailureTime");
    failureHeaders[3].textContent = t("mainFailureModels");
  }

  const emptyState = document.querySelector("#failure-source-list .empty-state");
  if (emptyState) emptyState.textContent = t("noFailureData");
}

function updateModalTranslations() {
  // 设置模态框
  const settingsTitle = document.querySelector("#settings-modal h3");
  if (settingsTitle) settingsTitle.textContent = t("settingsTitle");

  const settingsDesc = document.querySelector("#settings-modal .modal-body p");
  if (settingsDesc) settingsDesc.textContent = t("settingsDesc");

  const apiUrlLabel = document.querySelector('label[for="api-url"]');
  if (apiUrlLabel) apiUrlLabel.textContent = t("apiUrl");

  const secretKeyLabel = document.querySelector('label[for="secret-key"]');
  if (secretKeyLabel) secretKeyLabel.textContent = t("secretKey");

  const secretKeyInput = document.getElementById("secret-key");
  if (secretKeyInput) secretKeyInput.placeholder = t("secretKeyPlaceholder");

  const dataSecurityNote = document.querySelector("#settings-modal .modal-body p[style*=\"color: var(--dim)\"]");
  if (dataSecurityNote) {
    dataSecurityNote.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>${t("dataSecurityNote")}`;
  }

  const settingsCancel = document.getElementById("settings-cancel");
  if (settingsCancel) settingsCancel.textContent = t("cancel");

  const settingsSave = document.getElementById("settings-save");
  if (settingsSave) settingsSave.textContent = t("saveAndRefresh");

  // 确认禁用模态框
  const confirmDisableTitle = document.querySelector("#disable-confirm-modal h3");
  if (confirmDisableTitle) confirmDisableTitle.textContent = t("confirmDisable");

  const confirmDisableCancel = document.getElementById("disable-confirm-cancel");
  if (confirmDisableCancel) confirmDisableCancel.textContent = t("cancel");

  const confirmDisableOk = document.getElementById("disable-confirm-ok");
  if (confirmDisableOk) confirmDisableOk.textContent = t("confirm") + " " + t("disable");

  // 消息提示模态框
  const messageTitle = document.querySelector("#message-modal h3");
  if (messageTitle) messageTitle.textContent = t("tip");

  const messageOk = document.getElementById("message-modal-ok");
  if (messageOk) messageOk.textContent = t("confirmOk");
}

// 初始化函数
function initApp() {
  const apiInput = document.getElementById("api-url");
  const keyInput = document.getElementById("secret-key");
  if (apiInput) apiInput.value = DEFAULT_API_URL;
  if (keyInput) keyInput.value = DEFAULT_SECRET_KEY;

  // 首次访问（无保存配置）时自动弹出设置框
  if (!DEFAULT_API_URL || !DEFAULT_SECRET_KEY) {
    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal) {
      settingsModal.classList.add("active");
      showStatus(t("pleaseConfigureFirst"), "info");
      // API 地址为空时设置默认提示
      if (!DEFAULT_API_URL && apiInput) {
        apiInput.placeholder = t("apiUrlPlaceholder");
      }
    }
  }

  document.querySelectorAll(".main-time-btn[data-days]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".time-btn[data-days]")
        .forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      state.timeframeDays = Number(btn.dataset.days);
      updateTrendCaption();
      updateDistributionCaption();
      updateTokenNote();
      document.getElementById("stat-request-meta").textContent =
        `${t("lastXDays", { days: state.timeframeDays })} · ${t("successRate")} --`;
      document.getElementById("stat-rpd-note").textContent =
        `${t("lastXDays", { days: state.timeframeDays })} · ${t("requestsPerDay")}`;
      renderDashboard();
    });
  });

  document.querySelectorAll(".dist-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".dist-toggle")
        .forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      state.distributionMode = btn.dataset.mode || "token";
      updateDistributionCaption();
      document.getElementById("distribution-center-label").textContent =
        state.distributionMode === "token" ? t("tokenShare") : t("requestShare");
      updateDistribution(state.currentDetails);
    });
  });

  document.querySelectorAll(".hour-range-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target || "load";
      const range = btn.dataset.range || "all";
      if (target === "model") {
        state.modelHourRange = range;
      } else {
        state.loadHourRange = range;
      }
      syncHourRangeButtons();
      updateHourRangeCaptions();
      renderDashboard();
    });
  });

  const filterBtn = document.getElementById("apply-filter");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      state.keyFilter =
        (document.getElementById("key-filter").value || "").trim();
      renderDashboard();
    });
  }

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchUsage);

  const fixedRefreshBtn = document.getElementById("fixed-refresh-btn");
  if (fixedRefreshBtn) fixedRefreshBtn.addEventListener("click", fetchUsage);

  // 语言切换按钮事件监听
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", toggleLanguage);
  }

  // 初始化语言显示
  updateLanguageDisplay();
  applyTranslations();

  syncHourRangeButtons();
  updateHourRangeCaptions();
  updateTrendCaption();
  updateDistributionCaption();
  updateTokenNote();
  fetchUsage();

  document.addEventListener("click", async (event) => {
    // 处理禁用模型按钮点击
    const disableBtn = event.target.closest(".disable-model-btn");
    if (disableBtn && !disableBtn.id) {  // 排除模态框内的按钮
      const source = disableBtn.dataset.source;
      const model = disableBtn.dataset.model;
      if (!source || !model) return;

      const providerName = resolveProvider(source);
      const displayName = formatProviderModelLabel(providerName, model);

      // 显示自定义确认模态框
      const confirmed = await showDisableConfirm(displayName);
      if (!confirmed) return;

      disableBtn.disabled = true;
      disableBtn.textContent = t("disabling");

      try {
        const result = await disableModelFromProvider(source, model);
        if (result?.alreadyDisabled) {
          disableBtn.textContent = t("disabled");
          disableBtn.style.borderColor = "var(--dim)";
          disableBtn.style.color = "var(--dim)";
          disableBtn.disabled = true;
        } else {
          disableBtn.textContent = t("disabled");
          disableBtn.style.borderColor = "var(--accent-green)";
          disableBtn.style.color = "var(--accent-green)";
          showStatus(t("disableSuccess", { name: displayName }), "info");
        }
      } catch (err) {
        console.error("禁用模型失败：", err);
        disableBtn.disabled = false;
        disableBtn.textContent = t("disable");
        showMessageModal(t("disableFailed"), err.message, "error");
      }
      return;
    }

    // 处理 copy-auth 点击复制
    const authTarget = event.target.closest(".copy-auth");
    if (authTarget) {
      const auth = authTarget.dataset.auth;
      if (!auth || auth === "-" || auth === "unknown") return;
      try {
        await navigator.clipboard.writeText(auth);
        const label = authTarget.dataset.label || maskSecret(auth);
        authTarget.textContent = t("copySuccess");
        authTarget.classList.add("copied");
        setTimeout(() => {
          authTarget.textContent = label;
          authTarget.classList.remove("copied");
        }, 1000);
      } catch (err) {
        console.error("clipboard copy failed", err);
      }
      return;
    }

    // 处理 copy-model 点击复制
    const modelTarget = event.target.closest(".copy-model");
    if (modelTarget) {
      const model = modelTarget.dataset.model;
      if (!model) return;
      try {
        await navigator.clipboard.writeText(model);
        const originalHtml = modelTarget.innerHTML;
        modelTarget.textContent = t("copySuccess");
        modelTarget.classList.add("copied");
        setTimeout(() => {
          modelTarget.innerHTML = originalHtml;
          modelTarget.classList.remove("copied");
        }, 1000);
      } catch (err) {
        console.error("clipboard copy failed", err);
      }
      return;
    }

    // 处理渠道统计和失败来源分析行的展开/收起（各列表独立，互不影响）
    const expandableRow = event.target.closest(".provider-status-row.expandable");
    if (expandableRow) {
      // 排除点击复制按钮的情况
      if (event.target.closest(".copy-auth") || event.target.closest(".copy-model")) return;
      const rowId = expandableRow.dataset.rowId;
      const detailEl = document.getElementById(`${rowId}-detail`);
      if (detailEl) {
        const isCurrentlyExpanded = expandableRow.classList.contains("expanded");
        // 找到当前行所在的列表容器，只收起同一列表内的其他行
        const parentList = expandableRow.closest(".provider-status-list");
        if (parentList) {
          parentList.querySelectorAll(".provider-status-row.expanded").forEach(row => {
            row.classList.remove("expanded");
            const detail = document.getElementById(`${row.dataset.rowId}-detail`);
            if (detail) detail.classList.remove("expanded");
          });
        }
        // 如果当前行之前未展开，则展开它
        if (!isCurrentlyExpanded) {
          expandableRow.classList.add("expanded");
          detailEl.classList.add("expanded");
        }
      }
    }
  });

  // 日志筛选器事件监听（同时更新 URL 参数）
  ["log-filter-api", "log-filter-model", "log-filter-source", "log-filter-status"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", updateLogFilterAndUrl);
    }
  });

  syncHourRangeButtons();
  updateHourRangeCaptions();
  fetchUsage();

  // 初始化侧边导航
  initSideNav();

  // 设置模态框交互
  initSettingsModal();

  // 初始化渠道统计和失败来源分析的时间选择器
  initStatsTimeButtons();

  // 初始化日志时间选择器
  initLogTimeButtons();

  // 初始化日志自动刷新
  initLogAutoRefresh();

  // 初始化 URL 参数书签功能
  initUrlBookmark();
}

// 支持动态加载：如果 DOM 已加载完成则直接执行，否则等待 DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

async function fetchUsage() {
  const refreshBtn = document.getElementById("refresh-btn");
  const fixedRefreshBtn = document.getElementById("fixed-refresh-btn");
  const label = refreshBtn?.querySelector("span");
  const apiUrl = (document.getElementById("api-url").value || DEFAULT_API_URL)
    .replace(/\/$/, "");
  const secretKey =
    document.getElementById("secret-key").value || DEFAULT_SECRET_KEY;

  let success = false;
  if (refreshBtn) refreshBtn.disabled = true;
  if (fixedRefreshBtn) fixedRefreshBtn.classList.add("loading");
  if (label) label.textContent = t("loading");
  showStatus(t("fetchingData"), "info");
  try {
    const response = await fetch(`${apiUrl}/v0/management/usage`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    await ensureCompatibility(apiUrl, secretKey);
    state.usage = payload.usage || null;
    state.details = normalizeDetails(state.usage);
    updateTimestamp();
    renderDashboard();
    showStatus(null); // 成功后隐藏提示
    success = true;
  } catch (err) {
    console.error(err);
    showStatus(t("dataRequestFailed", { error: err.message }), "error");
    state.usage = null;
    state.details = [];
    renderDashboard();
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
    if (fixedRefreshBtn) {
      fixedRefreshBtn.classList.remove("loading");
      fixedRefreshBtn.classList.add(success ? "success" : "error");
      setTimeout(() => fixedRefreshBtn.classList.remove("success", "error"), 1500);
    }
    if (label) label.textContent = t("refreshData");
  }
}

// 只刷新请求日志（轻量级刷新，不更新整个页面）
async function fetchUsageForLog() {
  const apiUrl = (document.getElementById("api-url").value || DEFAULT_API_URL)
    .replace(/\/$/, "");
  const secretKey =
    document.getElementById("secret-key").value || DEFAULT_SECRET_KEY;

  try {
    const response = await fetch(`${apiUrl}/v0/management/usage`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    await ensureCompatibility(apiUrl, secretKey);
    state.usage = payload.usage || null;
    state.details = normalizeDetails(state.usage);
    // 只更新日志表格
    const filtered = getFilteredDetails();
    state.currentDetails = filtered;
    updateLogTable(filtered);
    return true;
  } catch (err) {
    console.error("日志刷新失败：", err);
    return false;
  }
}

function renderDashboard() {
  if (!state.usage || !state.details.length) {
    resetStats();
    state.currentDetails = [];
    updateTrendChart([]);
    updateDistribution([]);
    updateHourlyChart([]);
    updateModelHourlyChart([]);
    updateApiStatusChart([]);
    updateApiRanking([]);
    updateFailureSources([]);
    updateLogTable([]);
    return;
  }
  const filtered = getFilteredDetails();
  state.currentDetails = filtered;
  updateStats(filtered);
  updateTrendChart(filtered);
  updateDistribution(filtered);
  updateHourlyChart(filtered);
  updateModelHourlyChart(filtered);
  // 渠道统计：支持自定义日期范围
  const channelData = state.channelCustomRange
    ? filterDetailsByCustomRange(state.details, state.channelCustomRange)
    : filterDetailsByDays(state.details, state.channelStatsDays);
  updateApiStatusChart(channelData);
  updateApiRanking(filtered);
  // 失败来源分析：支持自定义日期范围
  const failureData = state.failureCustomRange
    ? filterDetailsByCustomRange(state.details, state.failureCustomRange)
    : filterDetailsByDays(state.details, state.failureStatsDays);
  updateFailureSources(failureData);
  updateLogTable(filtered);
}

function normalizeDetails(usage) {
  const normalized = [];
  if (!usage || !usage.apis) return normalized;
  for (const [apiName, apiData] of Object.entries(usage.apis)) {
    const models = apiData.models || {};
    for (const [modelName, modelData] of Object.entries(models)) {
      (modelData.details || []).forEach((detail) => {
        const timestamp = detail.timestamp ? new Date(detail.timestamp) : null;
        const tokens = detail.tokens || {};
        const input = tokens.input_tokens || 0;
        const output = tokens.output_tokens || 0;
        const reasoning = tokens.reasoning_tokens || 0;
        const cached = tokens.cached_tokens || 0;
        const total = tokens.total_tokens || input + output + reasoning + cached;
        normalized.push({
          api: apiName,
          model: modelName,
          failed: Boolean(detail.failed),
          timestamp,
          dateKey: timestamp ? formatDateKey(timestamp) : null,
          source: detail.source || "unknown",
          authIndex: detail.auth_index || "-",
          tokens: { input, output, reasoning, cached, total },
        });
      });
    }
  }
  return normalized;
}

function getFilteredDetails() {
  if (!state.details.length) return [];
  const keyFilter = state.keyFilter.toLowerCase();
  const rangeStart = getRangeStart(state.timeframeDays);
  return state.details.filter((item) => {
    if (keyFilter && !item.api.toLowerCase().includes(keyFilter)) return false;
    if (item.timestamp && item.timestamp < rangeStart) return false;
    return true;
  });
}

function updateStats(details) {
  const totalRequests = details.length;
  const successCount = details.filter((item) => !item.failed).length;
  const tokens = details.reduce(
    (acc, item) => {
      acc.input += item.tokens.input;
      acc.output += item.tokens.output;
      acc.reasoning += item.tokens.reasoning;
      acc.cached += item.tokens.cached;
      acc.total += item.tokens.total;
      return acc;
    },
    { input: 0, output: 0, reasoning: 0, cached: 0, total: 0 }
  );
  const successRate = totalRequests
    ? ((successCount / totalRequests) * 100).toFixed(1)
    : "0.0";
  const minutes = state.timeframeDays * 24 * 60;
  const tpm = minutes ? tokens.total / minutes : 0;
  const rpm = minutes ? totalRequests / minutes : 0;
  const rpd = state.timeframeDays ? totalRequests / state.timeframeDays : 0;
  const estimatedCost = (tokens.total / 1000) * PRICE_PER_K_TOKEN;

  document.getElementById("stat-requests").textContent =
    formatNumber(totalRequests);
  document.getElementById(
    "stat-request-tag"
  ).textContent = t("success", { count: formatNumber(successCount) }) + " · " + t("failed", { count: formatNumber(Math.max(totalRequests - successCount, 0)) });
  const requestMeta = document.getElementById("stat-request-meta");
  if (requestMeta) {
    requestMeta.textContent = t("lastXDays", { days: state.timeframeDays }) + " · " + t("successRate") + " ${successRate}%".replace("${successRate}", successRate);
  }
  document.getElementById("stat-total-tokens").textContent = formatNumber(
    tokens.total
  );
  setTokenBreakdownText("stat-token-input", t("inputTokens"), tokens.input);
  setTokenBreakdownText("stat-token-output", t("outputTokens"), tokens.output);
  setTokenBreakdownText(
    "stat-token-reasoning",
    t("reasoningTokensLabel"),
    tokens.reasoning
  );
  setTokenBreakdownText(
    "stat-token-cache",
    t("cacheTokensLabel"),
    tokens.cached
  );
  const costValueEl = document.getElementById("stat-est-cost");
  if (costValueEl) {
    costValueEl.textContent = `$${estimatedCost.toFixed(2)}`;
  }
  const costNoteEl = document.getElementById("stat-cost-note");
  if (costNoteEl) {
    const basedOnText = state.currentLang === "zh" ? "基于" : "Based on";
    costNoteEl.textContent = `${basedOnText} ${formatNumber(tokens.total)} tokens`;
  }
  document.getElementById("stat-tpm").textContent = tpm.toFixed(2);
  document.getElementById("stat-rpm").textContent = rpm.toFixed(4);
  document.getElementById("stat-rpd").textContent = rpd.toFixed(2);
  document.getElementById("stat-tpm-note").textContent =
    `${t("lastXDays", { days: state.timeframeDays })} · ${t("tokensPerMinute")}`;
  document.getElementById("stat-rpm-note").textContent =
    `${t("lastXDays", { days: state.timeframeDays })} · ${t("requestsPerMinute")}`;
}

function resetStats() {
  document.getElementById("stat-requests").textContent = "--";
  document.getElementById("stat-request-tag").textContent = "--";
  const requestMeta = document.getElementById("stat-request-meta");
  if (requestMeta) {
    const daysText = state.currentLang === "zh" ? "最近 -- 天" : "Last -- Days";
    requestMeta.textContent = `${daysText} · ${t("successRate")} --`;
  }
  document.getElementById("stat-total-tokens").textContent = "--";
  const inputLabel = t("inputTokens");
  const outputLabel = t("outputTokens");
  const reasoningLabel = t("reasoningTokensLabel");
  const cacheLabel = t("cacheTokensLabel");
  setTokenBreakdownText("stat-token-input", inputLabel, null);
  setTokenBreakdownText("stat-token-output", outputLabel, null);
  setTokenBreakdownText("stat-token-reasoning", reasoningLabel, null);
  setTokenBreakdownText("stat-token-cache", cacheLabel, null);
  const costValueEl = document.getElementById("stat-est-cost");
  if (costValueEl) costValueEl.textContent = "$0.00";
  const costNoteEl = document.getElementById("stat-cost-note");
  if (costNoteEl) costNoteEl.textContent = state.currentLang === "zh" ? "等待数据" : "Waiting for data";
  document.getElementById("stat-tpm").textContent = "--";
  document.getElementById("stat-rpm").textContent = "--";
  document.getElementById("stat-rpd").textContent = "--";
}

function updateTrendChart(details) {
  const ctx = document.getElementById("trend-chart").getContext("2d");
  const series = buildDailySeries(details);

  // 计算每种 token 类型的总量，用于动态分配颜色
  const tokenTypes = [
    { type: "input", label: t("inputTokenLabel"), data: series.inputTokens },
    { type: "output", label: t("outputTokenLabel"), data: series.outputTokens },
    { type: "reasoning", label: t("reasoningTokenLabel"), data: series.reasoningTokens },
    { type: "cached", label: t("cachedTokenLabel"), data: series.cachedTokens },
  ];

  // 计算每种类型的总量并排序
  tokenTypes.forEach(t => {
    t.total = t.data.reduce((sum, val) => sum + val, 0);
  });
  tokenTypes.sort((a, b) => b.total - a.total);

  // 分配颜色：占比最多用 #60a5fa，第二用 #f472b6，其他使用调色板颜色（避免重复和相近）
  const otherColors = ["#22c55e", "#facc15", "#c084fc"]; // 绿、黄、紫
  const colorMap = {};
  tokenTypes.forEach((t, index) => {
    if (index === 0) {
      colorMap[t.type] = "#60a5fa";
    } else if (index === 1) {
      colorMap[t.type] = "#f472b6";
    } else {
      colorMap[t.type] = otherColors[index - 2] || MODEL_COLOR_PALETTE[(index - 2) % MODEL_COLOR_PALETTE.length];
    }
  });

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: series.labels,
      datasets: [
        {
          label: t("inputTokenLabel"),
          type: "bar",
          data: series.inputTokens.map((value) => value / TOKEN_TREND_SCALE),
          backgroundColor: colorMap.input || "#22c55e",
          borderColor: colorMap.input || "#22c55e",
          borderWidth: 1,
          borderRadius: 0,
          stack: "tokenStack",
          order: 1,
          yAxisID: "y1",
          trendScale: TOKEN_TREND_SCALE,
          tokenType: "input",
        },
        {
          label: t("outputTokenLabel"),
          type: "bar",
          data: series.outputTokens.map((value) => value / TOKEN_TREND_SCALE),
          backgroundColor: colorMap.output || "#facc15",
          borderColor: colorMap.output || "#facc15",
          borderWidth: 1,
          borderRadius: 0,
          stack: "tokenStack",
          order: 1,
          yAxisID: "y1",
          trendScale: TOKEN_TREND_SCALE,
          tokenType: "output",
        },
        {
          label: t("reasoningTokenLabel"),
          type: "bar",
          data: series.reasoningTokens.map((value) => value / TOKEN_TREND_SCALE),
          backgroundColor: colorMap.reasoning || "#c084fc",
          borderColor: colorMap.reasoning || "#c084fc",
          borderWidth: 1,
          borderRadius: 0,
          stack: "tokenStack",
          order: 1,
          yAxisID: "y1",
          trendScale: TOKEN_TREND_SCALE,
          tokenType: "reasoning",
        },
        {
          label: t("cachedTokenLabel"),
          type: "bar",
          data: series.cachedTokens.map((value) => value / TOKEN_TREND_SCALE),
          backgroundColor: colorMap.cached || "#f97316",
          borderColor: colorMap.cached || "#f97316",
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
          stack: "tokenStack",
          order: 1,
          yAxisID: "y1",
          trendScale: TOKEN_TREND_SCALE,
          tokenType: "cached",
        },
        {
          label: t("requestsLabel"),
          type: "line",
          data: series.requests,
          borderColor: "#4ef0c3",
          backgroundColor: "#4ef0c3",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 3,
          pointBackgroundColor: "#4ef0c3",
          trendScale: 1,
          yAxisID: "y",
          order: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(255,255,255,0.8)",
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: function(chart) {
              return chart.data.datasets.map((dataset, i) => {
                const color = dataset.type === "line"
                  ? dataset.borderColor
                  : dataset.backgroundColor;
                const isLine = dataset.type === "line";
                return {
                  text: dataset.label,
                  fillStyle: color,
                  strokeStyle: color,
                  fontColor: "rgba(255,255,255,0.8)",
                  lineWidth: 0,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                  pointStyle: isLine ? "circle" : "rect",
                };
              });
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          position: "smartPosition",
          yAlign: "center",
          callbacks: {
            beforeBody(context) {
              // 动态设置 xAlign：根据数据点位置决定左右
              if (context.length > 0) {
                const chart = context[0].chart;
                const chartArea = chart.chartArea;
                const midPoint = (chartArea.left + chartArea.right) / 2;
                const x = context[0].element.x;
                // 在图表左半部分时，tooltip 显示在右边；右半部分时显示在左边
                this.options.xAlign = x < midPoint ? "left" : "right";
              }
              return [];
            },
            label(context) {
              const dataset = context.dataset || {};
              const scale = dataset.trendScale || 1;
              const actualValue = (context.raw || 0) * scale;
              const label = dataset.label || "";
              if (dataset.tokenType) {
                return `${label.replace("（千）", "")}：${formatNumber(Math.round(actualValue))}`;
              }
              return `${label}：${formatNumber(actualValue)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "rgba(255,255,255,0.6)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          position: "left",
          ticks: { color: "rgba(78, 240, 195, 0.9)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y1: {
          position: "right",
          stacked: true,
          ticks: {
            color: "rgba(255,255,255,0.6)",
            callback: (value) => `${value}k`,
          },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

function buildDailySeries(details) {
  const labels = [];
  const requests = [];
  const inputTokens = [];
  const outputTokens = [];
  const reasoningTokens = [];
  const cachedTokens = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const requestMap = new Map();
  const inputMap = new Map();
  const outputMap = new Map();
  const reasoningMap = new Map();
  const cachedMap = new Map();
  details.forEach((item) => {
    if (!item.dateKey) return;
    requestMap.set(item.dateKey, (requestMap.get(item.dateKey) || 0) + 1);
    inputMap.set(item.dateKey, (inputMap.get(item.dateKey) || 0) + item.tokens.input);
    outputMap.set(item.dateKey, (outputMap.get(item.dateKey) || 0) + item.tokens.output);
    reasoningMap.set(item.dateKey, (reasoningMap.get(item.dateKey) || 0) + item.tokens.reasoning);
    cachedMap.set(item.dateKey, (cachedMap.get(item.dateKey) || 0) + item.tokens.cached);
  });
  for (let i = state.timeframeDays - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = formatDateKey(day);
    labels.push(
      `${String(day.getMonth() + 1).padStart(2, "0")}-${String(
        day.getDate()
      ).padStart(2, "0")}`
    );
    requests.push(requestMap.get(key) || 0);
    inputTokens.push(inputMap.get(key) || 0);
    outputTokens.push(outputMap.get(key) || 0);
    reasoningTokens.push(reasoningMap.get(key) || 0);
    cachedTokens.push(cachedMap.get(key) || 0);
  }
  return { labels, requests, inputTokens, outputTokens, reasoningTokens, cachedTokens };
}

function updateDistribution(details) {
  const ctx = document.getElementById("distribution-chart").getContext("2d");
  const totals = {};
  details.forEach((item) => {
    const model = item.model || "unknown";
    totals[model] ||= { tokens: 0, requests: 0 };
    totals[model].tokens += item.tokens.total;
    totals[model].requests += 1;
  });
  const entries = Object.entries(totals);
  entries.sort((a, b) => {
    const metricA =
      state.distributionMode === "token" ? a[1].tokens : a[1].requests;
    const metricB =
      state.distributionMode === "token" ? b[1].tokens : b[1].requests;
    return metricB - metricA;
  });
  // 使用新的颜色方案：前两个用 #60a5fa 和 #f472b6，其他用调色板颜色
  const palette = [
    "#60a5fa",  // 蓝色 - 占比最多
    "#f472b6",  // 粉色 - 占比第二
    ...MODEL_COLOR_PALETTE,  // 黄色、绿色、橙色、青色、紫色、红色、青绿色
  ];
  const top = entries.slice(0, 10);
  const values = top.map(([, value]) =>
    state.distributionMode === "token" ? value.tokens : value.requests
  );
  const totalValue = values.reduce((acc, cur) => acc + cur, 0);
  const labels = top.map(([name]) => name);

  if (distributionChart) distributionChart.destroy();
  distributionChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: palette,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: { legend: { display: false } },
    },
  });

  const list = document.getElementById("distribution-list");
  if (!top.length) {
    list.innerHTML = `<div class="empty-state">${t("noDistributionData")}</div>`;
    return;
  }
  list.innerHTML = top
    .map(([name, value], index) => {
      const metric =
        state.distributionMode === "token" ? value.tokens : value.requests;
      const percent = totalValue ? ((metric / totalValue) * 100).toFixed(1) : "0.0";
      const unit = state.distributionMode === "token" ? "tokens" : t("times");
      return `
        <div class="legend-item">
          <span class="legend-label">
            <span class="chart-dot" style="background:${palette[index % palette.length]};"></span>
            <span class="legend-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
          </span>
          <strong>${percent}% · ${formatNumber(metric)} ${unit}</strong>
        </div>
      `;
    })
    .join("");
}

function updateHourlyChart(details) {
  const canvas = document.getElementById("hourly-chart");
  const empty = document.getElementById("hourly-empty");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const series = buildHourlySeries(details, state.loadHourRange);
  if (!series.labels.length) {
    if (hourlyChart) {
      hourlyChart.destroy();
      hourlyChart = null;
    }
    if (empty) empty.style.display = "flex";
    return;
  }
  if (empty) empty.style.display = "none";
  if (hourlyChart) hourlyChart.destroy();

  // 总Token柱状图
  const totalBarDataset = {
    label: t("totalTokenLabel"),
    type: "bar",
    data: series.total.map((value) => value / TOKEN_SCALE),
    backgroundColor: "#60a5fa",
    borderColor: "#60a5fa",
    hoverBackgroundColor: "#60a5fa",
    hoverBorderColor: "#60a5fa",
    borderWidth: 1,
    borderRadius: 4,
    tokenScale: TOKEN_SCALE,
    yAxisID: "y",
    order: 2,
  };

  const tokenLines = [
    { label: t("inputTokenLabel"), color: "#4ef0c3", data: series.input },
    { label: t("outputTokenLabel"), color: "#f97316", data: series.output },
    { label: t("reasoningTokenLabel"), color: "#facc15", data: series.reasoning },
    { label: t("cachedTokenLabel"), color: "#c084fc", data: series.cached },
  ].map((item) => ({
    label: item.label,
    type: "line",
    data: item.data.map((value) => value / TOKEN_SCALE),
    borderColor: item.color,
    backgroundColor: item.color,
    fill: false,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: item.color,
    tokenScale: TOKEN_SCALE,
    yAxisID: "y",
    order: 1,
  }));

  hourlyChart = new Chart(ctx, {
    data: {
      labels: series.labels,
      datasets: [totalBarDataset, ...tokenLines],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(255,255,255,0.8)",
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: function(chart) {
              return chart.data.datasets.map((dataset, i) => {
                const color = dataset.type === "line"
                  ? dataset.borderColor
                  : dataset.backgroundColor;
                const isLine = dataset.type === "line";
                return {
                  text: dataset.label,
                  fillStyle: color,
                  strokeStyle: color,
                  fontColor: "rgba(255,255,255,0.8)",
                  lineWidth: 0,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                  pointStyle: isLine ? "circle" : "rect",
                };
              });
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const original =
                (context.raw || 0) * (context.dataset.tokenScale || 1);
              return `${context.dataset.label}：${formatNumber(
                Math.round(original)
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.7)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          position: "left",
          ticks: {
            color: "rgba(255,255,255,0.7)",
            callback: (value) => `${value}k`,
          },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
    },
  });
}

function updateModelHourlyChart(details) {
  const canvas = document.getElementById("hourly-model-chart");
  const empty = document.getElementById("hourly-model-empty");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const series = buildHourlyModelChartData(details, state.modelHourRange);
  if (!series.labels.length || !series.datasets.length) {
    if (hourlyModelChart) {
      hourlyModelChart.destroy();
      hourlyModelChart = null;
    }
    if (empty) empty.style.display = "flex";
    return;
  }
  if (empty) empty.style.display = "none";
  if (hourlyModelChart) hourlyModelChart.destroy();

  // 计算每个模型的总请求数，用于动态分配颜色
  const modelsWithTotal = series.datasets.map((dataset) => ({
    ...dataset,
    total: dataset.data.reduce((sum, val) => sum + val, 0),
  }));
  // 按总请求数降序排序
  modelsWithTotal.sort((a, b) => b.total - a.total);

  // 创建颜色映射：占比最多用 #60a5fa，第二用 #f472b6，其他用调色板颜色
  const colorMap = {};
  modelsWithTotal.forEach((model, index) => {
    if (index === 0) {
      colorMap[model.label] = "#60a5fa";
    } else if (index === 1) {
      colorMap[model.label] = "#f472b6";
    } else {
      // 使用调色板颜色（从索引2开始）
      colorMap[model.label] = MODEL_COLOR_PALETTE[(index - 2) % MODEL_COLOR_PALETTE.length];
    }
  });

  const barDatasets = series.datasets.map((dataset, index) => {
    const color = colorMap[dataset.label] || MODEL_COLOR_PALETTE[index % MODEL_COLOR_PALETTE.length];
    return {
      label: dataset.label,
      data: dataset.data,
      type: "bar",
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      stack: "modelStack",
      borderRadius: 4,
      order: 1,
      yAxisID: "y",
    };
  });
  const successLine = {
    label: t("overallSuccessRate"),
    type: "line",
    data: series.successRates,
    borderColor: "#4ef0c3",
    backgroundColor: "#4ef0c3",
    borderWidth: 2.5,
    pointRadius: 3,
    pointBackgroundColor: "#4ef0c3",
    pointBorderColor: "#4ef0c3",
    yAxisID: "y1",
    order: 20,
    spanGaps: true,
    tension: 0.35,
    fill: false,
  };
  hourlyModelChart = new Chart(ctx, {
    data: {
      labels: series.labels,
      datasets: [
        successLine,
        ...barDatasets,
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(255,255,255,0.8)",
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: function(chart) {
              return chart.data.datasets.map((dataset, i) => {
                const color = dataset.type === "line"
                  ? dataset.borderColor
                  : dataset.backgroundColor;
                const isLine = dataset.type === "line";
                return {
                  text: dataset.label,
                  fillStyle: color,
                  strokeStyle: color,
                  fontColor: "rgba(255,255,255,0.8)",
                  lineWidth: 0,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i,
                  pointStyle: isLine ? "circle" : "rect",
                };
              });
            },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              if (context.dataset.type === "line") {
                const value = context.raw;
                if (value === null || value === undefined) return "";
                return `${t("successRate")}：${value.toFixed(1)}%`;
              }
              const rawValue = context.raw || 0;
              if (!rawValue) return "";
              return `${context.dataset.label}：${formatNumber(rawValue)} ${t("times")}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "rgba(255,255,255,0.7)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          stacked: true,
          ticks: { color: "rgba(255,255,255,0.7)" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y1: {
          position: "right",
          beginAtZero: true,
          suggestedMax: 100,
          ticks: {
            color: "rgba(255,255,255,0.7)",
            callback: (value) => `${value}%`,
          },
          grid: { drawOnChartArea: false },
        },
      },
    },
    plugins: [createLineOnTopPlugin(0)],
  });
}

function buildHourlyModelChartData(details, range = "all") {
  const buckets = new Map();
  details.forEach((item) => {
    if (!item.timestamp) return;
    const hour = new Date(item.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.getTime();
    if (!buckets.has(key)) {
      buckets.set(key, {
        timestamp: hour,
        counts: new Map(),
        success: 0,
        total: 0,
      });
    }
    const bucket = buckets.get(key);
    const model = item.model || "unknown";
    bucket.counts.set(model, (bucket.counts.get(model) || 0) + 1);
    bucket.total += 1;
    if (!item.failed) bucket.success += 1;
  });
  const sorted = Array.from(buckets.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
  let limited = sorted;
  if (range !== "all") {
    const limit = Number(range);
    limited = sorted.slice(-limit);
  }
  if (!limited.length) return { labels: [], datasets: [], successRates: [] };
  const totals = new Map();
  limited.forEach((bucket) => {
    bucket.counts.forEach((value, model) => {
      totals.set(model, (totals.get(model) || 0) + value);
    });
  });
  const topModels = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);
  if (!topModels.length)
    return { labels: [], datasets: [], successRates: [] };
  const labelBuckets = limited.map((bucket) => ({
    label: formatHourLabel(bucket.timestamp),
    counts: bucket.counts,
    success: bucket.success,
    total: bucket.total,
  }));
  const datasets = topModels.map((model) => ({
    label: model,
    data: labelBuckets.map((bucket) => bucket.counts.get(model) || 0),
  }));
  const successRates = labelBuckets.map((bucket) => {
    if (!bucket.total) return null;
    return (bucket.success / bucket.total) * 100;
  });
  return {
    labels: labelBuckets.map((bucket) => bucket.label),
    datasets,
    successRates,
  };
}

function buildHourlySeries(details, range = "all") {
  const buckets = new Map();
  details.forEach((item) => {
    if (!item.timestamp) return;
    const hour = new Date(item.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.getTime();
    if (!buckets.has(key)) {
      buckets.set(key, {
        timestamp: hour,
        label: formatHourLabel(hour),
        input: 0,
        output: 0,
        reasoning: 0,
        cached: 0,
        requests: 0,
      });
    }
    const bucket = buckets.get(key);
    bucket.input += item.tokens.input;
    bucket.output += item.tokens.output;
    bucket.reasoning += item.tokens.reasoning;
    bucket.cached += item.tokens.cached;
    bucket.requests += 1;
  });
  const sorted = Array.from(buckets.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
  let limited = sorted;
  if (range !== "all") {
    const limit = Number(range);
    limited = sorted.slice(-limit);
  }
  return {
    labels: limited.map((item) => item.label),
    input: limited.map((item) => item.input),
    output: limited.map((item) => item.output),
    reasoning: limited.map((item) => item.reasoning),
    cached: limited.map((item) => item.cached),
    total: limited.map((item) => item.input + item.output + item.reasoning + item.cached),
    requests: limited.map((item) => item.requests),
  };
}

function updateApiStatusChart(details) {
  const container = document.getElementById("api-status-list");
  if (!container) return;

  // 更新筛选器选项
  updateChannelFilterOptions(details);

  // 应用筛选条件
  let filtered = details;
  if (state.channelFilterChannel) {
    filtered = filtered.filter((item) => {
      const source = item.source || "unknown";
      return formatProviderDisplay(source) === state.channelFilterChannel;
    });
  }
  if (state.channelFilterModel) {
    filtered = filtered.filter((item) => item.model === state.channelFilterModel);
  }
  if (state.channelFilterStatus) {
    if (state.channelFilterStatus === "success") {
      filtered = filtered.filter((item) => !item.failed);
    } else if (state.channelFilterStatus === "failed") {
      filtered = filtered.filter((item) => item.failed);
    }
  }

  // 按来源渠道（source）聚合请求记录，只统计当前活跃的渠道，统计全部模型（包含已禁用的）
  const channelData = {};
  filtered.forEach((item) => {
    const source = item.source || "unknown";
    // 只统计在 providerMap 中存在的渠道（当前活跃的渠道）
    if (!resolveProvider(source)) return;
    const model = item.model || "unknown";

    // 使用完整格式：供应商名 (脱敏Key)
    const displayKey = formatProviderDisplay(source);
    if (!channelData[displayKey]) {
      channelData[displayKey] = {
        success: 0,
        failure: 0,
        originalSource: source,
        requests: [], // 保存每次请求的结果
        lastTimestamp: 0,
        models: {}, // 按模型统计
      };
    }
    if (item.failed) {
      channelData[displayKey].failure += 1;
    } else {
      channelData[displayKey].success += 1;
    }
    // 记录每次请求的成功/失败状态和时间戳
    const timestamp = item.timestamp ? item.timestamp.getTime() : 0;
    channelData[displayKey].requests.push({
      failed: item.failed,
      timestamp,
    });
    if (timestamp && timestamp > channelData[displayKey].lastTimestamp) {
      channelData[displayKey].lastTimestamp = timestamp;
    }
    // 按模型统计
    if (!channelData[displayKey].models[model]) {
      channelData[displayKey].models[model] = { success: 0, failure: 0, requests: [], lastTimestamp: 0 };
    }
    if (item.failed) {
      channelData[displayKey].models[model].failure += 1;
    } else {
      channelData[displayKey].models[model].success += 1;
    }
    // 记录模型级别的请求状态
    channelData[displayKey].models[model].requests.push({
      failed: item.failed,
      timestamp,
    });
    if (timestamp && timestamp > channelData[displayKey].models[model].lastTimestamp) {
      channelData[displayKey].models[model].lastTimestamp = timestamp;
    }
  });

  // 按总请求数排序，取前 10 个（过滤掉没有请求记录的渠道）
  const entries = Object.entries(channelData)
    .filter(([, data]) => data.success + data.failure > 0)
    .sort((a, b) => (b[1].success + b[1].failure) - (a[1].success + a[1].failure));
  const top = entries.slice(0, 10);

  const headerHtml = `
    <div class="provider-status-header">
      <span class="provider-name-header">${t("channel")}</span>
      <span class="provider-count-header">${t("requestCount")}</span>
      <span class="provider-rate-header">${t("successRateColumn")}</span>
      <span class="provider-bars-header">${t("recentRequestStatus")}</span>
      <span class="provider-time-header">${t("lastRequestTime")}</span>
    </div>
  `;

  if (!top.length) {
    container.innerHTML = `${headerHtml}<div class="empty-state">${t("noChannelData")}</div>`;
    return;
  }

  // 生成状态条 HTML
  container.innerHTML = `
    ${headerHtml}
    ${top.map(([displayKey, data], index) => {
      const maxBars = 12; // 最多显示 12 个竖条

      // 按时间排序，取最近的 maxBars 个请求
      const sortedRequests = [...data.requests]
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-maxBars);

      // 按时间顺序生成状态条
      let barsHtml = '';
      sortedRequests.forEach((req) => {
        if (req.failed) {
          barsHtml += '<span class="status-bar failure"></span>';
        } else {
          barsHtml += '<span class="status-bar success"></span>';
        }
      });

      // 截断过长的名称用于显示
      const displayName = displayKey.length > 25 ? displayKey.slice(0, 22) + "..." : displayKey;

      // 计算统计量和成功率
      const totalCount = data.success + data.failure;
      const successRate = totalCount > 0 ? ((data.success / totalCount) * 100).toFixed(1) : "0.0";
      const lastRequestStr = data.lastTimestamp
        ? formatTimestamp(new Date(data.lastTimestamp))
        : "-";

      const canCopy =
        data.originalSource &&
        data.originalSource !== "-" &&
        data.originalSource !== "unknown";
      const copyChannelTitle = t("disableThisModel").replace("禁用该渠道的此模型", t("disableThisModel"));
      const nameContent = canCopy
        ? `<button class="copy-auth" data-auth="${escapeHtml(
            data.originalSource
          )}" data-label="${escapeHtml(
            displayKey
          )}" title="${state.currentLang === "zh" ? "点击复制完整渠道信息" : "Click to copy channel info"}">${wrapSecretDim(escapeHtml(displayName))}</button>`
        : wrapSecretDim(escapeHtml(displayName));

      // 生成模型详情列表（包含已禁用的模型，标注状态）
      const modelEntries = Object.entries(data.models)
        .map(([model, stats]) => {
          const modelTotal = stats.success + stats.failure;
          const modelRate = modelTotal > 0 ? ((stats.success / modelTotal) * 100).toFixed(1) : "0.0";
          const disabled = !isModelEnabled(data.originalSource, model);
          return { model, ...stats, total: modelTotal, rate: parseFloat(modelRate), disabled };
        })
        .sort((a, b) => {
          // 已禁用的排在后面
          if (a.disabled !== b.disabled) {
            return a.disabled ? 1 : -1;
          }
          // 然后按总请求数降序
          return b.total - a.total;
        });

      const hasModels = modelEntries.length > 0;

      const modelsHtml = modelEntries.map(({ model, success, failure, total, rate, requests, lastTimestamp, disabled }) => {
        const rateClass = rate >= 90 ? 'high' : rate >= 70 ? 'medium' : 'low';
        // 生成模型级别的状态条（最近12次请求）
        const maxBars = 12;
        const sortedReqs = [...(requests || [])].sort((a, b) => a.timestamp - b.timestamp).slice(-maxBars);
        const modelBarsHtml = sortedReqs.map(req =>
          `<span class="status-bar ${req.failed ? 'failure' : 'success'}"></span>`
        ).join('');
        // 格式化最近请求时间
        const lastTimeStr = lastTimestamp ? formatTimestamp(new Date(lastTimestamp)) : '-';
        // 禁用按钮（已禁用的模型不显示按钮，显示"已移除"标记）
        const removedLabel = state.currentLang === "zh" ? "已移除" : "Removed";
        const actionHtml = disabled
          ? `<span class="model-disabled-tag">${removedLabel}</span>`
          : (data.originalSource && data.originalSource !== "-" && data.originalSource !== "unknown"
            ? `<button class="disable-model-btn" data-source="${escapeHtml(data.originalSource)}" data-model="${escapeHtml(model)}" title="${t("disableThisModel")}">${t("disable")}</button>`
            : '');
        return `
          <div class="channel-model-item ${disabled ? 'model-disabled' : ''}">
            <span class="channel-model-name copy-model" data-model="${escapeHtml(model)}" title="${state.currentLang === "zh" ? "点击复制模型名称" : "Click to copy model name"}">${escapeHtml(model)}</span>
            <span class="channel-model-count">${formatNumber(total)} ${t("times")}</span>
            <span class="channel-model-rate ${rateClass}">${t("successRate")}:${rate.toFixed(1)}%</span>
            <span class="channel-model-detail">${t("success", {count: success})} / ${t("failed", {count: failure})}</span>
            <div class="channel-model-bars provider-bars">${modelBarsHtml}</div>
            <span class="channel-model-time">${lastTimeStr}</span>
            <span class="channel-model-action">${actionHtml}</span>
          </div>
        `;
      }).join("");

      return `
        <div class="provider-status-row ${hasModels ? 'expandable' : ''}" data-row-id="channel-row-${index}">
          <span class="provider-name" title="${escapeHtml(displayKey)}">${nameContent}</span>
          <span class="provider-count">${formatNumber(totalCount)}</span>
          <span class="provider-rate ${parseFloat(successRate) >= 90 ? 'high' : parseFloat(successRate) >= 70 ? 'medium' : 'low'}">${successRate}%</span>
          <div class="provider-bars" title="${t("successLabel")}: ${data.success}, ${t("failureLabel")}: ${data.failure}">
            ${barsHtml}
          </div>
          <span class="provider-last-request-time">${lastRequestStr}</span>
        </div>
        ${hasModels ? `
        <div class="provider-expand-detail" id="channel-row-${index}-detail">
          <div class="expand-detail-header">
            <span>${t("modelSuccessDetail")} (${t("modelsCount", { count: modelEntries.length })})</span>
            <span class="expand-source-info">${t("channelLabel")}: ${escapeHtml(displayKey)}</span>
          </div>
          <div class="channel-models-list">${modelsHtml}</div>
        </div>
        ` : ""}
      `;
    }).join("")}
  `;
}

function updateApiRanking(details) {
  const list = document.getElementById("api-ranking-list");
  if (!list) return;
  if (!details.length) {
    list.innerHTML = `<div class="empty-state">${t("noRankingData")}</div>`;
    return;
  }
  const aggregated = {};
  details.forEach((item) => {
    const key = item.api || "unknown";
    if (!aggregated[key]) aggregated[key] = { requests: 0, tokens: 0 };
    aggregated[key].requests += 1;
    aggregated[key].tokens += item.tokens.total;
  });
  const entries = Object.entries(aggregated).sort(
    (a, b) => b[1].requests - a[1].requests
  );
  list.innerHTML = entries.slice(0, 6).map(([api, data], index) => {
    const rank = index + 1;
     const displayName = formatProviderDisplay(api);
    return `
      <div class="ranking-item">
        <span>${rank}. ${escapeHtml(displayName)}</span>
        <strong>${formatNumber(data.requests)} ${t("requestLabel")} · ${formatNumber(data.tokens)} tokens</strong>
      </div>
    `;
  }).join("");
}

function updateFailureSources(details) {
  const container = document.getElementById("failure-source-list");
  if (!container) return;

  // 更新筛选器选项
  updateFailureFilterOptions(details);

  // 应用筛选条件
  let filtered = details;
  if (state.failureFilterChannel) {
    filtered = filtered.filter((item) => {
      const source = item.source || "unknown";
      return formatProviderDisplay(source) === state.failureFilterChannel;
    });
  }
  if (state.failureFilterModel) {
    filtered = filtered.filter((item) => item.model === state.failureFilterModel);
  }

  const failureDetails = filtered.filter((item) => item.failed);
  if (!failureDetails.length) {
    container.innerHTML = `<div class="empty-state">${t("noFailureData")}</div>`;
    return;
  }

  // 收集有失败记录的渠道，同时统计该渠道所有请求（用于计算成功率）
  const failedSources = new Set();
  failureDetails.forEach((item) => {
    const source = item.source || "unknown";
    if (resolveProvider(source)) {
      failedSources.add(source);
    }
  });

  // 统计这些渠道的所有请求（包括成功和失败），统计全部模型（包含已禁用的）
  const sourceMap = {};
  details.forEach((item) => {
    const source = item.source || "unknown";
    // 只统计有失败记录的渠道
    if (!failedSources.has(source)) return;
    const model = item.model || "unknown";

    if (!sourceMap[source]) {
      sourceMap[source] = {
        failureCount: 0,
        models: {},
        lastFailTime: null,
      };
    }
    if (item.failed) {
      sourceMap[source].failureCount += 1;
      // 更新最近失败时间
      if (item.timestamp) {
        if (!sourceMap[source].lastFailTime || item.timestamp > sourceMap[source].lastFailTime) {
          sourceMap[source].lastFailTime = item.timestamp;
        }
      }
    }
    // 按模型统计（包括成功和失败）
    if (!sourceMap[source].models[model]) {
      sourceMap[source].models[model] = { success: 0, failure: 0, requests: [], lastTimestamp: 0 };
    }
    if (item.failed) {
      sourceMap[source].models[model].failure += 1;
    } else {
      sourceMap[source].models[model].success += 1;
    }
    // 记录请求状态
    const timestamp = item.timestamp ? item.timestamp.getTime() : 0;
    sourceMap[source].models[model].requests.push({
      failed: item.failed,
      timestamp,
    });
    if (timestamp && timestamp > sourceMap[source].models[model].lastTimestamp) {
      sourceMap[source].models[model].lastTimestamp = timestamp;
    }
  });

  // 按失败数排序，取前 10 个
  const entries = Object.entries(sourceMap)
    .filter(([, data]) => data.failureCount > 0)
    .sort((a, b) => b[1].failureCount - a[1].failureCount)
    .slice(0, 10);

  const rows = entries
    .map(([source, data], index) => {
      const fullLabel = formatProviderDisplay(source);
      const shortLabel =
        fullLabel.length > 28 ? `${fullLabel.slice(0, 25)}...` : fullLabel;
      const canCopy =
        source && source !== "-" && source !== "unknown" && source !== "";
      const copySourceTitle = state.currentLang === "zh" ? "点击复制完整来源" : "Click to copy source";
      const nameContent = canCopy
        ? `<button class="copy-auth" data-auth="${escapeHtml(
            source
          )}" data-label="${escapeHtml(
            fullLabel
          )}" title="${copySourceTitle}">${wrapSecretDim(escapeHtml(shortLabel))}</button>`
        : wrapSecretDim(escapeHtml(shortLabel));

      // 获取失败最多的模型（缩略显示，包含已禁用的模型并标注）
      const modelEntries = Object.entries(data.models)
        .map(([model, stats]) => {
          const total = stats.success + stats.failure;
          const rate = total > 0 ? (stats.success / total) * 100 : 0;
          const disabled = !isModelEnabled(source, model);
          return { model, ...stats, total, rate, disabled };
        })
        .filter(m => m.failure > 0) // 只显示有失败的模型
        .sort((a, b) => {
          // 已禁用的排在后面
          if (a.disabled !== b.disabled) {
            return a.disabled ? 1 : -1;
          }
          // 然后按失败数降序
          return b.failure - a.failure;
        });

      const topModels = modelEntries
        .slice(0, 2)
        .map(({ model, failure, disabled }) => {
          const percent = ((failure / data.failureCount) * 100).toFixed(0);
          const shortModel = model.length > 16 ? model.slice(0, 13) + "..." : model;
          const tooltipText = state.currentLang === "zh"
            ? `模型: ${escapeHtml(model)}\n失败: ${failure}次 (${percent}%)${disabled ? '\n状态: 已移除' : ''}\n点击复制模型名称`
            : `Model: ${escapeHtml(model)}\nFailed: ${failure} (${percent}%)${disabled ? '\nStatus: Removed' : ''}\nClick to copy`;
          return `<span class="failure-model-tag copy-model ${disabled ? 'model-disabled' : ''}" data-model="${escapeHtml(model)}" title="${tooltipText}">${escapeHtml(shortModel)}</span>`;
        })
        .join("");

      // 生成完整模型列表（展开后显示，与渠道统计格式一致，包含已禁用的模型）
      const modelsHtml = modelEntries.map(({ model, success, failure, total, rate, requests, lastTimestamp, disabled }) => {
        const rateClass = rate >= 90 ? 'high' : rate >= 70 ? 'medium' : 'low';
        // 生成模型级别的状态条（最近12次请求）
        const maxBars = 12;
        const sortedReqs = [...(requests || [])].sort((a, b) => a.timestamp - b.timestamp).slice(-maxBars);
        const modelBarsHtml = sortedReqs.map(req =>
          `<span class="status-bar ${req.failed ? 'failure' : 'success'}"></span>`
        ).join('');
        // 格式化最近请求时间
        const lastTimeStr = lastTimestamp ? formatTimestamp(new Date(lastTimestamp)) : '-';
        // 禁用按钮（已禁用的模型不显示按钮，显示"已移除"标记）
        const removedLabel = state.currentLang === "zh" ? "已移除" : "Removed";
        const actionHtml = disabled
          ? `<span class="model-disabled-tag">${removedLabel}</span>`
          : (source && source !== "-" && source !== "unknown"
            ? `<button class="disable-model-btn" data-source="${escapeHtml(source)}" data-model="${escapeHtml(model)}" title="${t("disableThisModel")}">${t("disable")}</button>`
            : '');
        return `
          <div class="channel-model-item ${disabled ? 'model-disabled' : ''}">
            <span class="channel-model-name copy-model" data-model="${escapeHtml(model)}" title="${state.currentLang === "zh" ? "点击复制模型名称" : "Click to copy model name"}">${escapeHtml(model)}</span>
            <span class="channel-model-count">${formatNumber(total)} ${t("times")}</span>
            <span class="channel-model-rate ${rateClass}">${t("successRate")}:${rate.toFixed(1)}%</span>
            <span class="channel-model-detail">${t("success", {count: success})} / ${t("failed", {count: failure})}</span>
            <div class="channel-model-bars provider-bars">${modelBarsHtml}</div>
            <span class="channel-model-time">${lastTimeStr}</span>
            <span class="channel-model-action">${actionHtml}</span>
          </div>
        `;
      }).join("");

      // 格式化最近失败时间
      const lastFailTimeStr = data.lastFailTime ? formatTimestamp(data.lastFailTime) : "-";
      const hasModels = modelEntries.length > 0;

      return `
        <div class="provider-status-row ${hasModels ? 'expandable' : ''}" data-row-id="failure-row-${index}">
          <span class="provider-name" title="${escapeHtml(
            fullLabel
          )}">${nameContent}</span>
          <span class="provider-count">${formatNumber(data.failureCount)}</span>
          <span class="provider-last-fail-time">${lastFailTimeStr}</span>
          <div class="failure-models">${topModels}${modelEntries.length > 2 ? `<span class="more-models-hint">${t("moreModels", { count: modelEntries.length - 2 })}</span>` : ""}</div>
        </div>
        ${hasModels ? `
        <div class="provider-expand-detail" id="failure-row-${index}-detail">
          <div class="expand-detail-header">
            <span>${t("modelFailureDetail")} (${t("modelsCount", { count: modelEntries.length })})</span>
            <span class="expand-source-info">${t("channelLabel")}: ${escapeHtml(fullLabel)}</span>
          </div>
          <div class="channel-models-list">${modelsHtml}</div>
        </div>
        ` : ""}
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="provider-status-header">
      <span class="provider-name-header">${t("channel")}</span>
      <span class="provider-count-header">${t("failureCount")}</span>
      <span class="provider-time-header">${t("lastFailureTime")}</span>
      <span class="provider-models-header">${t("mainFailureModels")}</span>
    </div>
    ${rows}
  `;
}

function updateHourRangeCaptions() {
  const labelMap = {
    all: t("all"),
    "12": t("last12Hours"),
    "24": t("last24Hours"),
  };
  const loadLabel = labelMap[state.loadHourRange] || t("all");
  const modelLabel = labelMap[state.modelHourRange] || t("all");
  const caption1 = document.getElementById("hourly-caption");
  if (caption1) caption1.textContent = `${t("byType")} · ${loadLabel}`;
  const caption2 = document.getElementById("hourly-model-caption");
  if (caption2) caption2.textContent = `${t("topModels")} · ${modelLabel}`;
}

function syncHourRangeButtons() {
  document.querySelectorAll(".hour-range-btn").forEach((btn) => {
    const target = btn.dataset.target || "load";
    const range = btn.dataset.range || "all";
    const active =
      (target === "model"
        ? state.modelHourRange
        : state.loadHourRange) === range;
    if (active) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function updateTrendCaption() {
  const caption = document.getElementById("trend-caption");
  if (!caption) return;
  const daysText = t("lastXDays", { days: state.timeframeDays });
  const trendText = state.currentLang === "zh" ? "请求数与 Token 用量趋势" : "Requests and Token Usage Trend";
  caption.textContent = `${daysText} · ${trendText}`;
}

function updateDistributionCaption() {
  const caption = document.getElementById("distribution-caption");
  if (!caption) return;
  caption.textContent = t("requestDist");
}

function updateChannelStatsCaption() {
  const caption = document.getElementById("channel-stats-caption");
  if (!caption) return;
  const hint = state.currentLang === "zh" ? "单击行展开模型详情" : "Click row to expand model details";
  const hintText = `<span style="color: var(--dim);">${hint}</span>`;
  const bySource = state.currentLang === "zh" ? "按来源渠道分类" : "By Source Channel";
  if (state.channelCustomRange) {
    const rangeLabel = formatCustomRangeLabel(state.channelCustomRange);
    caption.innerHTML = `${rangeLabel} · ${bySource} · ${hintText}`;
  } else {
    caption.innerHTML = `${t("lastXDays", { days: state.channelStatsDays })} · ${bySource} · ${hintText}`;
  }
}

function updateFailureStatsCaption() {
  const caption = document.getElementById("failure-stats-caption");
  if (!caption) return;
  const hint = state.currentLang === "zh" ? "单击行展开详情" : "Click row to expand details";
  const hintText = `<span style="color: var(--dim);">${hint}</span>`;
  const locateText = state.currentLang === "zh" ? "从来源渠道定位异常" : "Locate issues by source channel";
  if (state.failureCustomRange) {
    const rangeLabel = formatCustomRangeLabel(state.failureCustomRange);
    caption.innerHTML = `${rangeLabel} · ${locateText} · ${hintText}`;
  } else {
    caption.innerHTML = `${t("lastXDays", { days: state.failureStatsDays })} · ${locateText} · ${hintText}`;
  }
}

function updateLogTable(details) {
  const tbody = document.getElementById("log-table-body");
  if (!tbody) return;

  // 更新筛选器下拉选项
  updateLogFilterOptions(details);

  // 先应用日志时间筛选
  let filtered = details;
  if (state.logCustomRange) {
    filtered = filtered.filter((item) => {
      if (!item.timestamp) return true;
      return item.timestamp >= state.logCustomRange.start && item.timestamp <= state.logCustomRange.end;
    });
  } else if (state.logTimeDays) {
    const rangeStart = getRangeStart(state.logTimeDays);
    filtered = filtered.filter((item) => {
      if (!item.timestamp) return true;
      return item.timestamp >= rangeStart;
    });
  }

  // 应用筛选条件
  if (state.logFilterApi) {
    filtered = filtered.filter((item) => item.api === state.logFilterApi);
  }
  if (state.logFilterModel) {
    filtered = filtered.filter((item) => item.model === state.logFilterModel);
  }
  if (state.logFilterSource) {
    filtered = filtered.filter((item) => (item.source || "unknown") === state.logFilterSource);
  }
  if (state.logFilterStatus) {
    if (state.logFilterStatus === "success") {
      filtered = filtered.filter((item) => !item.failed);
    } else if (state.logFilterStatus === "failed") {
      filtered = filtered.filter((item) => item.failed);
    }
  }

  if (!filtered.length) {
    tbody.innerHTML =
      `<tr><td colspan="12" class="log-empty">${t("noLogData")}</td></tr>`;
    return;
  }

  // 预先按来源渠道+模型聚合请求记录，用于显示模型状态（使用原始数据，不受筛选影响）
  const channelModelRequests = {};
  details.forEach((item) => {
    const source = item.source || "unknown";
    const model = item.model || "unknown";
    const key = `${source}|||${model}`;
    if (!channelModelRequests[key]) {
      channelModelRequests[key] = [];
    }
    channelModelRequests[key].push({
      failed: item.failed,
      timestamp: item.timestamp ? item.timestamp.getTime() : 0
    });
  });
  // 对每个渠道+模型的请求按时间排序
  Object.keys(channelModelRequests).forEach((key) => {
    channelModelRequests[key].sort((a, b) => a.timestamp - b.timestamp);
  });
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.timestamp ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp ? b.timestamp.getTime() : 0;
    return timeB - timeA;
  });

  // 分页计算
  const totalCount = sorted.length;
  const totalPages = Math.ceil(totalCount / state.logPageSize);
  if (state.logPage > totalPages) state.logPage = totalPages || 1;
  const startIdx = (state.logPage - 1) * state.logPageSize;
  const endIdx = startIdx + state.logPageSize;
  const pageData = sorted.slice(startIdx, endIdx);

  // 更新副标题，显示时间范围和分页信息
  const logCaption = document.getElementById("log-caption");
  if (logCaption) {
    let timeLabel;
    if (state.logCustomRange) {
      timeLabel = formatCustomRangeLabel(state.logCustomRange);
    } else {
      timeLabel = state.logTimeDays === 1 ? t("today") : t("lastXDays", { days: state.logTimeDays });
    }
    const totalText = state.currentLang === "zh" ? "共" : "Total";
    const recordsText = state.currentLang === "zh" ? "条" : "records";
    const pageText = state.currentLang === "zh" ? "第" : "Page";
    logCaption.textContent = `${timeLabel} · ${totalText} ${totalCount} ${recordsText} · ${pageText} ${state.logPage}/${totalPages}`;
  }

  // 渲染分页控件
  renderLogPagination(totalPages);

  tbody.innerHTML = pageData.map((item) => {
    const statusClass = item.failed ? "failed" : "success";
    const statusLabel = item.failed ? t("failedStatus") : t("successStatus");
    const maskedApi = maskSecret(item.api);

    // 生成模型状态条（该渠道+模型的最近10次请求）
    const source = item.source || "unknown";
    const model = item.model || "unknown";
    const key = `${source}|||${model}`;
    const sourceModelRequests = channelModelRequests[key] || [];
    // 只取时间戳 <= 当前行的请求，确保当前请求也被包含
    const currentTimestamp = item.timestamp ? item.timestamp.getTime() : 0;
    const requestsUpToCurrent = sourceModelRequests.filter(req => req.timestamp <= currentTimestamp);
    const recentUpToCurrent = requestsUpToCurrent.slice(-10);
    const modelStatusHtml = recentUpToCurrent.map((req) =>
      `<span class="status-bar ${req.failed ? 'failure' : 'success'}"></span>`
    ).join('');
    // 计算截止到当前请求的成功率
    const successCount = requestsUpToCurrent.filter(req => !req.failed).length;
    const totalCount = requestsUpToCurrent.length;
    const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "0.0";

    return `
      <tr>
        <td>${escapeHtml(item.authIndex || "-")}</td>
        <td title="${escapeHtml(item.api)}">${escapeHtml(maskedApi)}</td>
        <td>${escapeHtml(item.model)}</td>
        <td>${wrapSecretDim(escapeHtml(formatProviderDisplay(item.source)))}</td>
        <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
        <td><div class="provider-bars">${modelStatusHtml}</div></td>
        <td><span class="provider-rate ${parseFloat(successRate) >= 90 ? 'high' : parseFloat(successRate) >= 70 ? 'medium' : 'low'}">${successRate}%</span></td>
        <td>${formatNumber(totalCount)}</td>
        <td>${formatNumber(item.tokens.input)}</td>
        <td>${formatNumber(item.tokens.output)}</td>
        <td>${formatNumber(item.tokens.total)}</td>
        <td>${formatTimestamp(item.timestamp)}</td>
        <td>${item.source && item.source !== "-" && item.source !== "unknown"
          ? `<button class="disable-model-btn" data-source="${escapeHtml(item.source)}" data-model="${escapeHtml(item.model)}" title="${t("disableThisModel")}">${t("disable")}</button>`
          : '-'}</td>
      </tr>
    `;
  }).join("");
}

function updateLogFilterOptions(details) {
  const apiSelect = document.getElementById("log-filter-api");
  const modelSelect = document.getElementById("log-filter-model");
  const sourceSelect = document.getElementById("log-filter-source");

  if (!apiSelect || !modelSelect || !sourceSelect) return;

  // 收集唯一值
  const apis = new Set();
  const models = new Set();
  const sources = new Set();
  details.forEach((item) => {
    if (item.api) apis.add(item.api);
    if (item.model) models.add(item.model);
    sources.add(item.source || "unknown");
  });

  // 更新 API 下拉选项
  const currentApi = state.logFilterApi;
  apiSelect.innerHTML = `<option value="">${t("allApis")}</option>` +
    Array.from(apis).sort().map((api) => {
      const masked = maskSecret(api);
      const selected = api === currentApi ? " selected" : "";
      return `<option value="${escapeHtml(api)}"${selected}>${escapeHtml(masked)}</option>`;
    }).join("");

  // 更新模型下拉选项
  const currentModel = state.logFilterModel;
  modelSelect.innerHTML = `<option value="">${t("allModels")}</option>` +
    Array.from(models).sort().map((model) => {
      const selected = model === currentModel ? " selected" : "";
      return `<option value="${escapeHtml(model)}"${selected}>${escapeHtml(model)}</option>`;
    }).join("");

  // 更新来源渠道下拉选项
  const currentSource = state.logFilterSource;
  sourceSelect.innerHTML = `<option value="">${t("allSources")}</option>` +
    Array.from(sources).sort().map((source) => {
      const display = formatProviderDisplay(source);
      const selected = source === currentSource ? " selected" : "";
      return `<option value="${escapeHtml(source)}"${selected}>${escapeHtml(display)}</option>`;
    }).join("");
}

function updateTimestamp() {
  const el = document.getElementById("last-sync");
  const logEl = document.getElementById("log-last-update");
  const now = new Date();
  const locale = state.currentLang === "zh" ? "zh-CN" : "en-US";
  const timeStr = now.toLocaleTimeString(locale, { hour12: false });
  const lastSyncLabel = state.currentLang === "zh" ? "上次同步" : "Last Sync";
  const updatedAtLabel = state.currentLang === "zh" ? "更新于" : "Updated at";
  if (el) el.textContent = `${lastSyncLabel}：${timeStr}`;
  if (logEl) logEl.textContent = `${updatedAtLabel} ${timeStr}`;
}

function showStatus(message, type) {
  const banner = document.getElementById("status-banner");
  if (!banner) return;
  if (!message) {
    banner.style.display = "none";
    return;
  }
  banner.textContent = message;
  banner.className = `status-banner ${type}`;
  banner.style.display = "block";
}

function getRangeStart(days) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return "0";
  return Number(value).toLocaleString("zh-CN");
}

function setTokenBreakdownText(id, label, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const timeframe = t("lastXDays", { days: state.timeframeDays });
  const textValue =
    value === null || value === undefined ? "--" : formatNumber(value);
  el.textContent = `${label} (${timeframe}) ${textValue}`;
}

function updateTokenNote() {
  const tokenNote = document.getElementById("stat-token-note");
  if (!tokenNote) return;
  const daysText = t("lastXDays", { days: state.timeframeDays });
  tokenNote.textContent = `${daysText} · ${t("tokenTypesSummary")}`;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHourLabel(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  return `${month}/${day} ${hour}:00`;
}

function formatTimestamp(date) {
  if (!date) return "-";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
    2,
    "0"
  )}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let lineOnTopPluginCounter = 0;
function createLineOnTopPlugin(datasetIndex) {
  const pluginId = `line-on-top-${lineOnTopPluginCounter++}`;
  return {
    id: pluginId,
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta || meta.hidden) return;
      meta.controller.draw();
    },
  };
}

function maskSecret(key) {
  if (!key || key === "-" || key === "unknown") return key || "-";
  if (key.length <= 8) {
    return `${key.slice(0, 4)}***`;
  }
  return `${key.slice(0, 4)}***${key.slice(-4)}`;
}

async function ensureCompatibility(apiUrl, secretKey) {
  if (state.compatibilityLoaded) return;
  try {
    const response = await fetch(`${apiUrl}/v0/management/openai-compatibility`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const map = {};
    const providerModels = {};
    (data["openai-compatibility"] || []).forEach((entry) => {
      const provider =
        entry.headers?.["X-Provider"] || entry.name || "unknown provider";
      // 存储每个渠道的可用模型（使用 alias 作为标识）
      const modelSet = new Set();
      (entry.models || []).forEach((m) => {
        if (m.alias) modelSet.add(m.alias);
        if (m.name) modelSet.add(m.name);
      });
      (entry["api-key-entries"] || []).forEach((item) => {
        const key = item["api-key"];
        if (key) {
          map[key] = provider;
          // 将模型集合关联到每个 api-key
          providerModels[key] = modelSet;
        }
      });
    });
    state.providerMap = map;
    state.providerModels = providerModels;
  } catch (err) {
    console.warn("加载 openai-compatibility 失败：", err.message);
  } finally {
    state.compatibilityLoaded = true;
  }
}

function resolveProvider(identifier) {
  if (!identifier || identifier === "-" || identifier === "unknown") return null;
  // 首先尝试完全匹配
  if (state.providerMap[identifier]) {
    return state.providerMap[identifier];
  }
  // 然后尝试前缀匹配（双向）
  const entries = Object.entries(state.providerMap);
  for (const [key, provider] of entries) {
    if (identifier.startsWith(key) || key.startsWith(identifier)) {
      return provider;
    }
  }
  return null;
}

// 检查模型是否在指定渠道中可用（未被禁用）
function isModelEnabled(source, modelAlias) {
  if (!source || !modelAlias) return true; // 无法判断时默认显示
  // 首先尝试完全匹配
  if (state.providerModels[source]) {
    return state.providerModels[source].has(modelAlias);
  }
  // 然后尝试前缀匹配
  const entries = Object.entries(state.providerModels);
  for (const [key, modelSet] of entries) {
    if (source.startsWith(key) || key.startsWith(source)) {
      return modelSet.has(modelAlias);
    }
  }
  return true; // 找不到渠道配置时默认显示
}

function formatProviderDisplay(identifier) {
  if (!identifier || identifier === "-" || identifier === "unknown") {
    return identifier || "-";
  }
  const provider = resolveProvider(identifier);
  const masked = maskSecret(identifier);
  if (!provider) return masked;
  return `${provider} (${masked})`;
}

// 将括号内的秘钥部分用暗色样式包装
function wrapSecretDim(text) {
  return text.replace(/(\([^)]+\)?\.{0,3})$/, '<span class="secret-dim">$1</span>');
}

// 侧边导航功能
function initSideNav() {
  const navItems = document.querySelectorAll(".side-nav-item");
  const sections = [];

  // 收集所有导航区块
  navItems.forEach((item) => {
    const targetId = item.dataset.target;
    const section = document.getElementById(targetId);
    if (section) {
      sections.push({ item, section, id: targetId });
    }
  });

  if (!sections.length) return;

  // 从 targetId 提取 view 名称 (nav-logs -> logs)
  const getViewName = (targetId) => targetId.replace(/^nav-/, "");

  // 点击导航项平滑滚动并更新URL
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.target;
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        const url = new URL(window.location);
        url.searchParams.set("view", getViewName(targetId));
        history.replaceState(null, "", url);
      }
    });
  });

  // 页面加载时检查URL参数并滚动
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get("view");
  if (viewParam) {
    const target = document.getElementById("nav-" + viewParam);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }

  // 滚动监听，高亮当前可见区块
  let ticking = false;
  const updateActiveNav = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const offset = windowHeight * 0.3; // 30% 视口高度作为触发点

    let activeSection = null;
    let minDistance = Infinity;

    sections.forEach(({ item, section }) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrollTop;
      const distance = Math.abs(sectionTop - scrollTop - offset);

      // 找到距离触发点最近的区块
      if (rect.top <= offset + 100 && rect.bottom > 0) {
        if (distance < minDistance) {
          minDistance = distance;
          activeSection = item;
        }
      }
    });

    // 如果没有找到活跃区块，选择第一个可见的
    if (!activeSection && sections.length) {
      for (const { item, section } of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          activeSection = item;
          break;
        }
      }
    }

    // 更新活跃状态
    navItems.forEach((item) => item.classList.remove("active"));
    if (activeSection) {
      activeSection.classList.add("active");
      // 自动更新 URL 参数
      const targetId = activeSection.dataset.target;
      if (targetId) {
        const viewName = getViewName(targetId);
        const url = new URL(window.location);
        const currentView = url.searchParams.get("view");
        // 只有当 view 参数变化时才更新 URL，避免不必要的历史记录操作
        if (currentView !== viewName) {
          url.searchParams.set("view", viewName);
          history.replaceState(null, "", url);
        }
      }
    }
  };

  // 节流处理滚动事件
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  // 初始化时设置第一个为活跃状态
  if (sections.length && sections[0].item) {
    sections[0].item.classList.add("active");
  }

  // 页面加载完成后执行一次
  updateActiveNav();
}

// 设置模态框功能
function initSettingsModal() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const settingsClose = document.getElementById("settings-close");
  const settingsCancel = document.getElementById("settings-cancel");
  const settingsSave = document.getElementById("settings-save");

  if (!settingsBtn || !settingsModal) return;

  // 打开设置模态框
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("active");
  });

  // 关闭设置模态框
  const closeModal = () => {
    settingsModal.classList.remove("active");
  };

  if (settingsClose) settingsClose.addEventListener("click", closeModal);
  if (settingsCancel) settingsCancel.addEventListener("click", closeModal);

  // 点击遮罩关闭
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeModal();
  });

  // 保存设置到 localStorage 并刷新数据
  if (settingsSave) {
    settingsSave.addEventListener("click", () => {
      let apiUrl = document.getElementById("api-url").value.trim();
      const secretKey = document.getElementById("secret-key").value.trim();

      // 自动补全本地地址的 http:// 前缀
      if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
        // 识别本地地址模式：localhost、127.0.0.1、192.168.x.x、10.x.x.x 等
        if (/^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(apiUrl)) {
          apiUrl = "http://" + apiUrl;
          document.getElementById("api-url").value = apiUrl;
        }
      }

      // 保存到 localStorage
      if (apiUrl) {
        localStorage.setItem(STORAGE_KEY_API_URL, apiUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_URL);
      }
      if (secretKey) {
        localStorage.setItem(STORAGE_KEY_SECRET, secretKey);
      } else {
        localStorage.removeItem(STORAGE_KEY_SECRET);
      }

      closeModal();
      fetchUsage();
    });
  }

  // ESC 键关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && settingsModal.classList.contains("active")) {
      closeModal();
    }
  });
}

// 初始化渠道统计和失败来源分析的时间选择按钮
function initStatsTimeButtons() {
  // 渠道统计时间按钮
  document.querySelectorAll(".channel-time-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".channel-time-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      const days = btn.dataset.days;
      const datePicker = document.getElementById("channel-date-picker");

      if (days === "custom") {
        // 显示自定义日期选择器
        if (datePicker) datePicker.classList.add("active");
        // 设置默认日期范围（最近7天）
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        const startInput = document.getElementById("channel-start-date");
        const endInput = document.getElementById("channel-end-date");
        if (startInput && !startInput.value) startInput.value = formatDateForInput(weekAgo);
        if (endInput && !endInput.value) endInput.value = formatDateForInput(today);
      } else {
        // 隐藏自定义日期选择器，使用预设天数
        if (datePicker) datePicker.classList.remove("active");
        state.channelStatsDays = Number(days);
        state.channelCustomRange = null;
        updateChannelStatsCaption();
        updateApiStatusChart(filterDetailsByDays(state.details, state.channelStatsDays));
      }
    });
  });

  // 渠道统计自定义日期应用按钮
  const channelApplyBtn = document.getElementById("channel-date-apply");
  if (channelApplyBtn) {
    channelApplyBtn.addEventListener("click", () => {
      const startInput = document.getElementById("channel-start-date");
      const endInput = document.getElementById("channel-end-date");
      if (startInput?.value && endInput?.value) {
        const startDate = new Date(startInput.value);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endInput.value);
        endDate.setHours(23, 59, 59, 999);

        if (startDate <= endDate) {
          state.channelCustomRange = { start: startDate, end: endDate };
          state.channelStatsDays = "custom";
          updateChannelStatsCaption();
          updateApiStatusChart(filterDetailsByCustomRange(state.details, state.channelCustomRange));
        }
      }
    });
  }

  // 失败来源分析时间按钮
  document.querySelectorAll(".failure-time-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".failure-time-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      const days = btn.dataset.days;
      const datePicker = document.getElementById("failure-date-picker");

      if (days === "custom") {
        // 显示自定义日期选择器
        if (datePicker) datePicker.classList.add("active");
        // 设置默认日期范围（最近7天）
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        const startInput = document.getElementById("failure-start-date");
        const endInput = document.getElementById("failure-end-date");
        if (startInput && !startInput.value) startInput.value = formatDateForInput(weekAgo);
        if (endInput && !endInput.value) endInput.value = formatDateForInput(today);
      } else {
        // 隐藏自定义日期选择器，使用预设天数
        if (datePicker) datePicker.classList.remove("active");
        state.failureStatsDays = Number(days);
        state.failureCustomRange = null;
        updateFailureStatsCaption();
        updateFailureSources(filterDetailsByDays(state.details, state.failureStatsDays));
      }
    });
  });

  // 失败来源分析自定义日期应用按钮
  const failureApplyBtn = document.getElementById("failure-date-apply");
  if (failureApplyBtn) {
    failureApplyBtn.addEventListener("click", () => {
      const startInput = document.getElementById("failure-start-date");
      const endInput = document.getElementById("failure-end-date");
      if (startInput?.value && endInput?.value) {
        const startDate = new Date(startInput.value);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endInput.value);
        endDate.setHours(23, 59, 59, 999);

        if (startDate <= endDate) {
          state.failureCustomRange = { start: startDate, end: endDate };
          state.failureStatsDays = "custom";
          updateFailureStatsCaption();
          updateFailureSources(filterDetailsByCustomRange(state.details, state.failureCustomRange));
        }
      }
    });
  }

  // 渠道统计筛选事件
  const channelFilterChannel = document.getElementById("channel-filter-channel");
  const channelFilterModel = document.getElementById("channel-filter-model");
  const channelFilterStatus = document.getElementById("channel-filter-status");

  if (channelFilterChannel) {
    channelFilterChannel.addEventListener("change", () => {
      state.channelFilterChannel = channelFilterChannel.value;
      refreshChannelStats();
    });
  }
  if (channelFilterModel) {
    channelFilterModel.addEventListener("change", () => {
      state.channelFilterModel = channelFilterModel.value;
      refreshChannelStats();
    });
  }
  if (channelFilterStatus) {
    channelFilterStatus.addEventListener("change", () => {
      state.channelFilterStatus = channelFilterStatus.value;
      refreshChannelStats();
    });
  }

  // 失败来源分析筛选事件
  const failureFilterChannel = document.getElementById("failure-filter-channel");
  const failureFilterModel = document.getElementById("failure-filter-model");
  if (failureFilterChannel) {
    failureFilterChannel.addEventListener("change", () => {
      state.failureFilterChannel = failureFilterChannel.value;
      refreshFailureStats();
    });
  }
  if (failureFilterModel) {
    failureFilterModel.addEventListener("change", () => {
      state.failureFilterModel = failureFilterModel.value;
      refreshFailureStats();
    });
  }
}

// 刷新渠道统计（应用筛选）
function refreshChannelStats() {
  let filtered = state.details;
  if (state.channelCustomRange) {
    filtered = filterDetailsByCustomRange(filtered, state.channelCustomRange);
  } else {
    filtered = filterDetailsByDays(filtered, state.channelStatsDays);
  }
  updateApiStatusChart(filtered);
}

// 刷新失败来源分析（应用筛选）
function refreshFailureStats() {
  let filtered = state.details;
  if (state.failureCustomRange) {
    filtered = filterDetailsByCustomRange(filtered, state.failureCustomRange);
  } else {
    filtered = filterDetailsByDays(filtered, state.failureStatsDays);
  }
  updateFailureSources(filtered);
}

// 更新渠道统计筛选器选项
function updateChannelFilterOptions(details) {
  const channelSelect = document.getElementById("channel-filter-channel");
  const modelSelect = document.getElementById("channel-filter-model");
  if (!modelSelect) return;

  // 收集唯一渠道和模型
  const channels = new Set();
  const models = new Set();
  details.forEach((item) => {
    const source = item.source || "unknown";
    const provider = resolveProvider(source);
    if (provider) {
      channels.add(formatProviderDisplay(source));
    }
    if (item.model) models.add(item.model);
  });

  // 更新渠道下拉选项
  if (channelSelect) {
    const currentChannel = state.channelFilterChannel;
    channelSelect.innerHTML = `<option value="">${t("allChannels")}</option>` +
      Array.from(channels).sort().map((channel) => {
        const selected = channel === currentChannel ? ' selected' : '';
        return `<option value="${escapeHtml(channel)}"${selected}>${escapeHtml(channel)}</option>`;
      }).join('');
  }

  // 保存当前选中值
  const currentModel = state.channelFilterModel;

  // 更新模型下拉选项
  modelSelect.innerHTML = `<option value="">${t("allModels")}</option>` +
    Array.from(models).sort().map((model) => {
      const selected = model === currentModel ? ' selected' : '';
      return `<option value="${escapeHtml(model)}"${selected}>${escapeHtml(model)}</option>`;
    }).join('');
}

// 更新失败来源分析筛选器选项
function updateFailureFilterOptions(details) {
  const channelSelect = document.getElementById("failure-filter-channel");
  const modelSelect = document.getElementById("failure-filter-model");
  if (!modelSelect) return;

  // 只收集有失败记录的渠道和模型
  const channels = new Set();
  const models = new Set();
  details.forEach((item) => {
    if (item.failed) {
      const source = item.source || "unknown";
      const provider = resolveProvider(source);
      if (provider) {
        channels.add(formatProviderDisplay(source));
      }
      if (item.model) models.add(item.model);
    }
  });

  // 更新渠道下拉选项
  if (channelSelect) {
    const currentChannel = state.failureFilterChannel;
    channelSelect.innerHTML = `<option value="">${t("allChannels")}</option>` +
      Array.from(channels).sort().map((channel) => {
        const selected = channel === currentChannel ? ' selected' : '';
        return `<option value="${escapeHtml(channel)}"${selected}>${escapeHtml(channel)}</option>`;
      }).join('');
  }

  // 保存当前选中值
  const currentModel = state.failureFilterModel;

  // 更新模型下拉选项
  modelSelect.innerHTML = `<option value="">${t("allModels")}</option>` +
    Array.from(models).sort().map((model) => {
      const selected = model === currentModel ? ' selected' : '';
      return `<option value="${escapeHtml(model)}"${selected}>${escapeHtml(model)}</option>`;
    }).join('');
}

// 初始化日志时间选择按钮
function initLogTimeButtons() {
  document.querySelectorAll(".log-time-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".log-time-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      const days = btn.dataset.days;
      const datePicker = document.getElementById("log-date-picker");

      if (days === "custom") {
        if (datePicker) datePicker.classList.add("active");
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        const startInput = document.getElementById("log-start-date");
        const endInput = document.getElementById("log-end-date");
        if (startInput && !startInput.value) startInput.value = formatDateForInput(weekAgo);
        if (endInput && !endInput.value) endInput.value = formatDateForInput(today);
      } else {
        if (datePicker) datePicker.classList.remove("active");
        state.logTimeDays = Number(days);
        state.logCustomRange = null;
        state.logPage = 1;
        updateLogTable(state.currentDetails);
      }
    });
  });

  const logApplyBtn = document.getElementById("log-date-apply");
  if (logApplyBtn) {
    logApplyBtn.addEventListener("click", () => {
      const startInput = document.getElementById("log-start-date");
      const endInput = document.getElementById("log-end-date");
      if (startInput?.value && endInput?.value) {
        const startDate = new Date(startInput.value);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endInput.value);
        endDate.setHours(23, 59, 59, 999);

        if (startDate <= endDate) {
          state.logCustomRange = { start: startDate, end: endDate };
          state.logTimeDays = "custom";
          state.logPage = 1;
          updateLogTable(state.currentDetails);
        }
      }
    });
  }
}

// 初始化日志自动刷新
function initLogAutoRefresh() {
  const select = document.getElementById("log-auto-refresh");
  if (!select) return;

  // 更新倒计时显示
  const updateCountdownDisplay = () => {
    const el = document.getElementById("log-last-update");
    if (!el) return;
    if (state.logCountdown > 0) {
      el.textContent = t("refreshInSeconds", { seconds: state.logCountdown });
    } else {
      el.textContent = t("refreshing");
    }
  };

  // 启动倒计时
  const startCountdown = (seconds) => {
    // 清除现有定时器
    if (state.logAutoRefreshInterval) {
      clearInterval(state.logAutoRefreshInterval);
      state.logAutoRefreshInterval = null;
    }
    if (state.logCountdownInterval) {
      clearInterval(state.logCountdownInterval);
      state.logCountdownInterval = null;
    }

    if (seconds <= 0) {
      const el = document.getElementById("log-last-update");
      if (el) el.textContent = t("manualRefresh");
      return;
    }

    state.logCountdown = seconds;
    updateCountdownDisplay();

    // 每秒更新倒计时
    state.logCountdownInterval = setInterval(() => {
      state.logCountdown--;
      updateCountdownDisplay();
      if (state.logCountdown <= 0) {
        clearInterval(state.logCountdownInterval);
        state.logCountdownInterval = null;
        fetchUsageForLog().then(() => {
          // 刷新完成后重新开始倒计时
          const currentSeconds = Number(select.value);
          if (currentSeconds > 0) {
            startCountdown(currentSeconds);
          }
        });
      }
    }, 1000);
  };

  select.addEventListener("change", () => {
    const seconds = Number(select.value);
    startCountdown(seconds);
  });

  // 页面加载时根据默认选项启动倒计时
  const initialSeconds = Number(select.value);
  if (initialSeconds > 0) {
    startCountdown(initialSeconds);
  }
}

// 按指定天数过滤详情数据（同时应用Key筛选）
function filterDetailsByDays(details, days) {
  if (!details.length) return [];
  const keyFilter = state.keyFilter.toLowerCase();
  const rangeStart = getRangeStart(days);
  return details.filter((item) => {
    if (keyFilter && !item.api.toLowerCase().includes(keyFilter))
      return false;
    if (item.timestamp && item.timestamp < rangeStart)
      return false;
    return true;
  });
}

// 按自定义日期范围过滤详情数据
function filterDetailsByCustomRange(details, range) {
  if (!details.length || !range) return [];
  const keyFilter = state.keyFilter.toLowerCase();
  return details.filter((item) => {
    if (keyFilter && !item.api.toLowerCase().includes(keyFilter))
      return false;
    if (item.timestamp) {
      if (item.timestamp < range.start || item.timestamp > range.end)
        return false;
    }
    return true;
  });
}

// 格式化日期为 input[type="date"] 所需的 YYYY-MM-DD 格式
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 格式化自定义日期范围为显示文本
function formatCustomRangeLabel(range) {
  if (!range) return "";
  const startStr = `${range.start.getMonth() + 1}/${range.start.getDate()}`;
  const endStr = `${range.end.getMonth() + 1}/${range.end.getDate()}`;
  return `${startStr} - ${endStr}`;
}

function formatProviderModelLabel(providerName, model) {
  if (!providerName) return model;
  return state.currentLang === "zh" ? `${providerName} 的 ${model}` : `${model} from ${providerName}`;
}

// ========== URL 参数书签功能 ==========

// 解析 URL 参数
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get("view"),
    api: params.get("api"),
    model: params.get("model"),
    source: params.get("source"),
    status: params.get("status"),
  };
}

// 根据当前筛选条件生成书签 URL（只保留 view=logs，不包含筛选参数）
function generateBookmarkUrl() {
  const url = new URL(window.location.href.split("?")[0]);
  url.searchParams.set("view", "logs");
  return url.toString();
}

// 更新浏览器 URL（不刷新页面）
function updateBrowserUrl() {
  const url = generateBookmarkUrl();
  window.history.replaceState({}, "", url);
}

// 应用 URL 参数到日志筛选器
function applyUrlParamsToFilters(params) {
  if (params.api) {
    state.logFilterApi = params.api;
    const apiSelect = document.getElementById("log-filter-api");
    if (apiSelect) apiSelect.value = params.api;
  }
  if (params.model) {
    state.logFilterModel = params.model;
    const modelSelect = document.getElementById("log-filter-model");
    if (modelSelect) modelSelect.value = params.model;
  }
  if (params.source) {
    state.logFilterSource = params.source;
    const sourceSelect = document.getElementById("log-filter-source");
    if (sourceSelect) sourceSelect.value = params.source;
  }
  if (params.status) {
    state.logFilterStatus = params.status;
    const statusSelect = document.getElementById("log-filter-status");
    if (statusSelect) statusSelect.value = params.status;
  }
}

// 滚动到日志区域
function scrollToLogs() {
  const logsSection = document.getElementById("nav-logs");
  if (logsSection) {
    // 延迟滚动以确保数据加载完成
    setTimeout(() => {
      logsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }
}

// 初始化 URL 参数书签功能
function initUrlBookmark() {
  const params = parseUrlParams();

  // 如果 URL 包含 view=logs 参数，应用筛选并滚动到日志区域
  if (params.view === "logs") {
    // 等待数据加载完成后应用筛选
    const checkAndApply = () => {
      if (state.currentDetails.length > 0 || state.details.length > 0) {
        applyUrlParamsToFilters(params);
        updateLogTable(state.currentDetails.length > 0 ? state.currentDetails : state.details);
        scrollToLogs();
      } else {
        // 数据还未加载，稍后重试
        setTimeout(checkAndApply, 200);
      }
    };
    checkAndApply();
  }
}

// 更新日志筛选并同步 URL
function updateLogFilterAndUrl() {
  state.logFilterApi = document.getElementById("log-filter-api")?.value || "";
  state.logFilterModel = document.getElementById("log-filter-model")?.value || "";
  state.logFilterSource = document.getElementById("log-filter-source")?.value || "";
  state.logFilterStatus = document.getElementById("log-filter-status")?.value || "";
  state.logPage = 1; // 筛选变化时重置页码
  updateLogTable(state.currentDetails);
  updateBrowserUrl();
}

// 显示禁用确认模态框（三次确认，循序渐进提示）
function showDisableConfirm(displayName) {
  return new Promise((resolve) => {
    const modal = document.getElementById("disable-confirm-modal");
    const message = document.getElementById("disable-confirm-message");
    const okBtn = document.getElementById("disable-confirm-ok");
    const cancelBtn = document.getElementById("disable-confirm-cancel");
    const closeBtn = document.getElementById("disable-confirm-close");

    let clickCount = 0;
    const warnings = state.currentLang === "zh"
      ? [
          `确定要禁用 <strong>${displayName}</strong> 吗？`,
          `<span style="color:var(--accent-yellow)">⚠️ 警告：此操作将从配置中移除该模型映射！</span>`,
          `<span style="color:var(--danger)">🚨 最后确认：禁用后需要手动重新添加才能恢复！</span>`
        ]
      : [
          `Are you sure you want to disable <strong>${displayName}</strong>?`,
          `<span style="color:var(--accent-yellow)">⚠️ Warning: this removes the model mapping from config!</span>`,
          `<span style="color:var(--danger)">🚨 Final confirmation: you'll need to add it back manually later!</span>`
        ];
    const btnTexts = state.currentLang === "zh"
      ? ["确认禁用 (3)", "我确定 (2)", "立即禁用 (1)"]
      : ["Confirm (3)", "I'm sure (2)", "Disable now (1)"];

    message.innerHTML = warnings[0];
    okBtn.textContent = btnTexts[0];
    modal.classList.add("active");

    const cleanup = (result) => {
      modal.classList.remove("active");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      closeBtn.removeEventListener("click", onCancel);
      okBtn.textContent = state.currentLang === "zh" ? "确认禁用" : `${t("confirm")} ${t("disable")}`;
      resolve(result);
    };

    const onOk = () => {
      clickCount++;
      if (clickCount >= 3) {
        cleanup(true);
      } else {
        message.innerHTML = warnings[clickCount];
        okBtn.textContent = btnTexts[clickCount];
      }
    };
    const onCancel = () => cleanup(false);

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    closeBtn.addEventListener("click", onCancel);
  });
}

// 禁用指定渠道的模型
async function disableModelFromProvider(source, modelAlias) {
  const apiUrl = (document.getElementById("api-url").value || DEFAULT_API_URL).replace(/\/$/, "");
  const secretKey = document.getElementById("secret-key").value || DEFAULT_SECRET_KEY;
  const headers = { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" };

  // 判断渠道类型
  const providerName = resolveProvider(source);
  if (!providerName) {
    throw new Error(t("cannotIdentifyChannel"));
  }

  // 目前只支持 openai-compatibility 类型
  const isOpenAICompat = providerName.toLowerCase() !== "claude" &&
    providerName.toLowerCase() !== "gemini" &&
    providerName.toLowerCase() !== "codex";

  if (!isOpenAICompat) {
    throw new Error(t("disableNotSupported", { provider: providerName }));
  }

  // 获取当前 openai-compatibility 配置
  const getResp = await fetch(`${apiUrl}/v0/management/openai-compatibility`, { headers });
  if (!getResp.ok) throw new Error(t("fetchConfigFailed", { status: getResp.status }));
  const data = await getResp.json();
  const entries = data["openai-compatibility"] || [];

  // 查找匹配的提供商
  const targetIndex = entries.findIndex(e =>
    e.name && e.name.toLowerCase() === providerName.toLowerCase()
  );
  if (targetIndex === -1) {
    throw new Error(t("providerNotFound", { provider: providerName }));
  }

  const entry = entries[targetIndex];
  const originalModels = entry.models || [];

  // 过滤掉匹配 alias 的所有模型
  const filteredModels = originalModels.filter(m =>
    m.alias !== modelAlias && m.name !== modelAlias
  );

  if (filteredModels.length === originalModels.length) {
    return { alreadyDisabled: true };
  }

  // PATCH 更新配置
  const patchResp = await fetch(`${apiUrl}/v0/management/openai-compatibility`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      name: entry.name,
      value: { models: filteredModels }
    })
  });

  if (!patchResp.ok) {
    const errText = await patchResp.text();
    throw new Error(t("updateConfigFailed", { error: errText }));
  }
}

// 渲染日志分页控件
function renderLogPagination(totalPages) {
  let container = document.getElementById("log-pagination");
  if (!container) {
    const tableWrapper = document.querySelector(".log-card .table-wrapper");
    if (tableWrapper) {
      container = document.createElement("div");
      container.id = "log-pagination";
      container.className = "log-pagination";
      tableWrapper.after(container);
    }
  }
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  const page = state.logPage;
  let html = `<button class="page-btn" data-page="1" ${page === 1 ? 'disabled' : ''}>${t("firstPage")}</button>`;
  html += `<button class="page-btn" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>${t("prevPage")}</button>`;

  // 显示页码
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>${t("nextPage")}</button>`;
  html += `<button class="page-btn" data-page="${totalPages}" ${page === totalPages ? 'disabled' : ''}>${t("lastPage")}</button>`;

  container.innerHTML = html;

  // 绑定事件
  container.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPage = Number(btn.dataset.page);
      if (targetPage && targetPage !== state.logPage) {
        state.logPage = targetPage;
        updateLogTable(state.currentDetails);
      }
    });
  });
}

// 显示消息弹窗
function showMessageModal(title, message, type = "info") {
  const modal = document.getElementById("message-modal");
  const titleEl = document.getElementById("message-modal-title");
  const contentEl = document.getElementById("message-modal-content");
  const okBtn = document.getElementById("message-modal-ok");
  const closeBtn = document.getElementById("message-modal-close");

  if (!modal || !titleEl || !contentEl) return;

  // 设置标题和内容
  titleEl.textContent = title;
  contentEl.innerHTML = message;

  // 根据类型设置样式
  if (type === "error") {
    titleEl.style.color = "var(--danger)";
    contentEl.style.color = "var(--danger)";
  } else if (type === "success") {
    titleEl.style.color = "var(--accent-green)";
    contentEl.style.color = "var(--text)";
  } else {
    titleEl.style.color = "var(--text)";
    contentEl.style.color = "var(--muted)";
  }

  modal.classList.add("active");

  // 关闭弹窗
  const closeModal = () => {
    modal.classList.remove("active");
    okBtn.removeEventListener("click", closeModal);
    closeBtn.removeEventListener("click", closeModal);
  };

  okBtn.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  // 点击遮罩关闭
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  }, { once: true });
}
