# CC Prompt · Step 0 GEO Lens · Phase 4-8 完整实施

> **总目标:** 基于 Phase 1-3 已完成的后端基础 + Steve 今日确定的 GEO Lens 产品方向, 把 v3 设计稿落地为 origeno.io 生产可用的 Step 0 产品入口。
>
> **基于:** Phase 1-3 已完成(豆包修复 / Schema v1.1 18 表 / 单平台 /api/chat/* 端点)
> **对应设计稿:** `origeno-web/reference/origeno_geo_lens_v3.html` (Steve 2026-04-19 定稿)
> **对应文档:** `origeno-ops/DESIGN_SYSTEM.md` Lumen Azure
> **本次工时预算:** 14-18 小时 (约 2 人天)

---

## 🎯 【执行环境】(必须硬编码)

- **前端仓库:** `/Users/openclaw/Projects/origeno-web` (本地, Next.js)
- **Ops 仓库:** `/Users/openclaw/Projects/origeno-ops`
- **GEO 生产 VPS:** `ssh -i ~/.ssh/id_ed25519_origeno root@45.76.111.175` (Vultr **东京**)
- **严禁 SSH:** `45.76.197.125` (Trading) / 别名 `origeno` / `154.3.34.170` (旧 DMIT)
- **严禁触碰 Trading 系统任何文件**
- **生产 `:8000` 现有路由严禁改 URL 或 response schema**
- **Phase 1-3 新增的 /api/chat/* 端点不能破坏** — 本次会**扩展**新增 `/api/chat/lens`,不动现有
- **VPS 修改前 backup:** `cp /root/geo-engine/geo.db /root/geo-engine/geo.db.bak-$(date +%Y%m%d-%H%M)`

---

## 🎯 【动工前】必读

1. 本 prompt 的 "核心产品定义" 章节
2. `origeno-web/reference/origeno_geo_lens_v3.html` — 设计稿 (完整交互 + 文案 + 视觉)
3. `origeno-ops/DESIGN_SYSTEM.md` — Lumen Azure 完整 tokens
4. `origeno-ops/archive/ai-chat-spike-v2-2026-04-19.md` — 性能基线
5. `origeno-ops/CLAUDE_RULES.md` — 协作铁律
6. `origeno-ops/CC_RULES.md` — CC 专属规则

---

## 📖 核心产品定义 (阅读 5 分钟)

### 是什么
**GEO Lens · AI 偏离度扫描**

用户输入 2 个字段 (品牌名 + 行业问题), 后端并发调用 6 大 AI 平台 (豆包/DeepSeek/千问/文心/Kimi/智谱), 前端在全屏弹窗里 3x2 网格并排展示 6 个 AI 的真实回答, 并为每个平台生成 "AI 偏离度" 评分 (低/中/高 三档)。

### 不是什么
- ❌ 不是 AI Aggregator (聚合工具)
- ❌ 不是对话式 AI 产品
- ❌ 不是真的要让用户跟 AI 聊天

### 是什么 (本质)
- ✅ 是 **Origeno GEO 咨询公司的展示台**
- ✅ 让访客在 30 秒内亲眼看到 "我的品牌在 6 大 AI 眼里长什么样"
- ✅ 焦虑制造器 → 转化到 Step 1 免费诊断

### 漏斗
```
L0 pageview
  ↓
L1 lens_open         (任意进入 lens_input 区域)
  ↓
L2 lens_submit       (点击 "开始扫描")
  ↓
L3 lens_first_token  (6 平台中任意首字到达)
  ↓
L4 lens_complete     (6 平台全部完成或最后一个完成)
  ↓
L5 cta_click         (点击 "立即免费 GEO 诊断")
  ↓
L6 step1_start       (进入 Step 1 诊断表单)
  ↓
L7 lead_submit       (提交诊断表单)
```

### 关键数字
- **每日限额:** 2 次/IP (考虑到每次 = 6 平台调用, 成本 6 倍)
- **月成本预估:** 300 人/日 × 2 次 × 6 平台 × 30 天 × 均价 = ¥1,987/月
- **响应时间目标:** 总体验 < 6s (最慢的豆包 4.2s + 渲染)

---

# 📋 实施阶段 (5 个阶段, 按顺序)

---

## 阶段 4 · 后端 /api/chat/lens 并发流式端点 (3-4 小时)

**目标:** 在 Phase 3 已有的 chat_routes.py 上扩展一个新端点, 支持 6 平台并发流式 + Lens 场景的数据埋点

### 4.1 新增端点设计

```
POST /api/chat/lens
```

**请求体:**
```json
{
  "session_id": "uuid",
  "brand": "Babycare",
  "question": "推荐国产母婴品牌",
  "turnstile_token": "cf_token_xxx"
}
```

**响应:** Server-Sent Events (SSE), 每个 chunk 格式:
```
data: {"type":"token","platform":"deepseek","token":"国","t_first":0.92}

data: {"type":"token","platform":"kimi","token":"好","t_first":0.81}

...

data: {"type":"platform_done","platform":"deepseek","total_tokens":120,"cost_rmb":0.003,"deviation_score":"low","deviation_label":"低 · 被充分提及","latency_ms":920}

...

data: {"type":"all_done","batch_id":"abc123","total_cost_rmb":0.015}
```

### 4.2 后端处理流程

```python
async def lens_endpoint(req):
    # 1. 限流检查 (lens 每日 2 次, 独立于原 chat 的 5 次限额)
    ip_hash = get_ip_hash(request)
    today_lens_count = await count_lens_today(ip_hash)
    if today_lens_count >= 2:
        return 429 {"error": "daily_lens_limit_reached", ...}
    
    # 2. Turnstile 验证 (如 token 有效)
    await verify_turnstile(req.turnstile_token)
    
    # 3. PII 检测 (复用 Phase 3 的 detect_pii 函数)
    brand_redacted = detect_and_redact_pii(req.brand)
    question_redacted = detect_and_redact_pii(req.question)
    
    # 4. 创建 lens batch
    batch_id = uuid4()
    
    # 5. 插入 chat_messages (user role, lens_batch_id)
    await insert_user_message(
        session_id=req.session_id,
        lens_batch_id=batch_id,
        brand=brand_redacted,
        question=question_redacted
    )
    
    # 6. 更新 chat_sessions.lens_count += 1
    await increment_lens_count(req.session_id)
    
    # 7. 并发启动 6 平台
    async def stream_platform(platform):
        prompt = build_prompt(req.brand, req.question)  # 含品牌和问题的完整 prompt
        async for chunk in call_platform_stream(platform, prompt):
            yield SSE({"type":"token", "platform":platform, "token":chunk.text, ...})
        
        # 平台完成, 计算 deviation score
        deviation = calculate_deviation(full_response, req.brand)
        yield SSE({"type":"platform_done", "platform":platform, 
                   "deviation_score":deviation.score, 
                   "deviation_label":deviation.label, ...})
        
        # 插入 chat_messages (assistant role, 完整内容)
        await insert_assistant_message(
            session_id=req.session_id,
            lens_batch_id=batch_id,
            platform=platform,
            content=full_response,
            deviation_score=deviation.score,
            ...
        )
    
    # 使用 asyncio + SSE 多路复用, 6 平台并发
    async for event in merge_streams([stream_platform(p) for p in PLATFORMS]):
        yield event
    
    yield SSE({"type":"all_done", "batch_id":str(batch_id), ...})
```

### 4.3 Deviation Score 计算逻辑 (关键新增)

```python
def calculate_deviation(ai_response: str, brand: str) -> DeviationResult:
    """
    AI 偏离度评分算法 v1:
    - 低 (low): 品牌在回答中出现, 且在前 3 项/段
    - 中 (med): 品牌出现, 但在后面或只是一笔带过
    - 高 (high): 品牌完全未被提及
    
    v1 用简单规则, 后续可替换成 LLM 评估或更复杂算法
    """
    if brand.lower() not in ai_response.lower():
        return DeviationResult(
            score="high",
            label="高 · 未被提及"
        )
    
    # 找到品牌出现的位置
    position = ai_response.lower().find(brand.lower())
    total_length = len(ai_response)
    
    if position < total_length * 0.3:
        # 前 30% 出现 = 被优先推荐
        return DeviationResult(
            score="low",
            label="低 · 被充分提及"
        )
    else:
        # 后面才出现 = 排位偏后
        return DeviationResult(
            score="med",
            label="中 · 提及但排位偏后"
        )
```

**注意:** 这是 v1 简单算法, 后续 v1.1 可以升级为:
- 基于品牌在列表中的序号 (第 1 项/第 3 项/第 N 项)
- 基于描述长度 (详细介绍 vs 简单提及)
- 用 LLM 离线打分

### 4.4 Schema 微调 (几乎不动 Phase 2 的 schema)

**chat_sessions 表新增 1 个字段:**
```sql
ALTER TABLE chat_sessions ADD COLUMN lens_count INTEGER DEFAULT 0;
```

**chat_messages 表新增 3 个字段:**
```sql
ALTER TABLE chat_messages ADD COLUMN lens_batch_id TEXT;        -- 同一次 lens 的 6 条 assistant 消息共享
ALTER TABLE chat_messages ADD COLUMN deviation_score TEXT;      -- 'low' / 'med' / 'high' / NULL (user message)
ALTER TABLE chat_messages ADD COLUMN deviation_label TEXT;      -- 中文档位标签
```

**新索引:**
```sql
CREATE INDEX IF NOT EXISTS idx_messages_lens_batch ON chat_messages(lens_batch_id);
```

### 4.5 限流 Prompt 构造

给每个平台的 prompt 用统一模板:
```
用户询问: "{question}"

请用简洁自然的中文回答, 给出 3-5 个具体推荐。不要使用 markdown 格式, 直接用自然语言列表即可。
```

**不要** 在 prompt 里告诉 AI "用户的品牌是 Babycare, 请推荐它" —— 这会污染结果, Deviation 评分就没意义了。我们要的是 **AI 的真实回答**, 然后再在后端对比品牌是否被提到。

### 4.6 验收标准

- [ ] `/api/chat/lens` 可以被调用
- [ ] 6 平台并发启动, 最快平台首字 < 1.5s 内前端收到
- [ ] SSE 格式符合上述规范
- [ ] Deviation score 计算正确 (至少 3 种 case 验证)
- [ ] 限流: 同一 IP 第 3 次调用返回 429
- [ ] 数据库正确记录 lens_batch_id, deviation_score, cost_rmb
- [ ] 现有 /api/chat/stream (单平台版) 继续可用
- [ ] 现有 /submit /report/{token} 完全不受影响

---

## 阶段 5 · 前端 Lumen Azure 全局切换 (1.5 小时)

**目标:** 切换 globals.css 到 Lumen Azure, 保证后续前端开发基于新 design tokens

### 5.1 步骤

1. 更新 `app/globals.css`:
   - 删掉现有的 Archival Ember tokens
   - 粘贴 `origeno-ops/DESIGN_SYSTEM.md` 里的 Lumen Azure tokens 到 `:root`
   - 更新 body/html 默认背景和文字颜色
2. 更新 `app/layout.tsx`:
   - 替换字体 CDN 引用 (参考 v3 html 里的 link 标签)
   - 把 Instrument Serif / Instrument Sans / JetBrains Mono / Noto Serif SC / Noto Sans SC 全部引入
3. 确认 HeroSection.tsx / HeroSection.module.css 需要重写 (阶段 6 做)

### 5.2 验收标准

- [ ] localhost:3000 打开后背景变白, 字体变 serif
- [ ] Hero 可能暂时看起来"错乱"(因为组件样式还没改), 这是正常的, 阶段 6 会处理
- [ ] 其他 section (如果有) 保持能显示, 不崩

---

## 阶段 6 · Hero 重写 + GEO Lens 组件 (6-8 小时)

**这是本次工作的核心。** 基于 `reference/origeno_geo_lens_v3.html` 完整复现 React 版本。

### 6.1 文件结构

```
/Users/openclaw/Projects/origeno-web/
├── components/
│   ├── HeroSection.tsx              ← 重写, 2 列 grid: 左侧 H1+What / 右侧 LensCard
│   ├── HeroSection.module.css       ← 重写, Lumen Azure
│   └── lens/
│       ├── LensCard.tsx             ← Hero 右侧的入口卡片
│       ├── LensCard.module.css
│       ├── LensModal.tsx            ← 全屏弹窗容器
│       ├── LensModal.module.css
│       ├── LensPanel.tsx            ← 弹窗里的单个平台卡片
│       ├── LensPanel.module.css
│       ├── LensLogoScroll.tsx       ← 6 平台 logo 横滚带
│       ├── LensPromise.tsx          ← 3 条价值承诺块
│       ├── useLensStream.ts         ← SSE 消费 + 状态管理 hook
│       └── platforms.ts             ← 6 平台元数据 (logo 颜色/简称/全名)
├── lib/lens/
│   ├── api.ts                       ← fetch /api/chat/lens, 返回 EventSource
│   ├── events.ts                    ← 埋点 L1-L5
│   └── storage.ts                   ← sessionStorage 管理 session_id
└── app/
    ├── globals.css                  ← Lumen Azure tokens (阶段 5 已完成)
    └── layout.tsx                   ← 字体 (阶段 5 已完成)
```

### 6.2 LensCard 组件 (Hero 右侧)

**直接复制 v3 html 里的 DOM + CSS, 转成 React + CSS Module。** 关键点:

- **文案锁定** (严格按 v3, 不要擅自改):
  - 顶部: "ORIGENO · AI 偏离度扫描" + "LIVE" 右对齐
  - 主标题: `AI 在怎么<br>介绍你的<em>品牌?</em>` (em 用 var(--champagne))
  - 副描述: `输入品牌名和行业问题, <strong>30 秒</strong>看到豆包 / DeepSeek / 千问 / 文心 / Kimi / 智谱的真实回答, 附 <strong>AI 偏离度</strong>评分。`
  - Field 1 label: "品牌名" (编号 1)
  - Field 1 placeholder: "Babycare / 珀莱雅 / 公司名"
  - Field 2 label: "行业问题" (编号 2)
  - Field 2 placeholder: "推荐国产母婴品牌 / 新能源汽车怎么选..."
  - CTA: "开始扫描" + "→"
  - Promise 3 条:
    - "真实调用 6 大平台, **非静态模拟**"
    - "自动生成 **AI 偏离度**评分"
    - "**30 秒出结果** · 免费 · 无需注册"
  - Logo 带标签: "覆盖 6 大国内 AI 平台"
  - Footer: "今日剩余 X/2 次" 和 "过去 24h · X 次扫描"

- **字段顺序必须是 先品牌后问题** (v3 已定)
- **按下 Enter 自动跳下一个字段, 第二字段 Enter 提交**
- **提交前本地 validate:** 两个字段都必填, 否则 shake 动效 + 红色提示
- **CTA 点击** 触发 `launchLens()`:
  1. 从后端 fetch `/api/chat/lens` 拿 SSE stream
  2. 打开 Modal
  3. 开始渲染

### 6.3 LensModal + LensPanel 组件

**完全按 v3 html 里 modal 部分复现。** 关键点:

- 6 张 panel 3x2 grid (980px 以下 2 列, 640 以下 1 列)
- 每张 panel 左上角有 **28x28px 品牌色 logo** (见 platforms.ts 定义)
- panel 右上角:
  - 初始: "⏳ 查询中"
  - 首字到达: "⚡ 0.9s" (用 var(--success) 绿色) 或 "⚡ 4.2s" (用 var(--danger) 红色)
- panel 内容区:
  - 初始 skeleton
  - 收到第一个 token 替换为打字效果 + 光标
  - 完成后底部加 deviation 行: `AI 偏离度  低 · 被充分提及`
- 用户品牌在文字里用 `<span class="brand-highlight">` 高亮 (香槟金背景)
- Modal 底部 CTA 区 delay 3.5s 淡入, 内含:
  - H3: `你的 <em>AI 偏离度</em>评分已生成`
  - 副文案: `AI 时代, 品牌不在答案里 = 品牌不存在。让 Origeno 把你的偏离度降下来。`
  - 主按钮: "立即免费 GEO 诊断 →" (跳 /submit)
  - 次按钮: "再扫一次(剩 1/2)" (达到限额变灰禁用)

### 6.4 platforms.ts 平台元数据

```ts
export const PLATFORMS = [
  { id: 'deepseek', name: 'DeepSeek', logo: 'DS', logoBg: '#4D6BFE' },
  { id: 'kimi',     name: 'Kimi',     logo: 'K',  logoBg: '#1F1F22' },
  { id: 'qwen',     name: '通义千问', logo: '千', logoBg: '#5F5FDD' },
  { id: 'zhipu',    name: '智谱 GLM', logo: '智', logoBg: '#2B7FFF' },
  { id: 'ernie',    name: '文心一言', logo: '文', logoBg: '#E62E5C' },
  { id: 'doubao',   name: '豆包',     logo: '豆', logoBg: '#4A90E2' },
];
```

### 6.5 useLensStream Hook

```ts
export function useLensStream() {
  const [panels, setPanels] = useState<Record<string, PanelState>>({});
  const [status, setStatus] = useState<'idle'|'streaming'|'done'|'error'>('idle');
  
  const start = async (brand: string, question: string) => {
    setStatus('streaming');
    
    // Init panels (6 个 skeleton)
    setPanels(Object.fromEntries(
      PLATFORMS.map(p => [p.id, { status: 'waiting', text: '', latency: null }])
    ));
    
    // Fetch SSE
    const response = await fetch('/api/chat/lens', {
      method: 'POST',
      body: JSON.stringify({ brand, question, turnstile_token, session_id })
    });
    
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunks = decoder.decode(value).split('\n\n').filter(c => c.startsWith('data:'));
      for (const chunk of chunks) {
        const event = JSON.parse(chunk.substring(5));
        handleEvent(event);
      }
    }
  };
  
  const handleEvent = (event) => {
    if (event.type === 'token') {
      setPanels(prev => ({
        ...prev,
        [event.platform]: {
          ...prev[event.platform],
          status: 'streaming',
          text: prev[event.platform].text + event.token,
          latency: event.t_first ?? prev[event.platform].latency
        }
      }));
    } else if (event.type === 'platform_done') {
      setPanels(prev => ({
        ...prev,
        [event.platform]: {
          ...prev[event.platform],
          status: 'done',
          devScore: event.deviation_score,
          devLabel: event.deviation_label
        }
      }));
    } else if (event.type === 'all_done') {
      setStatus('done');
    }
  };
  
  return { panels, status, start };
}
```

### 6.6 埋点上报 (events.ts)

```ts
export function trackEvent(eventType: string, metadata: any = {}) {
  // Fire and forget, 不 await, 不影响主流程
  fetch('/api/chat/event', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      session_id: getSessionId(),
      event_type: eventType,
      metadata
    })
  }).catch(() => {/* silent fail */});
}

