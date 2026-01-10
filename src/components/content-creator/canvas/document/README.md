# 文档画布 (document)

> 版本: 1.0.0
> 更新: 2026-01-10

## 模块说明

文档画布提供 Markdown 文档的编辑、预览和多平台样式适配功能。

## 功能特性

- ✅ Markdown 渲染（GFM 扩展）
- ✅ 代码块语法高亮
- ✅ 多平台样式预览（公众号、小红书、知乎）
- ✅ 版本管理
- ✅ 编辑模式
- ✅ 导出功能（Markdown、纯文本、剪贴板）

## 目录结构

```
document/
├── hooks/
│   ├── useDocumentCanvas.ts  # 画布状态管理
│   └── useVersions.ts        # 版本管理
├── platforms/
│   ├── index.ts              # 导出入口
│   ├── MarkdownRenderer.tsx  # GitHub 风格
│   ├── WechatRenderer.tsx    # 公众号样式
│   ├── XiaohongshuRenderer.tsx # 小红书样式
│   └── ZhihuRenderer.tsx     # 知乎样式
├── DocumentCanvas.tsx        # 画布主组件
├── DocumentToolbar.tsx       # 工具栏
├── DocumentRenderer.tsx      # 渲染器
├── DocumentEditor.tsx        # 编辑器
├── PlatformTabs.tsx          # 平台切换
├── VersionSelector.tsx       # 版本选择
├── types.ts                  # 类型定义
└── index.tsx                 # 导出入口
```

## 文件索引

| 文件 | 说明 |
|------|------|
| `types.ts` | 类型定义（PlatformType、DocumentVersion 等） |
| `index.tsx` | 模块导出入口 |
| `DocumentCanvas.tsx` | 画布主组件，整合工具栏、渲染器、编辑器 |
| `DocumentToolbar.tsx` | 工具栏（版本、编辑、导出、关闭） |
| `DocumentRenderer.tsx` | 根据平台类型选择渲染器 |
| `DocumentEditor.tsx` | Markdown 源码编辑器 |
| `PlatformTabs.tsx` | 平台切换标签 |
| `VersionSelector.tsx` | 版本选择下拉菜单 |

### hooks/

| 文件 | 说明 |
|------|------|
| `useDocumentCanvas.ts` | 画布状态管理 Hook |
| `useVersions.ts` | 版本管理 Hook（localStorage 持久化） |

### platforms/

| 文件 | 说明 |
|------|------|
| `index.ts` | 平台渲染器导出 |
| `MarkdownRenderer.tsx` | GitHub 风格 Markdown 渲染 |
| `WechatRenderer.tsx` | 微信公众号样式 |
| `XiaohongshuRenderer.tsx` | 小红书笔记样式 |
| `ZhihuRenderer.tsx` | 知乎专栏样式 |

## 使用示例

### 基础使用

```tsx
import {
  DocumentCanvas,
  createInitialDocumentState,
  type DocumentCanvasState,
} from '@/components/content-creator/canvas/document'

function MyPage() {
  const [state, setState] = useState<DocumentCanvasState>(() =>
    createInitialDocumentState('# 标题\n\n这是内容')
  )

  return (
    <DocumentCanvas
      state={state}
      onStateChange={setState}
      onClose={() => setShowCanvas(false)}
    />
  )
}
```

### 使用 Hook

```tsx
import { useDocumentCanvas } from '@/components/content-creator/canvas/document'

function MyComponent() {
  const {
    state,
    currentVersion,
    updateContent,
    switchPlatform,
    switchVersion,
    startEditing,
    saveEditing,
    exportDocument,
  } = useDocumentCanvas('初始内容')

  // 更新内容并创建新版本
  updateContent('新内容', '版本描述')

  // 切换平台预览
  switchPlatform('wechat')

  // 导出
  exportDocument('clipboard')
}
```

## 平台样式

| 平台 | 特点 |
|------|------|
| `markdown` | GitHub 风格，代码高亮 |
| `wechat` | 居中标题，段落缩进，无外链 |
| `xiaohongshu` | 短文风格，emoji 友好，话题标签高亮 |
| `zhihu` | 长文风格，引用来源格式，深色代码块 |

## 依赖

- `react-markdown` - Markdown 解析
- `remark-gfm` - GFM 扩展支持
- `react-syntax-highlighter` - 代码高亮
- `styled-components` - 样式
