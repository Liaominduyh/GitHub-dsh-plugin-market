// DSH 插件市场 · Host 侧（静态版）
// 双源注册表聚合 + 官方安装 + git 订阅 + LLM 翻译/摘要，经 webServer HTTP 路由暴露给浏览器。
// 与动态版（harness.handle）不同：这里以普通 Cordis 插件运行，Node 环境（fetch/fs/child_process）全可用。
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'dsw-workshop'
export const inject = ['webServer']

const API = '/dsw-workshop/api'
const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const DATA_DIR = join(HOME, 'plugins', 'dsw-workshop-plugin', 'data')
const LEGACY_DIR = join(HOME, 'desktop-app', 'dsw-workshop')
const SUB_FILE = () => join(DATA_DIR, 'subscriptions.json')
const SUMMARY_FILE = () => join(DATA_DIR, 'summaries.json')
const TRANSLATION_FILE = () => join(DATA_DIR, 'translations.json')
const REGISTRY_FILE = () => join(DATA_DIR, 'registry.json')
const REGISTRY_META_FILE = () => join(DATA_DIR, 'registry-meta.json')

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(obj))
}

/** 统一执行 PowerShell 命令（与动态版命令字符串兼容）。 */
function runCmd(command, timeoutMs) {
  const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', command], {
    encoding: 'utf8',
    timeout: timeoutMs || 120000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  })
  if (r.error) throw new Error(String(r.error.message || r.error))
  if (r.status !== 0) {
    const msg = (r.stderr || r.stdout || '（无输出）').trim()
    throw new Error('命令失败 [' + String(command).slice(0, 120) + ']: ' + msg.slice(0, 400))
  }
  return r.stdout || ''
}

/** Node 原生 fetch（带超时）。 */
async function fetchText(url, timeoutMs) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 40000)
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'dsh-workshop' } })
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url)
    return await r.text()
  } finally {
    clearTimeout(t)
  }
}

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}
function writeJson(file, obj) {
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, JSON.stringify(obj, null, 2))
}

/** 数据目录初始化；首次运行时从旧动态版数据目录迁移已有数据。 */
function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(join(DATA_DIR, 'subscriptions.json')) && existsSync(join(LEGACY_DIR, 'subscriptions.json'))) {
    try {
      for (const f of ['subscriptions.json', 'summaries.json', 'translations.json', 'registry.json', 'registry-meta.json']) {
        const src = join(LEGACY_DIR, f)
        if (existsSync(src)) copyFileSync(src, join(DATA_DIR, f))
      }
    } catch {}
  }
}

// ---------------- git / 订阅 ----------------
function remoteHead(fullName) {
  return runCmd('gh api repos/' + fullName + '/commits/HEAD --jq .sha', 30000).trim()
}
function localHead(dir) {
  return runCmd('git -C "' + dir + '" rev-parse HEAD', 30000).trim()
}
function installViaZip(fullName, name, branch, dir) {
  const tmpRoot = join(DATA_DIR, '.tmp')
  mkdirSync(tmpRoot, { recursive: true })
  const token = runCmd('gh auth token', 15000).trim()
  const tmpZip = join(tmpRoot, name + '.zip')
  const tmpDir = join(tmpRoot, name)
  runCmd('curl.exe -sL --max-time 150 -o "' + tmpZip + '" -H "Authorization: Bearer ' + token + '" -H "User-Agent: dsh-workshop" "https://api.github.com/repos/' + fullName + '/zipball/' + branch + '"', 180000)
  runCmd('Expand-Archive -LiteralPath "' + tmpZip + '" -DestinationPath "' + tmpDir + '" -Force', 120000)
  const top = runCmd('Get-ChildItem -LiteralPath "' + tmpDir + '" | Select-Object -First 1 -ExpandProperty Name', 15000).trim()
  if (!top) throw new Error('解压内容为空')
  runCmd('Move-Item -LiteralPath "' + join(tmpDir, top) + '" -Destination "' + dir + '"', 30000)
  runCmd('Remove-Item -LiteralPath "' + tmpZip + '" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -LiteralPath "' + tmpDir + '" -Recurse -Force -ErrorAction SilentlyContinue', 20000)
  const m = /-([0-9a-f]{40})$/.exec(top)
  return m ? m[1] : ''
}