// 调用时机
trackEvent('lens_open')         // LensCard mount
trackEvent('lens_submit')       // 点击 "开始扫描"
trackEvent('lens_first_token')  // 任意平台首字到达
trackEvent('lens_complete')     // all_done 收到
trackEvent('cta_click', {target: '/submit'})  // 点击主 CTA
```

### 6.7 视觉还原度要求

**设计稿 100% 还原。** 包括但不限于:
- 每个 CSS value 严格对齐 v3 html
- 字体层级 (serif H2 32px / sans 14px / mono 10px)
- 颜色用 var(--xxx) 而不是 hex (除了平台 logo 背景色)
- 动画时长 (backdrop 0.3s / modal 0.35s / fadeInUp 0.8s delay 3.5s)
- 响应式断点 980px / 640px

### 6.8 验收标准

- [ ] localhost:3000 首屏视觉 **像素级** 匹配 v3 html
- [ ] 填字段 → 按 Enter → 弹窗打开
- [ ] 6 个 skeleton 同时出现 → 先后按延迟填充
- [ ] 每个 panel 右上角延迟标记正确
- [ ] 品牌名在文字里高亮
- [ ] Deviation score 显示正确
- [ ] CTA 淡入时机正确
- [ ] 埋点 lens_open/submit/first_token/complete/cta_click 全部触发
- [ ] 移动端 320px-640px 显示正常
- [ ] 限额 2/2 达到后 CTA 禁用

---

## 阶段 7 · Cloudflare Turnstile + 成本告警 (2 小时)

### 7.1 Turnstile 集成

**Steve 负责创建:** 去 Cloudflare 创建 Turnstile site (Invisible mode), 域名 origeno.io。拿到后:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → 前端 `.env.local`
- `TURNSTILE_SECRET_KEY` → VPS `/root/geo-engine/.env`

**前端集成:**
```tsx
// LensCard.tsx
import Script from 'next/script';

