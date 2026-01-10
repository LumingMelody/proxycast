# 内容创作模块 (content-creator)

> 版本: 1.0.0
> 更新: 2026-01-10

## 模块说明

内容创作模块提供 AI 辅助内容创作的核心功能，包括步骤引导、表单组件、画布系统和布局切换等。

## 目录结构

```
content-creator/
├── a2ui/                    # A2UI 结构化 UI 响应系统
│   ├── components/          # React 组件渲染器
│   ├── index.ts             # 模块导出
│   ├── parser.ts            # JSON 解析器
│   └── types.ts             # 类型定义
├── canvas/                  # 画布模块
│   └── document/            # 文档画布
├── core/                    # 核心组件
│   ├── CanvasContainer/     # 画布容器系统
│   ├── FormComponents/      # 表单组件库
│   ├── LayoutTransition/    # 布局切换动画
│   └── StepGuide/           # 步骤引导组件
├── hooks/                   # React Hooks
│   ├── useContentCreator.ts # 内容创作状态管理
│   ├── usePersistence.ts    # 状态持久化
│   └── useWorkflow.ts       # 工作流管理
├── utils/                   # 工具函数
│   └── systemPrompt.ts      # 系统提示词生成器
└── types.ts                 # 类型定义
```

### a2ui/

A2UI (Agent-to-User Interface) 结构化 UI 响应系统，参考 Google A2UI 规范。

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `types.ts` | A2UI 组件类型定义 |
| `parser.ts` | JSON 解析器，支持简化表单格式和完整 A2UI 格式 |
| `components/index.tsx` | React 组件渲染器 |

### canvas/document/

| 文件 | 说明 |
|------|------|
| `index.tsx` | 模块导出入口 |
| `types.ts` | 类型定义 |
| `DocumentCanvas.tsx` | 画布主组件 |
| `DocumentToolbar.tsx` | 工具栏组件 |
| `DocumentRenderer.tsx` | Markdown 渲染器 |
| `DocumentEditor.tsx` | 编辑器组件 |
| `PlatformTabs.tsx` | 平台切换标签 |
| `VersionSelector.tsx` | 版本选择器 |
| `hooks/` | 状态管理 Hooks |
| `platforms/` | 平台样式渲染器 |

## 文件索引

| 文件 | 说明 |
|------|------|
| `types.ts` | 内容创作相关类型定义 |

### core/CanvasContainer/

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `CanvasRegistry.ts` | 画布插件注册中心 |
| `CanvasContainer.tsx` | 画布容器组件（懒加载、错误边界） |
| `CanvasSkeleton.tsx` | 画布加载骨架屏 |

### core/FormComponents/

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `TextInput.tsx` | 单行文本输入 |
| `TextArea.tsx` | 多行文本输入 |
| `Select.tsx` | 下拉选择框 |
| `RadioGroup.tsx` | 单选按钮组 |
| `CheckboxGroup.tsx` | 复选框组 |
| `Slider.tsx` | 滑块选择器 |
| `TagInput.tsx` | 标签输入框 |

### core/LayoutTransition/

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `LayoutTransition.tsx` | 布局切换动画组件 |
| `useLayoutTransition.ts` | 布局过渡状态 Hook |

### core/StepGuide/

| 文件 | 说明 |
|------|------|
| `StepProgress.tsx` | 步骤进度条 |
| `StepCard.tsx` | 步骤卡片 |
| `StepForm.tsx` | 步骤表单渲染 |
| `StepActions.tsx` | 步骤操作按钮 |
| `StepResult.tsx` | 步骤结果展示 |

### hooks/

| 文件 | 说明 |
|------|------|
| `index.ts` | Hooks 导出入口 |
| `useContentCreator.ts` | 内容创作核心状态管理 |
| `useWorkflow.ts` | 工作流步骤管理 |
| `usePersistence.ts` | 状态持久化（localStorage） |

### utils/

| 文件 | 说明 |
|------|------|
| `systemPrompt.ts` | 系统提示词生成器，根据创作主题生成 AI 系统提示词，包含工作流引导、写作模式、反 AI 检测指南 |

## 系统提示词设计

系统提示词是内容创作模式的核心，通过提示词引导 AI 按工作流步骤协助用户创作。

### 核心功能

1. **工作流引导** - 6 步创作流程（明确需求→调研收集→生成大纲→撰写内容→润色优化→适配发布）
2. **写作模式** - 3 种模式可选（教练模式/快速模式/混合模式）
3. **反 AI 检测** - 套话库、AI 句式库、口语化表达指南
4. **主题特化** - 11 种主题的专属指导（社媒、论文、小说等）

### 使用方式

```tsx
import { generateContentCreationPrompt, isContentCreationTheme } from './utils/systemPrompt'

// 判断是否为内容创作模式
if (isContentCreationTheme(theme)) {
  // 生成系统提示词
  const systemPrompt = generateContentCreationPrompt(theme)
  // 传递给 AI 会话
  createSession({ systemPrompt })
}
```

## 使用示例

### 基础使用

```tsx
import { useContentCreator, useWorkflow, usePersistence } from './hooks'
import { LayoutTransition } from './core/LayoutTransition'
import { CanvasContainer } from './core/CanvasContainer'

function ContentCreatorPage() {
  const { mode, theme, setTheme, openFile, closeFile } = useContentCreator()
  const { steps, currentStep, completeStep, skipStep } = useWorkflow(theme, 'guided')
  const { persistTheme, getPersistedTheme } = usePersistence()

  // 初始化时恢复主题
  useEffect(() => {
    const saved = getPersistedTheme()
    if (saved) setTheme(saved)
  }, [])

  return (
    <LayoutTransition
      mode={mode}
      chatContent={<ChatPanel />}
      canvasContent={<CanvasContainer ... />}
    />
  )
}
```

### 表单组件

```tsx
import { TextInput, Select, RadioGroup, TagInput } from './core/FormComponents'

function MyForm() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('')
  const [tags, setTags] = useState<string[]>([])

  return (
    <>
      <TextInput
        name="topic"
        label="内容主题"
        value={topic}
        onChange={setTopic}
        required
      />
      <RadioGroup
        name="style"
        label="内容风格"
        value={style}
        onChange={setStyle}
        options={[
          { label: '专业严谨', value: 'professional' },
          { label: '轻松活泼', value: 'casual' },
        ]}
      />
      <TagInput
        name="keywords"
        label="关键词"
        value={tags}
        onChange={setTags}
        maxTags={5}
      />
    </>
  )
}
```

## 依赖关系

- `styled-components` - 样式
- `lucide-react` - 图标
- `@/components/ui/button` - UI 按钮组件