// ---------------- LLM（翻译/摘要） ----------------
async function llmOnce(ctx, system, userText, maxTokens) {
  const llm = ctx.get('llm')
  const adm = ctx.get('agentDefaultModel')
  if (!llm || !adm) throw new Error('LLM 服务不可用（未配置模型）')
  const sel = adm.currentSelection()
  if (!sel || !sel.provider || !sel.model) throw new Error('未配置默认模型')
  let out = ''
  for await (const chunk of llm.stream({
    provider: sel.provider,
    model: sel.model,
    reasoningEffort: sel.reasoningEffort,
    system,
    messages: [{
      id: 'dsw-llm',
      role: 'user',
      content: [{ type: 'text', text: userText }],
      source: { kind: 'user' },
    }],
    temperature: 0.2,
    maxTokens: maxTokens || 8000,
  })) {
    if (chunk.type === 'text-delta') out += chunk.text
  }
  if (!out.trim()) throw new Error('模型返回为空')
  return out
}

// ---------------- 注册表（双源聚合） ----------------
function inferCategory(name, desc) {
  const t = (String(name || '') + ' ' + String(desc || '')).toLowerCase()
  const rules = [
    ['theme', /(皮肤|主题|外观|美化|skin|theme|themes|配色|壁纸|换肤)/],
    ['memory', /(记忆|回忆|memory|long.?term|知识库|检索增强|rag)/],
    ['notify', /(通知|推送|提醒|notify|notification|alert|banner|消息通知)/],
    ['vision', /(视觉|图像|图片|vision|image|ocr|截图|screenshot|多模态|multimodal|看图)/],
    ['voice', /(语音|voice|tts|stt|音频|audio|配音|朗读|speech)/],
    ['browser', /(浏览器|网页|browser|crawl|抓取|scrape|爬虫|page)/],
    ['docs', /(文档|docs|markdown|渲染|render|readme|笔记|note|预览|preview|pdf|excel|表格)/],
    ['skill', /(技能|skill|skills|提示词|prompt)/],
    ['workflow', /(工作流|自动化|workflow|automation|pipeline|批量|定时|schedule)/],
    ['session', /(会话|session|聊天|对话|消息记录|历史|回复)/],
    ['model', /(模型|model|provider|供应商|api.?key|账号|计费|用量|usage|billing|token|推理|inference|额度)/],
    ['tools', /(工具|tool|命令|cli|command|集成|integration|客户端)/],
    ['fun', /(娱乐|游戏|宠物|pet|桌宠|gacha|抽卡|小游戏|game|play|摸鱼|meme|表情)/],
    ['git', /(git|代码评审|review|github.?action|ci\/?cd|commit|pr )/],
    ['security', /(安全|权限|security|脱敏|审计|审核|approve|审批|redact|sandbox|沙箱)/],
    ['remote', /(远程|remote|手机|移动|mobile|ssh|局域网|lan|内网|设备)/],
    ['market', /(市场|marketplace|market|商店|store|插件管理|安装|订阅)/],
  ]
  for (const rule of rules) if (rule[1].test(t)) return rule[0]
  return 'dev'
}

