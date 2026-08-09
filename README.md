# 赛博灵堂 cyber-lingtang

## 🚀 部署指南

### 绑定 KV 命名空间

- **变量名称**：填写 `INCENSE_KV`

## ⚙️ 环境变量 & KV 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `MAX_USER_INCENSE` | 每人最多上香次数 | `3` |
| `BIOGRAPHY` | 逝者生平（支持 `\n` 换行） | `愿逝者安息，生者坚强。` |
| `EPITAPH_LEFT` | 左侧挽联（下联） | `音容宛在` |
| `EPITAPH_RIGHT` | 右侧挽联（上联） | `浩气长存` |
| `BACKGROUND_IMAGE` | 背景图片 URL | 无（纯色背景） |
| `PORTRAIT_URL` | 遗像图片 URL | 内置占位 SVG |
| `TABLET_NAME` | 牌位主名（大标题） | `追思` |
| `TABLET_SUB` | 牌位副标题 | `· 永怀 ·` |
| `PAGE_TITLE` | 浏览器标签页标题 | `灵堂 · 追思` |

### KV 存储（可选，优先级高于环境变量）

| KV 键名 | 描述 |
|---------|------|
| `biography` | 生平文本（支持换行） |
| `epitaph_left` | 左侧挽联内容 |
| `epitaph_right` | 右侧挽联内容 |

> 💡 **优先级**：KV > 环境变量 > 默认值


## 屏幕截图 Screenshot

![screenshot.jpeg](screenshot.jpeg)
