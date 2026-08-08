# 赛博灵堂 cyber-lingtang

## 🚀 部署指南

### 绑定 KV 命名空间

- **变量名称**：填写 `INCENSE_KV`

## ⚙️ 配置说明

### 🖼️ 自定义照片与文字

- **遗像**：在 `worker.js` 的 `getHTML()` 函数中，找到 `<img src="data:image/...">`，将 `src` 替换为你的图片 URL（建议使用 Cloudflare Images 或任何可公开访问的链接）。
- **牌位文字**：修改 `<div class="name">追思</div>` 和 `<div class="sub">· 永怀 ·</div>` 的内容。
- **标题**：修改 `<title>` 标签。

### ⚙️ 环境变量 & KV 配置说明

#### 环境变量（在 Cloudflare Worker 设置中添加）

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `MAX_USER_INCENSE` | 每位用户最多可上香的次数 | `3` |
| `BIOGRAPHY` | 逝者生平（支持 `\n` 换行） | `愿逝者安息，生者坚强。` |
| `EPITAPH_LEFT` | 左侧挽联（观者左手边，即下联） | `音容宛在` |
| `EPITAPH_RIGHT` | 右侧挽联（观者右手边，即上联） | `浩气长存` |
| `BACKGROUND_IMAGE` | 背景图片 URL | 无（纯色背景） |

#### KV 存储（可选，优先级高于环境变量）

| KV 键名 | 描述 |
|---------|------|
| `biography` | 生平文本（支持换行） |
| `epitaph_left` | 左侧挽联内容 |
| `epitaph_right` | 右侧挽联内容 |

> 💡 **优先级**：KV > 环境变量 > 默认值


## 屏幕截图 Screenshot

![screenshot.jpeg](screenshot.jpeg)