async function fetchRegistry() {
  const [awesomeText, dshgetText] = await Promise.all([
    fetchText('https://awesome-dsh-plugin.com/plugins.json', 40000),
    fetchText('https://raw.githubusercontent.com/bobby-sheng/dshget-data/main/catalog.json', 40000),
  ])
  const awesome = JSON.parse(awesomeText)
  const dshget = JSON.parse(dshgetText)
  const normUrl = (u) => String(u || '').replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase()
  const byUrl = new Map()
  for (const it of (Array.isArray(awesome.plugins) ? awesome.plugins : [])) byUrl.set(normUrl(it.url), Object.assign({}, it, { from: 'awesome' }))
  let added = 0
  for (const it of (Array.isArray(dshget.plugins) ? dshget.plugins : [])) {
    const k = normUrl(it.url)
    if (byUrl.has(k)) continue
    byUrl.set(k, Object.assign({}, it, { from: 'dshget' }))
    added++
  }
  const plugins = [...byUrl.values()].map((it) => {
    const desc = (it.description && typeof it.description === 'object') ? (it.description.zh || it.description.en || '') : String(it.description || '')
    if (it.from === 'dshget' && it.category === 'dev') {
      return Object.assign({}, it, { category: inferCategory(it.name, desc) })
    }
    return it
  })
  const data = {
    categories: (awesome.categories && typeof awesome.categories === 'object') ? awesome.categories : (dshget.categories || {}),
    plugins,
    count: plugins.length,
    updated: String(awesome.updated || dshget.updated || ''),
    sources: { awesome: (awesome.plugins || []).length, dshget: (dshget.plugins || []).length, merged: plugins.length, added },
  }
  writeJson(REGISTRY_FILE(), data)
  writeJson(REGISTRY_META_FILE(), { fetchedAt: Date.now() })
  return data
}

