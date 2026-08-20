# dsw-workshop-plugin · GitHub 插件市场（DSH）

DeepSeek Harness 内置的「GitHub 插件市场」动态 Cordis 插件 —— 浏览、搜索、一键安装 DSH 生态插件。

> 本仓库存放该动态插件的**完整源码备份**（`plugin-source.js`）。动态插件定义只存在于进程内存，DSH 重启后需要重新激活；本仓库即恢复用的权威来源。

## 功能

- **精选目录（双源聚合）**：合并 [awesome-dsh-plugin](https://awesome-dsh-plugin.com)（1449 个）与 [dshget-data](https://github.com/bobby-sheng/dshget-data)（2460 个，聚合 hrhgit-catalog / omdsh-hub / github-topic 等 4 个商城目录），按仓库去重后约 **2830 个插件**
- **20 个中文分类** chips + 关键词实时筛选 + 星级排序 + 分页加载
- **英文描述自动翻译**：按需渐进翻译（仅翻译当前视图），译文持久化磁盘缓存，不重复消耗模型配额
- **官方一键安装**：`dsh plugin --profile web add …`（npm 优先秒装），已安装插件自动标注「已安装」
- **GitHub 全站搜索**：发现注册表外的新项目（可自定义关键词）
- **我的订阅**：git 克隆本地副本，支持一键更新 / 回滚 / 卸载
- **AI 摘要**：GitHub 搜索结果自动生成中文插件摘要（简介 / 核心功能 / 安装方法），带磁盘缓存
- 数据源每日刷新，本地磁盘缓存 24h + 面板内 30 分钟自动刷新，离线兜底

## 恢复方法（DSH 重启后）

1. 读取 `plugin-source.js`（`module.exports = { host, client }`，均为函数体字符串）
2. 用 cordis_define 重新定义：`{ plugin: { kind: 'new', idPrefix: 'dsw' }, code: { host: source.host, client: source.client } }`
3. cordis_run 激活，刷新页面

或直接对我说「启动插件市场」，我会读取本仓库源码自动恢复。

## 数据位置

- 订阅 / 摘要 / 译文缓存：`<DSH 工作目录>/dsw-workshop/`（`subscriptions.json`、`summaries.json`、`translations.json`、`registry.json`）
- 这些数据不受 DSH 重启影响，恢复插件后自动继续使用

## 技术要求

- 动态 Cordis 插件（Host + Client），依赖 DSH 的 `harness`、`shell`、`fs`、`llm`、`slots`、`timer` 等能力
- 安装插件需要 pnpm（`dsh plugin` 依赖），GitHub 数据经 `gh` CLI / api.github.com 获取
- 官方安装的插件需重启 DSH 生效（bundle 层启动时加载）
