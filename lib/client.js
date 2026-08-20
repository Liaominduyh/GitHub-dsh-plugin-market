// DSH 插件市场 · Client 侧（静态版）
// __ModuleLoader__.load 格式的浏览器 bundle：React UI + fetch 桥接 host HTTP API。
window.__ModuleLoader__.load({ id: 'dsw-workshop-plugin', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

let React = null
try { React = require('react') } catch (e) { React = null }

const TAG = '[dsw-workshop]'
const HOST_API = '/dsw-workshop/api'

async function apiFetch(method, args) {
  try {
    const q = new URLSearchParams(args || {}).toString()
    const r = await window.fetch(HOST_API + '/' + method + (q ? '?' + q : ''), { headers: { 'X-DSW-Workshop': '1' } })
    const raw = await r.text()
    let data = null
    try { data = JSON.parse(raw) } catch (e) { data = { error: String(raw || '').slice(0, 300) } }
    return data
  } catch (e) {
    return { error: String((e && e.message) || e) }
  }
}

const CSS = '[class$="_footerActions"]{flex-wrap:wrap}' +
  '[class$="_collapsed"] [class$="_footerActions"]{flex-wrap:nowrap}' +
  '.dsw-trigger{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;gap:0;padding:0;background:0 0;border:none;color:var(--dsw-alias-label-primary);cursor:pointer;font-family:inherit;font-size:14px;flex:0 0 auto;overflow:hidden;order:-1}.dsw-trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}' +
  '.dsw-trigger.wide{width:100%;height:49px;border-radius:12px;justify-content:flex-start;gap:0;padding:0 8px 0 6px;margin-bottom:2px;flex:0 0 100%}' +
  '.dsw-trigger-name{display:flex;align-items:center;gap:9px;flex:1;min-width:0;overflow:hidden;white-space:nowrap}.dsw-trigger-text{text-overflow:ellipsis;overflow:hidden;white-space:nowrap}' +
  '.dsw-cart-icon{flex:none;display:block}.dsw-trigger-count{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;font-size:12px;line-height:16px;white-space:nowrap;margin-left:8px}.dsw-trigger-count-num{color:#22c55e;font-weight:600}' +
  '.dsw-mask{position:fixed;inset:0;background:rgba(10,12,18,.6);z-index:9990;display:flex;align-items:center;justify-content:center;pointer-events:auto;font-family:system-ui,-apple-system,\'Segoe UI\',\'Microsoft YaHei\',sans-serif;font-size:14px}' +
  '.dsw-panel{width:min(1120px,94vw);height:min(760px,90vh);background:#fff;color:#1b1d22;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);pointer-events:auto;border:1px solid #d9dce3}' +
  '.dsw-header{display:flex;gap:10px;align-items:center;padding:10px 18px;border-bottom:1px solid #e4e7ec;position:relative}.dsw-logo{font-weight:700;font-size:15px;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}.dsw-logo-text{display:inline}' +
  '.dsw-header-search{flex:1;display:flex;gap:8px;align-items:center;min-width:0;margin-right:44px}.dsw-header-search .dsw-search{padding:6px 10px;font-size:12.5px}.dsw-close{position:absolute;top:50%;right:16px;transform:translateY(-50%);padding:8px 12px}' +
  '.dsw-tabs{display:flex;gap:4px;background:#e9ecf1;border:1px solid #d5d9e0;border-radius:9px;padding:3px}.dsw-tab{padding:6px 16px;border:none;border-radius:7px;background:transparent;color:#4a5261;cursor:pointer;font-size:13px;font-family:inherit;font-weight:500}.dsw-tab:hover{background:rgba(255,255,255,.6);color:#1b1d22}.dsw-tab.active{background:#fff;color:#1d3fd6;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.15);border:1px solid #c9ced8}' +
  '.dsw-chips{display:flex;gap:8px;align-items:center;padding:10px 18px;border-bottom:1px solid #eef0f4}.dsw-chips-scroll{display:flex;gap:6px;overflow-x:auto;flex:1;padding-bottom:2px;scrollbar-width:thin}.dsw-chip{padding:4px 12px;border-radius:999px;border:1px solid #d5d8df;background:#f5f6f8;color:#33363d;cursor:pointer;font-size:12px;font-family:inherit;white-space:nowrap;flex:none}.dsw-chip:hover{background:#e8ebf1}.dsw-chip.active-chip{background:#e5ecff;border-color:#3b6ef5;color:#1d3fd6;font-weight:600}' +
  '.dsw-badge.cat{background:#f0ebff;color:#7c3aed;white-space:nowrap}' +
  '.dsw-total{font-size:12px;color:#6b7280;padding:8px 18px 0}.dsw-total.localizing{color:#3b6ef5}' +
  '.dsw-search{flex:1;padding:8px 12px;border-radius:8px;border:1px solid #d5d8df;background:#f5f6f8;color:#1b1d22;font-size:13px;outline:none;min-width:120px}.dsw-search:focus{border-color:#3b6ef5}' +
  '.dsw-btn{padding:8px 14px;border-radius:8px;border:1px solid #d5d8df;background:#f5f6f8;color:#1b1d22;cursor:pointer;font-size:13px;white-space:nowrap;font-family:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px}.dsw-btn.primary{background:#3b6ef5;border-color:#3b6ef5;color:#fff}.dsw-btn.danger{color:#dc2626;border-color:#f0c4c4}.dsw-btn.small{padding:4px 10px;font-size:12px;border-radius:7px}.dsw-btn:hover:not(:disabled){filter:brightness(.96)}.dsw-btn:disabled{opacity:.55;cursor:default}' +
  '.dsw-btn.gh-open{background:#f5f6f8;border-color:#d5d8df;color:#1b1d22}.dsw-btn.gh-open:hover{color:#3b6ef5;border-color:#3b6ef5}' +
  '.dsw-btn.done{background:#e6f7ec;border-color:#b7e3c4;color:#16803c}' +
  '.dsw-btn.refresh-summary{margin-left:auto;color:#3b6ef5;border-color:#c9d8f5;background:#eef4ff}' +
  '.dsw-body{flex:1;display:flex;min-height:0}' +
  '.dsw-list{width:360px;min-width:300px;overflow-y:auto;border-right:1px solid #e7e9ee;padding:6px 0}.dsw-more{display:block;margin:12px auto;width:fit-content}' +
  '.dsw-card{display:block;width:100%;text-align:left;padding:12px 16px;border:none;border-bottom:1px solid #f0f2f5;background:transparent;color:#1b1d22;cursor:pointer;font-family:inherit}.dsw-card:hover{background:#f5f7fb}.dsw-card.selected{background:#eaf1ff}' +
  '.dsw-card-title{display:flex;gap:8px;align-items:center;font-weight:600;font-size:13.5px;margin-bottom:4px}.dsw-stars{color:#d97706;font-size:12px;white-space:nowrap}.dsw-card-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}' +
  '.dsw-badge{font-size:10.5px;padding:1px 7px;border-radius:999px;background:#e5ecff;color:#3b6ef5;white-space:nowrap}.dsw-badge.warn{background:#fdeaea;color:#dc2626}.dsw-badge.ok{background:#e6f7ec;color:#16803c}' +
  '.dsw-card-desc{font-size:12.5px;color:#6b7280;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:6px}' +
  '.dsw-card-meta{font-size:11.5px;color:#9ca3af}' +
  '.dsw-detail{flex:1;overflow-y:auto;padding:20px 26px}.dsw-detail-body{max-width:760px}' +
  '.dsw-detail h2{margin:0 0 6px;font-size:20px}.dsw-detail h3{margin:14px 0 8px;font-size:15px}.dsw-detail h4{font-size:14px}.dsw-detail h5,.dsw-detail h6{font-size:13px}' +
  '.dsw-meta-line{font-size:12.5px;color:#6b7280;margin-bottom:8px}.dsw-detail-actions{display:flex;gap:10px;align-items:center;margin-bottom:4px}.dsw-subscribed-tag{font-size:12.5px;color:#16803c;background:#e6f7ec;padding:3px 10px;border-radius:7px}.dsw-desc{font-size:13.5px;color:#4b5563;margin:10px 0}.dsw-desc-zh{font-size:13px;color:#3f6ad8;background:#f2f6ff;border-left:3px solid #3b6ef5;padding:8px 12px;border-radius:4px;margin:8px 0}' +
  '.dsw-summary{border:1px solid #d8e2f5;background:#f7f9ff;border-radius:10px;padding:14px 16px;margin:12px 0}.dsw-summary-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}.dsw-summary-title{font-weight:700;font-size:14px;color:#1d3fd6}.dsw-summary-loading{font-size:12px;color:#9ca3af}.dsw-summary-err{font-size:12.5px;color:#dc2626}.dsw-summary-body{font-size:13.5px;line-height:1.7}.dsw-summary-body h3{margin:10px 0 6px;font-size:14px;color:#1b1d22}.dsw-summary-body ul{margin:4px 0;padding-left:20px}' +
  '.dsw-hint{color:#9ca3af;text-align:center;padding:48px 20px;font-size:13px;white-space:pre-line}.dsw-error{color:#dc2626;padding:20px;font-size:13px;word-break:break-all}' +
  '.dsw-msg{padding:8px 14px;font-size:12.5px;border-radius:8px;margin:10px 18px;flex:none}.dsw-msg.ok{background:#e6f7ec;color:#16803c}.dsw-msg.err{background:#fdeaea;color:#dc2626}' +
  '.dsw-subs-pane{flex:1;overflow-y:auto;padding:6px 18px 20px}.dsw-subs-toolbar{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eef0f4;margin-bottom:8px}.dsw-subs-count{font-size:12.5px;color:#6b7280}' +
  '.dsw-subs-list{display:flex;flex-direction:column;gap:10px;padding-top:6px}' +
  '.dsw-sub{border:1px solid #e5e8ee;border-radius:10px;padding:12px 14px;background:#fafbfc}.dsw-sub-head{display:flex;gap:10px;align-items:center;margin-bottom:6px}.dsw-sub-name{font-weight:600;font-size:14px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
  '.dsw-sub-path{font-size:11.5px;color:#9ca3af;font-family:Consolas,\'Courier New\',monospace;word-break:break-all;margin-bottom:8px}.dsw-sub-err{font-size:11.5px;color:#dc2626;margin-bottom:6px}.dsw-sub-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
  '.dsw-confirm-mask{position:absolute;inset:0;background:rgba(15,17,23,.45);z-index:20;display:flex;align-items:center;justify-content:center;pointer-events:auto}.dsw-confirm-mask .dsw-confirm{pointer-events:auto}.dsw-confirm{width:min(480px,86%);background:#fff;color:#1b1d22;border-radius:12px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
  '.dsw-confirm-title{font-size:15px;font-weight:700;margin-bottom:6px}.dsw-confirm-name{font-size:12.5px;color:#6b7280;margin-bottom:10px}.dsw-confirm-detail{font-size:13px;line-height:1.6;background:#f6f8fa;border-radius:8px;padding:10px 12px;white-space:pre-wrap;word-break:break-all;color:#3f4652;margin-bottom:14px}.dsw-confirm-actions{display:flex;gap:10px;justify-content:flex-end}' +
  '.dsw-install{border:1px solid #d5e2fa;background:#f4f8ff;border-radius:10px;padding:14px 16px;margin:14px 0}.dsw-install-title{font-weight:600;font-size:13.5px;margin-bottom:10px}.dsw-install-block{margin:8px 0 0;white-space:pre-wrap;word-break:break-word}' +
  '.dsw-readme{font-size:13.5px;line-height:1.7;color:#1b1d22}.dsw-readme pre{background:#f6f8fa;border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12.5px;font-family:Consolas,\'Courier New\',monospace;white-space:pre-wrap;word-break:break-word}.dsw-readme code{background:#f1f3f7;border-radius:4px;padding:1px 5px;font-size:12.5px;font-family:Consolas,\'Courier New\',monospace}.dsw-readme pre code{background:none;padding:0}.dsw-readme a{color:#3b6ef5;text-decoration:none}.dsw-readme ul{padding-left:20px;margin:6px 0}.dsw-readme blockquote{border-left:3px solid #d5d8df;margin:8px 0;padding:2px 12px;color:#6b7280}' +
  '@media (prefers-color-scheme:dark){.dsw-panel{background:#16181d;color:#e8eaee;border-color:#2a2e37}.dsw-header{border-color:#262a33}.dsw-tabs{background:#20242c;border-color:#333947}.dsw-tab{color:#aab2bf}.dsw-tab:hover{background:#2a2f3a;color:#fff}.dsw-tab.active{background:#3a4150;color:#9db8ff;border-color:#4a5468}.dsw-chips{border-color:#262a33}.dsw-chip{background:#22262f;border-color:#333947;color:#e6e8ee}.dsw-chip:hover{background:#2a2f3a}.dsw-chip.active-chip{background:#233052;border-color:#3b6ef5;color:#9db8ff}.dsw-total{color:#9aa1ad}.dsw-total.localizing{color:#9db8ff}.dsw-search{background:#22262f;border-color:#333947;color:#e6e8ee}.dsw-btn{background:#22262f;border-color:#333947;color:#e6e8ee}.dsw-btn.primary{background:#3b6ef5;border-color:#3b6ef5;color:#fff}.dsw-btn.danger{color:#f28b82;border-color:#6b3232}.dsw-btn.gh-open{color:#e6e8ee;border-color:#333947;background:#22262f}.dsw-btn.gh-open:hover{color:#9db8ff;border-color:#3b6ef5}.dsw-btn.refresh-summary{color:#9db8ff;border-color:#3b4a6b;background:#1c2942}.dsw-card{border-color:#1e222b}.dsw-card:hover{background:#1d2129}.dsw-card.selected{background:#1c2942}.dsw-sub{background:#1c1f27;border-color:#262a33}.dsw-badge{background:#233052;color:#8fb0ff}.dsw-badge.warn{background:#4a2424;color:#ff9d94}.dsw-badge.ok{background:#1d3a2b;color:#7fdca6}.dsw-card-desc{color:#9aa1ad}.dsw-card-meta{color:#6b7280}.dsw-meta-line{color:#9aa1ad}.dsw-desc{color:#b3b9c4}.dsw-desc-zh{color:#9db8ff;background:#1c2942;border-left-color:#3b6ef5}.dsw-summary{background:#182036;border-color:#243353}.dsw-summary-title{color:#9db8ff}.dsw-summary-body h3{color:#e6e8ee}.dsw-msg.ok{background:#1d3a2b;color:#7fdca6}.dsw-msg.err{background:#4a2424;color:#ff9d94}.dsw-subscribed-tag{background:#1d3a2b;color:#7fdca6}.dsw-subs-count{color:#9aa1ad}.dsw-sub-path{color:#6b7280}.dsw-confirm{background:#1e222b;color:#e6e8ee}.dsw-confirm-name{color:#9aa1ad}.dsw-confirm-detail{background:#12141a;color:#c6ccd6}.dsw-install{background:#16213a;border-color:#243353}.dsw-install-title{color:#c7d8f5}.dsw-readme{color:#e6e8ee}.dsw-readme pre{background:#0f1117}.dsw-readme code{background:#232833}.dsw-readme blockquote{border-color:#333947;color:#9aa1ad}.dsw-list{border-color:#262a33}.dsw-btn.done{background:#1d3a2b;border-color:#2c5a3e;color:#7fdca6}}'

// ---------------- 状态 store ----------------
const store = { open: false, listeners: new Set() }
const setOpen = (v) => {
  store.open = !!v
  store.listeners.forEach((fn) => fn())
}
function useOpen() {
  const [open, set] = React.useState(store.open)
  React.useEffect(() => {
    const fn = () => set(store.open)
    store.listeners.add(fn)
    return () => { store.listeners.delete(fn) }
  }, [])
  return open
}

const subsCountStore = { count: 0, listeners: new Set() }
const setSubsCount = (n) => {
  subsCountStore.count = n
  subsCountStore.listeners.forEach((fn) => fn())
}
function useSubsCount() {
  const [count, set] = React.useState(subsCountStore.count)
  React.useEffect(() => {
    const fn = () => set(subsCountStore.count)
    subsCountStore.listeners.add(fn)
    return () => { subsCountStore.listeners.delete(fn) }
  }, [])
  return count
}

function CartIcon(props) {
  return React.createElement('svg', {
    className: props.className || 'dsw-cart-icon',
    viewBox: '0 0 24 24',
    width: props.size || 16,
    height: props.size || 16,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  },
    React.createElement('circle', { cx: 9, cy: 21, r: 1 }),
    React.createElement('circle', { cx: 20, cy: 21, r: 1 }),
    React.createElement('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }),
  )
}

const searchCache = {}
const topicCache = {}
const detailCache = {}
const descZhCache = {}
const summaryCache = {}
const registryCacheStore = { data: null, fetchedAt: 0 }

const fmtDate = (s) => {
  if (!s) return '未知'
  const d = new Date(s)
  if (isNaN(d.getTime())) return String(s).slice(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}
const fmtStars = (n) => {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function renderInline(text, base) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  const out = []
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(React.createElement('span', { key: base + (i++) }, text.slice(last, m.index)))
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(React.createElement('strong', { key: base + (i++) }, tok.slice(2, -2)))
    } else if (tok.startsWith('`')) {
      out.push(React.createElement('code', { key: base + (i++) }, tok.slice(1, -1)))
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      out.push(React.createElement('a', { key: base + (i++), href: lm ? lm[2] : '#', target: '_blank', rel: 'noreferrer' }, lm ? lm[1] : tok))
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(React.createElement('span', { key: base + (i++) }, text.slice(last)))
  return out
}

function renderMarkdown(text) {
  const lines = String(text || '').split('\n')
  const els = []
  let inCode = false
  let codeBuf = []
  let listBuf = []
  let k = 0
  const flushList = () => {
    if (listBuf.length) {
      els.push(React.createElement('ul', { key: 'l' + (k++) }, listBuf))
      listBuf = []
    }
  }
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('```')) {
      if (inCode) {
        els.push(React.createElement('pre', { key: 'c' + (k++) }, React.createElement('code', null, codeBuf.join('\n'))))
        codeBuf = []
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      continue
    }
    if (inCode) { codeBuf.push(line); continue }
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      flushList()
      const lv = h[1].length
      els.push(React.createElement('h' + lv, { key: 'h' + (k++) }, renderInline(h[2], 'hi' + k)))
      continue
    }
    if (/^[-*+]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      listBuf.push(React.createElement('li', { key: 'li' + (k++) }, renderInline(t.replace(/^[-*+]\s+/, '').replace(/^\d+[.)]\s+/, ''), 'lii' + k)))
      continue
    }
    if (!t) { flushList(); continue }
    flushList()
    if (t.startsWith('|') && t.endsWith('|')) continue
    if (/^\s*>/.test(line)) {
      els.push(React.createElement('blockquote', { key: 'q' + (k++) }, renderInline(t.replace(/^>\s?/, ''), 'qi' + k)))
      continue
    }
    if (/^!\[/.test(t)) continue
    els.push(React.createElement('p', { key: 'p' + (k++) }, renderInline(t, 'pi' + k)))
  }
  flushList()
  if (inCode && codeBuf.length) {
    els.push(React.createElement('pre', { key: 'c' + (k++) }, React.createElement('code', null, codeBuf.join('\n'))))
  }
  return els
}

function extractInstall(readme) {
  if (!readme) return null
  const lines = String(readme).split('\n')
  const titleRe = /^(#{1,6})\s+(.*)$/
  const kwRe = /(install|installation|setup|getting started|quick start|usage|部署|安装|使用|上手|快速开始|运行|启动)/i
  let best = null
  for (let i = 0; i < lines.length; i++) {
    const m = titleRe.exec(lines[i])
    if (!m || !kwRe.test(m[2])) continue
    const body = []
    for (let j = i + 1; j < lines.length; j++) {
      if (titleRe.test(lines[j])) break
      body.push(lines[j])
    }
    const blocks = []
    const re = /```[^\n]*\n([\s\S]*?)```/g
    let bm
    const joined = body.join('\n')
    while ((bm = re.exec(joined))) blocks.push(bm[1].replace(/\n+$/, ''))
    if (blocks.length > 0 && (!best || blocks.length > best.blocks.length)) {
      best = { title: m[2].trim(), blocks }
    }
  }
  return best
}

function InstallCard({ readme }) {
  const hit = extractInstall(readme)
  if (!hit) return null
  return React.createElement('div', { className: 'dsw-install' },
    React.createElement('div', { className: 'dsw-install-title' }, '📦 安装方法 · ' + hit.title),
    hit.blocks.map((b, i) => React.createElement('pre', { key: i, className: 'dsw-install-block' }, React.createElement('code', null, b))),
  )
}

function Trigger(props) {
  const wide = !!props.wide
  const count = useSubsCount()
  React.useEffect(() => {
    apiFetch('subscriptions', {}).then((res) => {
      if (res && !res.error && Array.isArray(res.subs)) setSubsCount(res.subs.length)
    }).catch(() => {})
  }, [])
  if (!wide) {
    return React.createElement('button', {
      className: 'dsw-trigger',
      title: 'github-dsh插件市场：浏览并订阅 GitHub 上的 DSH 插件',
      'aria-label': 'github-dsh插件市场',
      onClick: () => setOpen(true),
    }, React.createElement(CartIcon, { size: 16 }))
  }
  return React.createElement('button', {
    className: 'dsw-trigger wide',
    title: 'github-dsh插件市场：浏览并订阅 GitHub 上的 DSH 插件',
    'aria-label': 'github-dsh插件市场',
    onClick: () => setOpen(true),
  },
    React.createElement('span', { className: 'dsw-trigger-name' },
      React.createElement(CartIcon, { size: 15 }),
      React.createElement('span', { className: 'dsw-trigger-text' }, 'github-dsh插件市场'),
    ),
    React.createElement('span', { className: 'dsw-trigger-count' },
      '已安装 ',
      React.createElement('b', { className: 'dsw-trigger-count-num' }, String(count)),
    ),
  )
}

function Workshop() {
  const open = useOpen()
  const [query, setQuery] = React.useState('')
  const [items, setItems] = React.useState(null)
  const [total, setTotal] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [selected, setSelected] = React.useState(null)
  const [detail, setDetail] = React.useState(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [tab, setTab] = React.useState('browse')
  const [subs, setSubs] = React.useState(null)
  const [subsLoading, setSubsLoading] = React.useState(false)
  const [subsError, setSubsError] = React.useState('')
  const [busy, setBusy] = React.useState(null)
  const [msg, setMsg] = React.useState('')
  const [msgType, setMsgType] = React.useState('ok')
  const [confirm, setConfirm] = React.useState(null)
  const [preparing, setPreparing] = React.useState(null)
  const [summarizing, setSummarizing] = React.useState(false)
  const [summary, setSummary] = React.useState(null)
  const [summaryError, setSummaryError] = React.useState('')
  const [descZh, setDescZh] = React.useState('')
  const [descMap, setDescMap] = React.useState({})
  const [localizing, setLocalizing] = React.useState(null)
  const [registry, setRegistry] = React.useState(null)
  const [registryLoading, setRegistryLoading] = React.useState(false)
  const [registryError, setRegistryError] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [srcMode, setSrcMode] = React.useState('registry')
  const [installed, setInstalled] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [filterQuery, setFilterQuery] = React.useState('')

  const openExternal = (url) => {
    apiFetch('openExternal', { url }).then((res) => {
      if (res && res.error) {
        setMsgType('err')
        setMsg('打开失败：' + res.error)
      }
    }).catch((err) => {
      setMsgType('err')
      setMsg('打开失败：' + String((err && err.message) || err))
    })
  }

  const loadSubs = () => {
    setSubsLoading(true)
    setSubsError('')
    apiFetch('subscriptions', {}).then((res) => {
      setSubsLoading(false)
      if (res && res.error) { setSubsError(res.error); return }
      const list = (res && res.subs) || []
      setSubs(list)
      setSubsCount(list.length)
    }).catch((err) => {
      setSubsLoading(false)
      setSubsError('调用失败：' + String((err && err.message) || err))
    })
  }

  const loadRegistry = (force) => {
    setRegistryLoading(true)
    setRegistryError('')
    if (!force && registryCacheStore.data && Date.now() - registryCacheStore.fetchedAt < 30 * 60 * 1000) {
      setRegistry(registryCacheStore.data)
      setRegistryLoading(false)
      return
    }
    apiFetch('registry', { force: force ? '1' : '' }).then((res) => {
      setRegistryLoading(false)
      if (res && res.error) { setRegistryError(res.error); return }
      const data = {
        categories: (res && res.categories) || {},
        plugins: (res && res.plugins) || [],
        count: (res && res.count) || 0,
        cached: !!(res && res.cached),
        stale: !!(res && res.stale),
        sources: (res && res.sources) || null,
      }
      registryCacheStore.data = data
      registryCacheStore.fetchedAt = Date.now()
      setRegistry(data)
    }).catch((err) => {
      setRegistryLoading(false)
      setRegistryError('调用失败：' + String((err && err.message) || err))
    })
  }

  const loadInstalled = () => {
    apiFetch('installed', {}).then((res) => {
      if (res && !res.error && Array.isArray(res.installed)) setInstalled(res.installed)
    }).catch(() => {})
  }

  const loadTopic = (force) => {
    const topicKey = 'deepseek-harness-plugin'
    setLoading(true)
    setError('')
    setSelected(null)
    setDetail(null)
    setTotal(null)
    if (!force && topicCache[topicKey]) {
      setItems(topicCache[topicKey].items)
      setTotal(topicCache[topicKey].total)
      setLoading(false)
      return
    }
    apiFetch('listTopic', { topics: JSON.stringify(['deepseek-harness-plugin', 'dsh-plugin']) }).then((res) => {
      setLoading(false)
      if (res && res.error) { setError(res.error); setItems(null); return }
      const list = (res && res.items) || []
      topicCache[topicKey] = { items: list, total: res.total || list.length, fetchedAt: Date.now() }
      setItems(list)
      setTotal(res.total || list.length)
      localizeList(list)
    }).catch((err) => {
      setLoading(false)
      setError('调用失败：' + String((err && err.message) || err))
    })
  }

  const localizeList = (list) => {
    const need = (list || []).filter((it) => it.description && !/[一-鿿]/.test(it.description) && !descZhCache[it.fullName])
    if (need.length === 0) return
    setLocalizing({ done: 0, total: need.length })
    let done = 0
    const worker = (item) => apiFetch('getDescZh', { fullName: item.fullName, text: item.description }).then((res) => {
      if (res && !res.error && res.translated) {
        descZhCache[item.fullName] = res.translated
        setDescMap((m) => { const n = Object.assign({}, m); n[item.fullName] = res.translated; return n })
      }
      done++
      setLocalizing({ done, total: need.length })
    }).catch(() => {
      done++
      setLocalizing({ done, total: need.length })
    })
    const run = async () => {
      const pool = []
      for (let i = 0; i < need.length; i++) {
        pool.push(worker(need[i]))
        if (pool.length >= 6) {
          await Promise.all(pool)
          pool.length = 0
        }
      }
      await Promise.all(pool)
      setLocalizing(null)
    }
    run()
  }

  const runSearch = (q) => {
    setLoading(true)
    setError('')
    setSelected(null)
    setDetail(null)
    setTotal(null)
    const key = String(q).trim()
    if (searchCache[key]) {
      setItems(searchCache[key])
      setLoading(false)
      return
    }
    apiFetch('search', { q: key }).then((res) => {
      setLoading(false)
      if (res && res.error) { setError(res.error); setItems(null); return }
      const list = (res && res.items) || []
      searchCache[key] = list
      setItems(list)
      localizeList(list)
    }).catch((err) => {
      setLoading(false)
      setError('调用失败：' + String((err && err.message) || err))
    })
  }

  React.useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => {
      if (tab === 'browse') {
        registryCacheStore.data = null
        loadRegistry(true)
      }
    }, 30 * 60 * 1000)
    return () => window.clearInterval(id)
  }, [open, tab])

  const openDetail = (item) => {
    setSelected(item)
    setDetail(null)
    setDescZh('')
    setSummary(null)
    setSummaryError('')
    if (item.src === 'registry') {
      setDetail({})
      return
    }
    if (summaryCache[item.fullName]) setSummary(summaryCache[item.fullName])
    if (detailCache[item.fullName]) { setDetail(detailCache[item.fullName]); return }
    setDetailLoading(true)
    apiFetch('readme', { fullName: item.fullName }).then((res) => {
      setDetailLoading(false)
      const d = (res && res.error) ? { error: res.error } : { readme: (res && res.readme) || '' }
      detailCache[item.fullName] = d
      setDetail(d)
    }).catch((err) => {
      setDetailLoading(false)
      setDetail({ error: '调用失败：' + String((err && err.message) || err) })
    })
  }

  const loadSummary = (force) => {
    if (!detail || !selected) return
    const fullName = selected.fullName
    if (!force && summaryCache[fullName]) { setSummary(summaryCache[fullName]); return }
    const readmeText = detail.readme || ''
    if (!readmeText) return
    setSummarizing(true)
    setSummaryError('')
    const raw = (selected.description ? selected.description + '\n\n' : '') + readmeText.slice(0, 14000)
    apiFetch('getSummary', { fullName, text: raw, force: force ? '1' : '' }).then((res) => {
      setSummarizing(false)
      if (res && !res.error && res.summary) {
        summaryCache[fullName] = res.summary
        setSummary(res.summary)
      } else {
        setSummaryError((res && res.error) || '生成摘要失败')
      }
    }).catch((err) => {
      setSummarizing(false)
      setSummaryError('调用失败：' + String((err && err.message) || err))
    })
  }

  React.useEffect(() => {
    if (!detail || !selected || detail.error) return
    const fullName = selected.fullName
    const desc = selected.description || ''
    const needZh = !!(desc && !/[一-鿿]/.test(desc))
    if (selected.src === 'registry') {
      if (needZh) {
        if (descZhCache[fullName]) { setDescZh(descZhCache[fullName]); return }
        apiFetch('getDescZh', { fullName, text: desc.slice(0, 500) }).then((res) => {
          if (res && !res.error && res.translated) {
            descZhCache[fullName] = res.translated
            setDescZh(res.translated)
          }
        }).catch(() => {})
      }
      return
    }
    if (!summaryCache[fullName]) loadSummary(false)
    if (needZh) {
      if (descZhCache[fullName]) { setDescZh(descZhCache[fullName]); return }
      apiFetch('translate', { text: desc.slice(0, 800) }).then((res) => {
        if (res && !res.error && res.translated) {
          descZhCache[fullName] = res.translated
          setDescZh(res.translated)
        }
      }).catch(() => {})
    }
  }, [detail, selected])

  const extractSpec = (item) => {
    if (item.install) {
      const m = /(?:^|\s)add\s+(.+)$/.exec(item.install.trim())
      if (m) return m[1].trim().replace(/^"|"$/g, '')
    }
    if (item.npm) return item.npm
    if (item.fullName) return 'github:' + item.fullName
    return ''
  }

  const isInstalled = (item) => {
    if (!installed || installed.length === 0) return false
    return installed.some((b) => b === item.name || (item.npm && b === item.npm))
  }

  const startSubscribeCopy = (item) => {
    setPreparing(item.fullName)
    setMsg('')
    apiFetch('prepareInstall', { fullName: item.fullName }).then((res) => {
      setPreparing(null)
      if (res && res.error) {
        setMsgType('err')
        setMsg('无法订阅：' + res.error)
        return
      }
      setConfirm({
        type: 'install',
        fullName: item.fullName,
        name: item.name,
        title: '订阅本地副本',
        detail: '将把仓库 ' + item.fullName + ' 克隆到本地目录：\n' + res.dir + '\n\n订阅后可一键更新、回滚或卸载（这只是代码副本，不等于官方安装）。是否继续？',
      })
    }).catch((err) => {
      setPreparing(null)
      setMsgType('err')
      setMsg('调用失败：' + String((err && err.message) || err))
    })
  }

  const startInstall = (item) => {
    setMsg('')
    if (item.src === 'registry') {
      const spec = extractSpec(item)
      if (!spec) {
        setMsgType('err')
        setMsg('该条目没有可用的安装命令')
        return
      }
      setConfirm({
        type: 'installOfficial',
        spec: spec,
        fullName: item.fullName,
        name: item.name,
        title: '安装插件（官方机制）',
        detail: '将执行命令：\ndsh plugin --profile web add ' + spec + '\n\n安装完成后需要重启 DSH 才能生效。是否继续？',
      })
      return
    }
    startSubscribeCopy(item)
  }

  const startAction = (type, s) => {
    setMsg('')
    const details = {
      update: '将执行 git pull（或自动降级方案），把 ' + s.fullName + ' 更新到 GitHub 最新版本。\n是否继续？',
      rollback: '将执行 git reset --hard HEAD~1，回退到上一个提交（会丢弃本地改动）。\n是否继续？',
      uninstall: '将删除本地目录并移除订阅记录：\n' + s.localPath + '\n是否继续？',
    }
    setConfirm({
      type: type,
      fullName: s.fullName,
      name: s.name,
      title: type === 'update' ? '更新插件' : type === 'rollback' ? '回滚插件' : '卸载插件',
      detail: details[type],
    })
  }

  const doAction = (type, fullName, extra) => {
    setConfirm(null)
    setBusy({ fullName, action: type })
    setMsg('')
    const method = type === 'install' ? 'install' : type === 'installOfficial' ? 'installOfficial' : type === 'update' ? 'update' : type === 'rollback' ? 'rollback' : 'uninstall'
    const args = type === 'installOfficial' ? { spec: (extra && extra.spec) || '', fullName } : { fullName }
    apiFetch(method, args).then((res) => {
      setBusy(null)
      if (res && res.error) {
        setMsgType('err')
        setMsg((type === 'install' || type === 'installOfficial' ? '安装失败：' : '操作失败：') + res.error)
      } else {
        setMsgType('ok')
        setMsg(type === 'installOfficial' ? '✅ 已通过官方机制安装，重启 DSH 后生效' : type === 'install' ? '✅ 订阅成功' : '✅ 操作完成')
        loadSubs()
        if (type === 'installOfficial') loadInstalled()
      }
    }).catch((err) => {
      setBusy(null)
      setMsgType('err')
      setMsg('调用失败：' + String((err && err.message) || err))
    })
  }

  React.useEffect(() => {
    if (open) {
      if (registry === null && !registryLoading) loadRegistry(false)
      if (subs === null && !subsLoading) loadSubs()
      loadInstalled()
    }
  }, [open])

  React.useEffect(() => {
    if (!open || tab !== 'browse' || srcMode !== 'registry' || !registry) return
    const filtered = filterRegistryList()
    const shown = filtered.slice(0, page * 100)
    if (shown.length > 0) localizeList(shown)
  }, [open, tab, srcMode, registry, category, filterQuery, page])

  if (!open) return null

  const isSubscribed = (fullName) => subs && subs.some((s) => s.fullName === fullName)
  const updatableCount = subs ? subs.filter((s) => s.hasUpdate).length : 0
  const catChips = [{ id: 'all', label: '全部' }].concat(
    (registry && registry.categories) ? Object.keys(registry.categories).map((id) => ({ id, label: (registry.categories[id] && registry.categories[id].zh) || id })) : [],
  )
  const filterRegistryList = () => {
    const plugins = (registry && registry.plugins) || []
    const q = String(filterQuery || '').trim().toLowerCase()
    return plugins
      .filter((it) => category === 'all' || it.category === category)
      .filter((it) => !q || (it.name || '').toLowerCase().indexOf(q) >= 0 || (it.description || '').toLowerCase().indexOf(q) >= 0 || (it.fullName || '').toLowerCase().indexOf(q) >= 0)
      .sort((a, b) => b.stars - a.stars)
  }
  const card = (item, idx) => React.createElement('button', {
    key: item.fullName + '|' + (item.name || '') + '|' + (idx || 0),
    className: 'dsw-card' + (selected && selected.fullName === item.fullName ? ' selected' : ''),
    title: item.description || '',
    onClick: () => openDetail(item),
  },
    React.createElement('div', { className: 'dsw-card-title' },
      React.createElement('span', { className: 'dsw-stars' }, '⭐ ' + fmtStars(item.stars)),
      React.createElement('span', { className: 'dsw-card-name' }, item.name),
      isInstalled(item) ? React.createElement('span', { className: 'dsw-badge ok' }, '已安装') : null,
      isSubscribed(item.fullName) ? React.createElement('span', { className: 'dsw-badge' }, '已订阅') : null,
      item.src === 'registry' && item.category ? React.createElement('span', { className: 'dsw-badge cat' }, catName(item.category)) : null,
    ),
    React.createElement('div', { className: 'dsw-card-desc' }, (descMap[item.fullName] || item.description || '（无描述）')),
    React.createElement('div', { className: 'dsw-card-meta' },
      item.src === 'registry'
        ? ((item.addedAt ? '收录 ' + fmtDate(item.addedAt) : '精选目录') + (item.npm ? ' · npm' : ''))
        : ((item.language || '') + (item.language ? ' · ' : '') + '更新 ' + fmtDate(item.updatedAt)),
    ),
  )
  const catName = (id) => {
    const c = registry && registry.categories && registry.categories[id]
    return (c && c.zh) || id || ''
  }
  const detailView = () => {
    if (selected === null) {
      return React.createElement('div', { className: 'dsw-hint' }, '👈 从左侧选择一个项目查看说明与安装方法')
    }
    if (selected.src === 'registry') {
      const spec = extractSpec(selected)
      const subscribed = isSubscribed(selected.fullName)
      const isBusy = busy && busy.fullName === selected.fullName
      const isPreparing = preparing === selected.fullName
      const alreadyInstalled = isInstalled(selected)
      return React.createElement('div', { className: 'dsw-detail-body' },
        React.createElement('h2', null, selected.name),
        React.createElement('div', { className: 'dsw-meta-line' },
          '⭐ ' + fmtStars(selected.stars) + ' · ' + (catName(selected.category) || '未分类') + ' · 收录于 ' + fmtDate(selected.addedAt) + (selected.npm ? ' · npm: ' + selected.npm : ''),
        ),
        React.createElement('div', { className: 'dsw-detail-actions' },
          React.createElement('button', {
            className: 'dsw-btn gh-open',
            disabled: !selected.fullName,
            onClick: () => openExternal('https://github.com/' + selected.fullName),
          }, '在 GitHub 打开 ↗'),
          alreadyInstalled
            ? React.createElement('span', { className: 'dsw-subscribed-tag' }, '✓ 已安装（重启后生效）')
            : React.createElement('button', {
                className: 'dsw-btn primary',
                disabled: !!isBusy || isPreparing,
                onClick: () => startInstall(selected),
              }, isPreparing ? '准备中…' : (isBusy ? '处理中…' : '⚡ 安装')),
        ),
        selected.description ? React.createElement('p', { className: 'dsw-desc' }, selected.description) : null,
        descZh ? React.createElement('p', { className: 'dsw-desc-zh' }, '译文：' + descZh) : null,
        spec ? React.createElement('div', { className: 'dsw-install' },
          React.createElement('div', { className: 'dsw-install-title' }, '📦 安装命令（官方机制）'),
          React.createElement('pre', { className: 'dsw-install-block' }, React.createElement('code', null, 'dsh plugin --profile web add ' + spec)),
        ) : null,
        React.createElement('div', { className: 'dsw-detail-actions' },
          React.createElement('button', {
            className: 'dsw-btn',
            disabled: !!isBusy || subscribed,
            onClick: () => startSubscribeCopy(selected),
          }, subscribed ? '已订阅本地副本' : '订阅本地副本（git 代码）'),
        ),
      )
    }
    if (detailLoading) return React.createElement('div', { className: 'dsw-hint' }, '正在加载 README…')
    if (detail === null) return null
    if (detail.error) {
      return React.createElement('div', { className: 'dsw-error' }, '获取失败：' + detail.error)
    }
    const subscribed = isSubscribed(selected.fullName)
    const isBusy = busy && busy.fullName === selected.fullName
    const isPreparing = preparing === selected.fullName
    return React.createElement('div', { className: 'dsw-detail-body' },
      React.createElement('h2', null, selected.name),
      React.createElement('div', { className: 'dsw-meta-line' },
        '⭐ ' + fmtStars(selected.stars) + ' · ' + (selected.language || '未知语言') + ' · 更新于 ' + fmtDate(selected.updatedAt),
      ),
      React.createElement('div', { className: 'dsw-detail-actions' },
        React.createElement('button', {
          className: 'dsw-btn gh-open',
          onClick: () => openExternal(selected.htmlUrl),
        }, '在 GitHub 打开 ↗'),
        subscribed
          ? React.createElement('span', { className: 'dsw-subscribed-tag' }, '✓ 已订阅')
          : React.createElement('button', {
              className: 'dsw-btn primary',
              disabled: !!isBusy || isPreparing,
              onClick: () => startInstall(selected),
            }, isPreparing ? '准备中…' : (isBusy ? '处理中…' : '⭐ 订阅')),
      ),
      selected.description ? React.createElement('p', { className: 'dsw-desc' }, selected.description) : null,
      descZh ? React.createElement('p', { className: 'dsw-desc-zh' }, '译文：' + descZh) : null,
      React.createElement('div', { className: 'dsw-summary' },
        React.createElement('div', { className: 'dsw-summary-head' },
          React.createElement('span', { className: 'dsw-summary-title' }, '插件摘要'),
          summarizing ? React.createElement('span', { className: 'dsw-summary-loading' }, '正在分析 README…') : null,
          summary && !summarizing ? React.createElement('button', {
            className: 'dsw-btn small refresh-summary',
            onClick: () => loadSummary(true),
          }, '重新生成') : null,
        ),
        summarizing ? null : summaryError ? React.createElement('div', { className: 'dsw-summary-err' }, '摘要生成失败：' + summaryError) : null,
        summarizing ? null : summary ? React.createElement('div', { className: 'dsw-summary-body' }, renderMarkdown(summary)) : null,
      ),
      React.createElement(InstallCard, { readme: detail.readme }),
    )
  }
  const listView = () => {
    if (srcMode === 'registry') {
      if (registryLoading) return React.createElement('div', { className: 'dsw-hint' }, '正在加载精选目录…')
      if (registryError) return React.createElement('div', { className: 'dsw-error' }, registryError)
      if (registry === null) return React.createElement('div', { className: 'dsw-hint' }, '正在加载精选目录…')
      const filtered = filterRegistryList()
      if (filtered.length === 0) return React.createElement('div', { className: 'dsw-hint' }, '没有匹配的插件，试试其他分类或关键词')
      const shown = filtered.slice(0, page * 100)
      const els = shown.map((it, i) => card(it, i))
      if (shown.length < filtered.length) {
        els.push(React.createElement('button', {
          key: '__more',
          className: 'dsw-btn small dsw-more',
          onClick: () => setPage(page + 1),
        }, '加载更多（还剩 ' + (filtered.length - shown.length) + ' 个）'))
      }
      return React.createElement(React.Fragment, null, els)
    }
    if (loading) return React.createElement('div', { className: 'dsw-hint' }, '正在搜索 GitHub…')
    if (error) return React.createElement('div', { className: 'dsw-error' }, error)
    if (items === null) return React.createElement('div', { className: 'dsw-hint' }, '点击「GitHub 全站搜索」或在输入框输入关键词后回车')
    if (items.length === 0) return React.createElement('div', { className: 'dsw-hint' }, '没有找到结果，换个关键词试试')
    return items.map((it, i) => card(it, i))
  }
  const subsView = () => {
    if (subsLoading) return React.createElement('div', { className: 'dsw-hint' }, '正在检查订阅更新…')
    if (subsError) return React.createElement('div', { className: 'dsw-error' }, subsError)
    if (!subs || subs.length === 0) {
      return React.createElement('div', { className: 'dsw-hint' }, '还没有订阅任何插件。\n去「浏览」里挑一个，点击「⭐ 订阅」吧。')
    }
    return React.createElement('div', { className: 'dsw-subs-list' },
      subs.map((s) => {
        const isBusy = busy && busy.fullName === s.fullName
        return React.createElement('div', { key: s.fullName, className: 'dsw-sub' },
          React.createElement('div', { className: 'dsw-sub-head' },
            React.createElement('span', { className: 'dsw-sub-name' }, s.name),
            React.createElement('span', { className: 'dsw-stars' }, '⭐ ' + fmtStars(s.stars)),
            s.hasUpdate
              ? React.createElement('span', { className: 'dsw-badge warn' }, '🔴 有更新')
              : React.createElement('span', { className: 'dsw-badge ok' }, '✓ 最新'),
          ),
          React.createElement('div', { className: 'dsw-sub-path' }, s.localPath + (s.viaZip ? ' · 压缩包' : ' · git')),
          s.error ? React.createElement('div', { className: 'dsw-sub-err' }, s.error) : null,
          React.createElement('div', { className: 'dsw-sub-actions' },
            React.createElement('button', {
              className: 'dsw-btn small' + (s.hasUpdate ? ' primary' : ''),
              disabled: !!isBusy,
              onClick: () => startAction('update', s),
            }, isBusy && busy.action === 'update' ? '更新中…' : '更新'),
            React.createElement('button', {
              className: 'dsw-btn small',
              disabled: !!isBusy || s.viaZip,
              onClick: () => startAction('rollback', s),
            }, isBusy && busy.action === 'rollback' ? '回滚中…' : '回滚'),
            React.createElement('button', {
              className: 'dsw-btn small danger',
              disabled: !!isBusy,
              onClick: () => startAction('uninstall', s),
            }, isBusy && busy.action === 'uninstall' ? '卸载中…' : '卸载'),
            React.createElement('button', {
              className: 'dsw-btn small',
              onClick: () => openExternal('https://github.com/' + s.fullName),
            }, 'GitHub ↗'),
          ),
        )
      }),
    )
  }
  const tabs = [
    { id: 'browse', label: '浏览' },
    { id: 'subs', label: '我的订阅' + (updatableCount > 0 ? ' · ' + updatableCount + ' 个更新' : '') },
  ]
  const confirmDialog = confirm ? React.createElement('div', {
    className: 'dsw-confirm-mask',
    onClick: () => setConfirm(null),
  },
    React.createElement('div', { className: 'dsw-confirm', onClick: (e) => e.stopPropagation() },
      React.createElement('div', { className: 'dsw-confirm-title' }, confirm.title),
      React.createElement('div', { className: 'dsw-confirm-name' }, confirm.name + ' · ' + confirm.fullName),
      React.createElement('pre', { className: 'dsw-confirm-detail' }, confirm.detail),
      React.createElement('div', { className: 'dsw-confirm-actions' },
        React.createElement('button', { className: 'dsw-btn', onClick: () => setConfirm(null) }, '拒绝'),
        React.createElement('button', { className: 'dsw-btn primary', onClick: () => doAction(confirm.type, confirm.fullName, confirm) }, '允许'),
      ),
    ),
  ) : null
  return React.createElement('div', {
    className: 'dsw-mask',
    onClick: (e) => { if (e.target === e.currentTarget) setOpen(false) },
  },
    React.createElement('div', { className: 'dsw-panel', onClick: (e) => e.stopPropagation() },
      React.createElement('header', { className: 'dsw-header' },
        React.createElement('span', { className: 'dsw-logo' },
          React.createElement(CartIcon, { size: 16 }),
          React.createElement('span', { className: 'dsw-logo-text' }, 'github-dsh插件市场'),
        ),
        React.createElement('div', { className: 'dsw-tabs' },
          tabs.map((t) => React.createElement('button', {
            key: t.id,
            className: 'dsw-tab' + (tab === t.id ? ' active' : ''),
            onClick: () => {
              setTab(t.id)
              if (t.id === 'subs' && subs === null) loadSubs()
            },
          }, t.label)),
        ),
        React.createElement('div', { className: 'dsw-header-search' },
          React.createElement('input', {
            className: 'dsw-search',
            value: query,
            placeholder: srcMode === 'registry' ? '筛选目录（名称/描述/仓库）…' : '搜索 GitHub 上的 DSH 插件项目…',
            onChange: (e) => {
              setQuery(e.target.value)
              if (srcMode === 'registry') { setFilterQuery(e.target.value); setPage(1) }
            },
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                if (srcMode === 'registry') { setFilterQuery(query); setPage(1) }
                else runSearch(query)
              }
            },
          }),
          React.createElement('button', {
            className: 'dsw-btn primary',
            onClick: () => {
              if (srcMode === 'registry') { setFilterQuery(query); setPage(1) }
              else runSearch(query)
            },
          }, srcMode === 'registry' ? '筛选' : '搜索'),
          srcMode === 'github'
            ? React.createElement('button', {
                className: 'dsw-btn',
                onClick: () => { setSrcMode('registry'); setPage(1); setFilterQuery(''); setQuery('') },
              }, '返回目录')
            : React.createElement('button', {
                className: 'dsw-btn',
                onClick: () => { setSrcMode('github'); runSearch(query || 'deepseek-harness') },
              }, 'GitHub 全站搜索'),
        ),
        React.createElement('button', { className: 'dsw-btn dsw-close', title: '关闭', onClick: () => setOpen(false) }, '✕'),
      ),
      tab === 'browse'
        ? React.createElement(React.Fragment, null,
            React.createElement('div', { className: 'dsw-chips' },
              React.createElement('div', { className: 'dsw-chips-scroll' },
                catChips.map((c) => React.createElement('button', {
                  key: c.id,
                  className: 'dsw-chip' + (category === c.id && srcMode === 'registry' ? ' active-chip' : ''),
                  onClick: () => {
                    setCategory(c.id)
                    setSrcMode('registry')
                    setPage(1)
                    setSelected(null)
                    setDetail(null)
                    setFilterQuery('')
                    setQuery('')
                  },
                }, c.label)),
              ),
            ),
            srcMode === 'registry'
              ? React.createElement('div', { className: 'dsw-total' },
                  '精选目录 ' + ((registry && registry.count) || 0) + ' 个插件' + (category !== 'all' ? ' · 分类：' + catName(category) : '') + (filterQuery ? ' · 筛选：' + filterQuery : '') + ' · 每 30 分钟自动刷新' + (registry && registry.stale ? ' ·（离线缓存）' : ''),
                )
              : (total !== null ? React.createElement('div', { className: 'dsw-total' }, 'GitHub 搜索结果 ' + total + ' 个 · 每 30 分钟自动刷新') : null),
            localizing ? React.createElement('div', { className: 'dsw-total localizing' }, '正在本地化描述… ' + localizing.done + '/' + localizing.total) : null,
            React.createElement('div', { className: 'dsw-body' },
              React.createElement('aside', { className: 'dsw-list', key: 'l-' + srcMode + '|' + category + '|' + filterQuery }, listView()),
              React.createElement('main', { className: 'dsw-detail' }, detailView()),
            ),
          )
        : React.createElement('div', { className: 'dsw-body subs-body' },
            React.createElement('div', { className: 'dsw-subs-pane' },
              React.createElement('div', { className: 'dsw-subs-toolbar' },
                React.createElement('span', { className: 'dsw-subs-count' }, '共 ' + ((subs && subs.length) || 0) + ' 个订阅'),
                React.createElement('button', { className: 'dsw-btn small', onClick: loadSubs }, '检查更新'),
              ),
              subsView(),
            ),
          ),
      msg ? React.createElement('div', { className: 'dsw-msg' + (msgType === 'err' ? ' err' : '') }, msg) : null,
      confirmDialog,
    ),
  )
}

// ---------------- 插件入口 ----------------
function apply(ctx) {
  console.log(TAG, 'apply, React =', !!React)
  if (React === null) return
  const slots = ctx.get('slots')
  if (slots !== undefined) {
    slots.inject('sidebar.footer.action', () => slots.register(
      { name: 'sidebar.footer.action', id: 'dsw-workshop', order: 100, label: 'github-dsh插件市场' },
      (props) => React.createElement(Trigger, props),
    ))
    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'dsw-workshop-panel', order: 100 },
      () => React.createElement(Workshop),
    ))
  }
  if (typeof document !== 'undefined') {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsw-workshop-plugin'
    tag.textContent = CSS
    document.head.appendChild(tag)
    ctx.effect(() => () => {
      if (tag.parentNode) tag.parentNode.removeChild(tag)
    })
  }
}

module.exports = { apply }

return module.exports;
} });