function mapRegistryItem(it) {
  let fullName = ''
  const um = /github\.com\/([A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+)/.exec(String(it.url || ''))
  if (um) fullName = um[1]
  const desc = (it.description && typeof it.description === 'object') ? (it.description.zh || it.description.en || '') : String(it.description || '')
  return {
    src: 'registry',
    fullName,
    name: String(it.name || ''),
    description: String(desc).slice(0, 300),
    stars: Number(it.stars || 0),
    category: String(it.category || ''),
    install: String(it.install || ''),
    npm: (it.npm && String(it.npm)) || null,
    url: String(it.url || ''),
    addedAt: String(it.added || ''),
    language: '',
    updatedAt: String(it.added || ''),
    topics: [],
  }
}

function mapItem(it) {
  return {
    src: 'github',
    fullName: String(it.full_name || ''),
    name: String(it.name || ''),
    description: String(it.description || '').slice(0, 300),
    stars: Number(it.stargazers_count || 0),
    language: String(it.language || ''),
    updatedAt: String(it.pushed_at || it.updated_at || ''),
    htmlUrl: String(it.html_url || ''),
    topics: Array.isArray(it.topics) ? it.topics.slice(0, 6).map(String) : [],
  }
}

function enc(s) {
  try {
    return String(s).replace(/[^A-Za-z0-9\-_.~]/g, (c) => {
      let out = ''
      const bytes = new TextEncoder().encode(c)
      for (const b of bytes) out += '%' + b.toString(16).toUpperCase().padStart(2, '0')
      return out
    })
  } catch { return '' }
}

// ---------------- 已安装（profile bundles） ----------------
function installedBundles() {
  try {
    const pkg = JSON.parse(readFileSync(join(HOME, 'profiles', 'web', 'package.json'), 'utf8'))
    const b = pkg && pkg.dsh && pkg.dsh.profile && pkg.dsh.profile.bundles
    return Array.isArray(b) ? b : []
  } catch { return [] }
}

// ---------------- HTTP 方法 ----------------
const handlers = {
  async openExternal(args) {
    const url = String((args && args.url) || '').trim()
    if (!/^https:\/\/github\.com\/[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(url)) return { error: '非法的链接' }
    runCmd('Start-Process "' + url + '"', 15000)
    return { ok: true }
  },

  async translate(args, ctx) {
    const text = String((args && args.text) || '').trim().slice(0, 20000)
    if (!text) return { error: '内容为空' }
    const out = await llmOnce(ctx, '你是专业的翻译引擎。把用户提供的英文内容翻译成简体中文。只输出译文本身，不要任何解释或前言；完整保留 Markdown 格式、代码块标记、链接与列表结构；专有名词可保留英文。', text, 8000)
    return { translated: out }
  },

  async getDescZh(args, ctx) {
    const fullName = String((args && args.fullName) || '').trim()
    const text = String((args && args.text) || '').trim().slice(0, 500)
    if (!fullName || !text) return { error: '参数无效' }
    const cache = readJson(TRANSLATION_FILE(), {})
    if (cache[fullName]) return { translated: cache[fullName], cached: true }
    const out = await llmOnce(ctx, '你是翻译引擎。把用户提供的英文描述翻译成简体中文，只输出译文本身，不要解释。', text, 300)
    cache[fullName] = out
    writeJson(TRANSLATION_FILE(), cache)
    return { translated: out, cached: false }
  },

  async getSummary(args, ctx) {
    const fullName = String((args && args.fullName) || '').trim()
    const raw = String((args && args.text) || '').trim().slice(0, 16000)
    const force = !!(args && args.force)
    if (!raw) return { error: '内容为空' }
    const cache = readJson(SUMMARY_FILE(), {})
    const hit = cache[fullName]
    if (hit && hit.summary && !force) return { summary: hit.summary, cached: true }
    const out = await llmOnce(ctx, '你是插件市场编辑。根据用户提供的插件 README 内容，用简体中文输出一份精炼的插件摘要，严格使用以下 Markdown 结构：\n## 插件简介\n（一两句话说明插件是什么、解决什么问题）\n## 核心功能\n（3-6 条要点列表）\n## 安装与使用\n（提取 README 中的安装步骤和命令，简洁列出；没有安装说明就写「无」）\n不要输出任何其他内容。', raw, 2000)
    cache[fullName] = { summary: out, createdAt: new Date().toISOString() }
    writeJson(SUMMARY_FILE(), cache)
    return { summary: out, cached: false }
  },

  async registry(args) {
    const force = !!(args && args.force)
    const meta = readJson(REGISTRY_META_FILE(), { fetchedAt: 0 })
    if (!force && Date.now() - Number(meta.fetchedAt || 0) < 24 * 60 * 60 * 1000) {
      const cached = readJson(REGISTRY_FILE(), null)
      if (cached && Array.isArray(cached.plugins) && cached.sources) {
        return { categories: cached.categories || {}, plugins: cached.plugins.map(mapRegistryItem), count: cached.plugins.length, updated: String(cached.updated || ''), cached: true, sources: cached.sources || null }
      }
    }
    const data = await fetchRegistry()
    return { categories: data.categories || {}, plugins: data.plugins.map(mapRegistryItem), count: data.plugins.length, updated: String(data.updated || ''), cached: false, sources: data.sources || null }
  },

  async installed() {
    return { installed: installedBundles() }
  },

  async installOfficial(args) {
    const spec = String((args && args.spec) || '').trim().slice(0, 300)
    if (!spec) return { error: '缺少安装参数' }
    const okSpec = /^[A-Za-z0-9@_.\-\/]+$/.test(spec) || /^github:[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(spec) || /^https:\/\/github\.com\/[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+(\/|$)/.test(spec)
    if (!okSpec) return { error: '非法的安装来源：' + spec }
    try {
      const out = runCmd('dsh plugin --profile web add ' + spec, 300000)
      return { ok: true, output: String(out).slice(-800) }
    } catch (err) {
      return { error: String((err && err.message) || err).slice(-1500) }
    }
  },

  async listTopic(args) {
    const topicsArg = (args && Array.isArray(args.topics) && args.topics.length > 0) ? args.topics : ['deepseek-harness-plugin']
    const topics = topicsArg.map((t) => String(t).replace(/[^A-Za-z0-9\-]/g, '').slice(0, 50)).filter((t) => t)
    if (topics.length === 0) return { error: '无效的 topic' }
    let raw = []
    for (const topic of topics) {
      const maxPages = topic === 'dsh-plugin' ? 2 : 5
      let page = 1
      while (page <= maxPages) {
        const out = runCmd('gh api "search/repositories?q=topic:' + topic + '&sort=stars&order=desc&per_page=100&page=' + page + '"', 30000)
        const data = JSON.parse(out)
        if (!data || !Array.isArray(data.items) || data.items.length === 0) break
        raw = raw.concat(data.items)
        if (data.items.length < 100) break
        page++
      }
    }
    const seen = {}
    const dedup = []
    for (const it of raw) {
      if (!it.full_name || seen[it.full_name]) continue
      seen[it.full_name] = true
      dedup.push(it)
    }
    dedup.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    return { items: dedup.map(mapItem), total: dedup.length }
  },

  async search(args) {
    const q = String((args && args.q) || 'deepseek-harness').trim().slice(0, 100)
    if (!q) return { error: '搜索词为空' }
    const out = runCmd('gh api "search/repositories?q=' + enc(q) + '&sort=stars&order=desc&per_page=30"', 30000)
    const data = JSON.parse(out)
    if (!data || !Array.isArray(data.items)) return { error: 'GitHub 返回格式异常' }
    return { items: data.items.map(mapItem) }
  },

  async readme(args) {
    const fullName = String((args && args.fullName) || '').trim()
    if (!/^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(fullName)) return { error: '无效的仓库名' }
    const out = runCmd('gh api "repos/' + fullName + '/readme" -H "Accept: application/vnd.github.raw"', 30000)
    return { readme: out }
  },

  async prepareInstall(args) {
    const fullName = String((args && args.fullName) || '').trim()
    if (!/^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(fullName)) return { error: '无效的仓库名' }
    const subs = readJson(SUB_FILE(), [])
    if (subs.some((s) => s.fullName === fullName)) return { error: '该插件已订阅' }
    const name = fullName.split('/')[1]
    const dir = join(DATA_DIR, name)
    const meta = JSON.parse(runCmd('gh api repos/' + fullName + ' --jq "{default_branch: .default_branch, stars: .stargazers_count}"', 30000))
    return { ok: true, dir, branch: meta.default_branch || 'main', stars: Number(meta.stars || 0) }
  },

  async install(args) {
    const fullName = String((args && args.fullName) || '').trim()
    if (!/^[A-Za-z0-9_.\-]+\/[A-Za-z0-9_.\-]+$/.test(fullName)) return { error: '无效的仓库名' }
    const subs = readJson(SUB_FILE(), [])
    if (subs.some((s) => s.fullName === fullName)) return { error: '该插件已订阅' }
    const name = fullName.split('/')[1]
    const dir = join(DATA_DIR, name)
    const meta = JSON.parse(runCmd('gh api repos/' + fullName + ' --jq "{default_branch: .default_branch, stars: .stargazers_count}"', 30000))
    const branch = meta.default_branch || 'main'
    mkdirSync(DATA_DIR, { recursive: true })
    let localCommit = ''
    let viaZip = false
    let usedMethod = ''
    try {
      runCmd('git clone https://github.com/' + fullName + '.git "' + dir + '"', 180000)
      usedMethod = 'https'
    } catch (e1) {
      try {
        runCmd('git clone git@github.com:' + fullName + '.git "' + dir + '"', 180000)
        usedMethod = 'ssh'
      } catch (e2) {
        localCommit = installViaZip(fullName, name, branch, dir)
        viaZip = true
        usedMethod = 'zip'
      }
    }
    if (!viaZip) localCommit = localHead(dir)
    const remoteCommit = remoteHead(fullName)
    subs.push({
      fullName, name, localPath: dir, localCommit, remoteCommit,
      installedAt: new Date().toISOString(), stars: Number(meta.stars || 0), defaultBranch: branch, viaZip,
    })
    writeJson(SUB_FILE(), subs)
    return { ok: true, method: usedMethod }
  },

  async subscriptions() {
    const subs = readJson(SUB_FILE(), [])
    const out = []
    for (const s of subs) {
      const item = { fullName: s.fullName, name: s.name, localPath: s.localPath, stars: s.stars || 0, installedAt: s.installedAt, viaZip: !!s.viaZip, hasUpdate: false, localCommit: '', remoteCommit: '', error: '' }
      try {
        const remote = remoteHead(s.fullName)
        item.remoteCommit = remote
        let local = s.localCommit || ''
        if (!s.viaZip) {
          try { local = localHead(s.localPath) } catch { /* 目录可能被删 */ }
        }
        item.localCommit = local
        item.hasUpdate = !!(remote && local && remote !== local)
      } catch (e) {
        item.error = String((e && e.message) || e).slice(0, 200)
      }
      out.push(item)
    }
    return { subs: out }
  },

  async update(args) {
    const fullName = String((args && args.fullName) || '').trim()
    const subs = readJson(SUB_FILE(), [])
    const idx = subs.findIndex((s) => s.fullName === fullName)
    if (idx < 0) return { error: '未找到订阅' }
    const s = subs[idx]
    if (s.viaZip) {
      const commit = installViaZip(fullName, s.name, s.defaultBranch || 'main', s.localPath)
      s.localCommit = commit || (await remoteHead(fullName))
      s.viaZip = true
      s.method = 'zip'
    } else {
      const before = localHead(s.localPath)
      const branch = (runCmd('git -C "' + s.localPath + '" rev-parse --abbrev-ref HEAD', 30000).trim()) || s.defaultBranch || 'main'
      let updated = false
      try {
        runCmd('git -C "' + s.localPath + '" pull --ff-only', 180000)
        s.method = 'git-https'
        updated = true
      } catch (e1) {
        try {
          runCmd('git -C "' + s.localPath + '" pull --ff-only "git@github.com:' + fullName + '.git" "' + branch + '"', 180000)
          s.method = 'git-ssh'
          updated = true
        } catch (e2) {
          runCmd('Remove-Item -LiteralPath "' + s.localPath + '" -Recurse -Force -ErrorAction SilentlyContinue', 60000)
          const commit = installViaZip(fullName, s.name, branch, s.localPath)
          s.localCommit = commit || remoteHead(fullName)
          s.viaZip = true
          s.method = 'zip'
          updated = true
        }
      }
      if (updated && !s.viaZip) {
        s.localCommit = localHead(s.localPath)
        s.beforeCommit = before
      }
    }
    s.remoteCommit = remoteHead(fullName)
    writeJson(SUB_FILE(), subs)
    return { ok: true, method: s.method }
  },

  async rollback(args) {
    const fullName = String((args && args.fullName) || '').trim()
    const subs = readJson(SUB_FILE(), [])
    const idx = subs.findIndex((s) => s.fullName === fullName)
    if (idx < 0) return { error: '未找到订阅' }
    const s = subs[idx]
    if (s.viaZip) return { error: '压缩包安装的插件不支持回滚，可卸载后重新订阅' }
    try {
      runCmd('git -C "' + s.localPath + '" reset --hard HEAD~1', 60000)
    } catch {
      return { error: '没有更早的版本可回滚' }
    }
    s.localCommit = localHead(s.localPath)
    writeJson(SUB_FILE(), subs)
    return { ok: true }
  },

  async uninstall(args) {
    const fullName = String((args && args.fullName) || '').trim()
    const subs = readJson(SUB_FILE(), [])
    const idx = subs.findIndex((s) => s.fullName === fullName)
    if (idx < 0) return { error: '未找到订阅' }
    const s = subs[idx]
    runCmd('Remove-Item -LiteralPath "' + s.localPath + '" -Recurse -Force -ErrorAction SilentlyContinue', 60000)
    subs.splice(idx, 1)
    writeJson(SUB_FILE(), subs)
    return { ok: true }
  },
}

export function apply(ctx) {
  ensureDataDir()
  const disposer = ctx.webServer.register({
    kind: 'prefix',
    path: API,
    handler: async (req, res) => {
      if (req.headers['x-dsw-workshop'] !== '1') return sendJson(res, 403, { error: 'forbidden' })
      let url
      try { url = new URL(req.url, 'http://localhost') } catch { return sendJson(res, 400, { error: 'bad request' }) }
      const method = url.pathname.slice(API.length + 1)
      const fn = handlers[method]
      if (!fn) return sendJson(res, 404, { error: '未知方法: ' + method })
      const args = Object.fromEntries(url.searchParams)
      try {
        const result = await fn(args, ctx)
        sendJson(res, 200, result)
      } catch (err) {
        sendJson(res, 200, { error: String((err && err.message) || err).slice(0, 400) })
      }
    },
  })
  ctx.effect(() => disposer)
}
