# github-dsh插件市场

DeepSeek Harness 的「github-dsh插件市场」插件 —— 浏览、搜索、一键安装 DSH 生态插件。

## 功能

- **精选目录（双源聚合）**：合并 [awesome-dsh-plugin](https://awesome-dsh-plugin.com)（1449 个）与 [dshget-data](https://github.com/bobby-sheng/dshget-data)（2460 个，聚合 hrhgit-catalog / omdsh-hub / github-topic 等 4 个商城目录），按仓库去重后约 **2830 个插件**
- **20 个中文分类** chips + 关键词实时筛选 + 星级排序 + 分页加载
- **英文描述自动翻译**：按需渐进翻译（仅翻译当前视图），译文持久化磁盘缓存，不重复消耗模型配额
- **官方一键安装**：`dsh plugin --profile web add …`（npm 优先秒装），已安装插件自动标注「已安装」
- **GitHub 全站搜索**：发现注册表外的新项目（可自定义关键词）
- **我的订阅**：git 克隆本地副本，支持一键更新 / 回滚 / 卸载
- **AI 摘要**：GitHub 搜索结果自动生成中文插件摘要（简介 / 核心功能 / 安装方法），带磁盘缓存
- 数据源每日刷新，本地磁盘缓存 24h + 面板内 30 分钟自动刷新，离线兜底

## 安装（静态版，永久常驻）

### 方式一：npm（推荐）

```bash
dsh plugin --profile web add dsw-workshop-plugin
```

重启 `dsh web` —— 侧边栏出现「github-dsh插件市场」，此后每次启动自动加载。

### 方式二：GitHub 源码（Run from source）

```bash
git clone https://github.com/Liaominduyh/GitHub-dsh-plugin-market ~/.dsh/plugins/dsw-workshop-plugin
dsh plugin --profile web add link:~/.dsh/plugins/dsw-workshop-plugin
```


## 结构

- `cordis.patch.yml` — bundle 激活补丁（`dsh plugin add` 后自动加入 profile 的 `dsh.profile.bundles`）
- `lib/index.js` — Host 侧：webServer HTTP 路由 `/dsw-workshop/api/*`（注册表聚合 / 官方安装 / 订阅管理 / 翻译 / 摘要）
- `lib/client.js` — Client 侧：`__ModuleLoader__.load` bundle（React UI + fetch 桥接）
- 运行时数据目录：`~/.dsh/plugins/dsw-workshop-plugin/data/`（subscriptions / summaries / translations / registry）

## 技术要求

- Host：普通 Cordis 插件（Node 环境），依赖 `webServer` 服务注册 HTTP 路由
- Client：`__ModuleLoader__.load` 格式浏览器 bundle，依赖 `dsh-client-runtime` / `dsh-client-ui-slots` / react
- 安装插件需要 pnpm（`dsh plugin` 依赖），GitHub 数据经 `gh` CLI / api.github.com 获取
- 官方安装的插件需重启 DSH 生效（bundle 层启动时加载）
