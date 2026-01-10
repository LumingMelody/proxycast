# 画布模块 (canvas)

> 版本: 1.0.0
> 更新: 2026-01-10

## 模块说明

画布模块提供内容创作的可视化编辑和预览功能，支持多种画布类型。

## 目录结构

```
canvas/
└── document/                # 文档画布
    ├── hooks/               # 状态管理 Hooks
    ├── platforms/           # 平台样式渲染器
    ├── DocumentCanvas.tsx   # 画布主组件
    ├── DocumentToolbar.tsx  # 工具栏组件
    ├── DocumentRenderer.tsx # 渲染器组件
    ├── DocumentEditor.tsx   # 编辑器组件
    ├── PlatformTabs.tsx     # 平台切换标签
    ├── VersionSelector.tsx  # 版本选择器
    ├── types.ts             # 类型定义
    └── index.tsx            # 导出入口
```

## 画布类型

| 类型 | 说明 | 支持主题 |
|------|------|---------|
| `document` | 文档画布 | 社媒内容、办公文档、知识探索 |

## 使用示例

```tsx
import { DocumentCanvas, createInitialDocumentState } from './canvas/document'

function MyPage() {
  const [state, setState] = useState(() => createInitialDocumentState('# Hello'))

  return (
    <DocumentCanvas
      state={state}
      onStateChange={setState}
      onClose={() => console.log('关闭画布')}
    />
  )
}
```

## 扩展画布

添加新画布类型时：

1. 在 `canvas/` 下创建新目录
2. 实现画布组件和类型定义
3. 在 `CanvasRegistry` 中注册