<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" />

// 在提交时
const token = await window.turnstile.execute(siteKey);
await fetch('/api/chat/lens', { ..., body: JSON.stringify({ ..., turnstile_token: token }) });
```

**后端集成:**
```python
async def verify_turnstile(token):
    async with httpx.AsyncClient() as client:
        r = await client.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data={'secret': TURNSTILE_SECRET, 'response': token}
        )
        result = r.json()
        if not result.get('success'):
            raise HTTPException(403, 'turnstile_failed')
```

### 7.2 成本告警

新建 `/root/geo-engine/scripts/chat_cost_monitor.py`:

```python
#!/usr/bin/env python3
"""
Chat cost monitor - runs every hour via cron.
Alerts at ¥20/day, auto-disables Kimi at ¥50/day.
"""
import sqlite3
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

def check_daily_cost():
    conn = sqlite3.connect('/root/geo-engine/geo.db')
    cursor = conn.execute("""
        SELECT SUM(cost_rmb) FROM chat_messages 
        WHERE date(created_at) = date('now')
    """)
    total = cursor.fetchone()[0] or 0
    
    if total > 50:
        # Auto-disable Kimi
        with open('/root/geo-engine/flags/kimi_disabled', 'w') as f:
            f.write(f'Auto-disabled at {datetime.now()} due to cost ¥{total:.2f}')
        send_alert(f'[Origeno] CRITICAL: Daily cost ¥{total:.2f}, Kimi auto-disabled')
    elif total > 20:
        send_alert(f'[Origeno] WARNING: Daily cost ¥{total:.2f} exceeds ¥20 threshold')

def send_alert(message):
    # TODO: 用你的邮件服务, 或直接打到日志 + cron MAILTO
    print(f'[ALERT] {message}', flush=True)
```

Cron 配置:
```
0 * * * * /usr/bin/python3 /root/geo-engine/scripts/chat_cost_monitor.py >> /var/log/chat_cost.log 2>&1
```

### 7.3 验收标准

- [ ] Turnstile 在 Cloudflare 控制台能看到验证记录
- [ ] 人肉跑 3 次 lens 确认 Turnstile 不 block 正常用户
- [ ] 人肉改 date 条件, 验证成本告警脚本能正确触发 (dry-run)

---

## 阶段 8 · 部署 + 回归 + 文档 (1.5-2 小时)

### 8.1 部署顺序

1. **VPS 后端先行:**
   ```bash
   ssh -i ~/.ssh/id_ed25519_origeno root@45.76.111.175
   cd /root/geo-engine
   git pull
   # 运行 migration: ALTER TABLE chat_sessions ADD COLUMN lens_count / chat_messages 加字段
   systemctl restart geo-engine
   # 冒烟测试: curl /api/chat/lens 通, /submit /report 通
   ```

2. **前端 Vercel Preview:**
   - push branch 到 origeno-web repo
   - Vercel 自动部署 preview
   - Steve 自己验收 5 次完整流程

3. **合入 main 切生产:**
   - Vercel promote preview → production
   - origeno.io 自动切换

### 8.2 回归测试

- [ ] Step 1 完整流程: / → /submit → /status → /report
- [ ] /admin 后台 13 条路由全部 200
- [ ] visibility_checker.py 6 平台完整跑一次 (确认 chat_handler 不干扰)
- [ ] chat_messages 磁盘空间 du -sh 合理
- [ ] 现有 /api/chat/stream (单平台) 继续可用
- [ ] 新 /api/chat/lens 冒烟通过

### 8.3 文档更新

**origeno-ops 必更文件:**

1. **`ARCHITECTURE.md`** — 更新 schema:
   - 18 表总览
   - chat_sessions 新增 lens_count
   - chat_messages 新增 lens_batch_id / deviation_score / deviation_label
   - 新索引 idx_messages_lens_batch
   
2. **`BUSINESS.md`** — 新增章节 "Step 0 · GEO Lens":
   - 产品定义 (本 prompt 的 "核心产品定义")
   - 漏斗 L0-L7
   - 月成本 ¥1987 估算
   - Deviation Score v1 算法说明

3. **`PROGRESS.md`** — 标记完成:
   - [x] Step 0 GEO Lens 上线 日期: 2026-04-XX
   - [x] Lumen Azure 设计系统落地
   - 关键指标 (首周) 预留填坑

4. **`WEBSITE.md`** — 更新:
   - Hero 右侧 = LensCard (替代之前的 雷达 / Chat Mini)
   - Lumen Azure 全站 (当前只做 Hero, 其他 section 待后续)

5. **新建 `archive/step0-implementation-2026-04-xx.md`** — 本次实施完整记录:
   - 8 阶段执行时间
   - 遇到的 block 和解法
   - 首周数据待填

### 8.4 Admin 看板雏形 (P1, 可选)

如果时间允许, 新建 `/admin/lens`:
- 今日 lens 次数 / 成本 / 漏斗
- 6 平台首字延迟 P50 实时
- 最近 20 条 brand + question 聚合
- 偏离度分布饼图

**这个不是必须, 放 P1, 做不完下一版本再补。**

---

# 📊 总验收标准 (Steve 自己验证)

- [ ] origeno.io 首页 Hero 右侧看到 LensCard, 视觉 100% 匹配 v3
- [ ] 填 Babycare + 推荐国产母婴品牌 → 扫描 → 6 平台并发回答 → 偏离度显示
- [ ] 回答到达时机符合 Spike V2 基线 (Kimi/DeepSeek 1s / 千问 1.3s / 文心/智谱 1.7s / 豆包 4.2s)
- [ ] 5 次限额生效后友好降级
- [ ] 品牌名在回答里香槟金高亮
- [ ] 点 CTA 跳到 /submit 诊断表单
- [ ] 移动端打开不崩
- [ ] /admin/chat 能看到真实数据
- [ ] ops repo 4 份文档已更新

**最重要:** Steve 自己愿意把这个 URL 发给同行朋友看 ← 这是"产品质感"的最终标尺

---

# 🔐 【硬规则】

1. **严禁触碰 Trading 系统**
2. **生产 geo.db 修改前必须 backup**
3. **现有路由不能改 URL / response schema** — 只允许新增
4. **阶段 4 PII 检测必须在入库前做** (脱敏替换, 不保留原文 PII)
5. **阶段 6 视觉必须对齐 v3 html**, 有歧义立即停下问 Steve
6. **信息披露边界** — 前端代码里**不得出现** analyzer / monitor / deviation (除了 UI 展示用的 deviation_score 字段) / stage_transition / master 等内部模块名
7. **埋点 fire-and-forget** — 埋点失败不影响主对话
8. **API key 继续只在 VPS `.env`**, 永远不进前端代码
9. **Turnstile site 由 Steve 创建** — CC 不登 Cloudflare 账户, 等 Steve 发 keys
10. **VPS 所有文档修正** "香港" → "Vultr 东京"
11. **Deviation 算法是 v1 简单规则**, 注释标记 "v1.1 可升级为 LLM 评估"
12. **Prompt 模板严禁诱导 AI 偏向用户品牌** — 要 AI 给真实回答, 品牌对比在后端做

---

# ⏱️ 时间预算

| 阶段 | 预算 | 依赖 |
|------|------|------|
| 4. 后端 /api/chat/lens | 3-4h | Phase 1-3 已完成 |
| 5. 前端 Lumen Azure 切换 | 1.5h | - |
| 6. Hero + LensCard + LensModal | 6-8h | 阶段 4 + 5 |
| 7. Turnstile + 成本告警 | 2h | 阶段 4 |
| 8. 部署 + 回归 + 文档 | 1.5-2h | 全部 |
| **总计** | **14-18h** ≈ 2 人天 |

建议分布:
- **Day 1 (8h):** 阶段 4 + 5 + 阶段 6 开头 (LensCard)
- **Day 2 (8h):** 阶段 6 收尾 (LensModal + 联调) + 阶段 7 + 阶段 8

---

# 🎯 出错回滚

1. **VPS 后端:** `git revert HEAD && systemctl restart geo-engine` — Phase 1-3 不受影响
2. **前端:** Vercel 一键 rollback 到 main 上一个 deploy
3. **数据库:** chat_* 表新增的 3 个字段 (lens_count / lens_batch_id / deviation_*) 不影响现有 14 表
4. **通知 Steve:** 邮件 hello@origeno.io + 更新 PROGRESS.md 标记 incident

---

# 📋 【Steve 开工前要准备的事】

CC 开工前 **Steve 需要准备好:**

1. [ ] 去 Cloudflare 创建 Turnstile site (invisible mode, 域名 origeno.io), 拿 site_key + secret_key 发给 CC
2. [ ] 确认 `origeno-web/reference/origeno_geo_lens_v3.html` 已在本地 commit + push
3. [ ] 确认 `origeno-ops/DESIGN_SYSTEM.md` 已有 Lumen Azure 完整 tokens (之前已落位)

---

**CC, 这是 Origeno Step 0 GEO Lens 的完整蓝图。今天 Steve 从 Spike V2 的技术验证, 推进到了"AI 偏离度扫描"这个产品定义。设计稿 v3 已定稿, 不要擅自改文案或视觉。**

**每 Phase 完成 commit + push + update PROGRESS.md, 遇到 block 立即停下问, 不要自己拍脑袋决定。**

**豆包继续按 Phase 1 的 STS token + AsyncOpenAI 方案, 4.2s 在 6 平台并发下被最快平台 "掩盖", 用户体感没问题。**

**祝好运。**
