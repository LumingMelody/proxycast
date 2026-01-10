# chat

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

通用对话模块 - ProxyCast 的核心功能。提供即时对话能力，支持 Markdown 渲染、代码高亮、流式响应。

## 功能特性

- **即时对话**：打开即用，无需选择主题
- **Markdown 渲染**：支持标题、列表、粗体、斜体、链接等
- **代码高亮**：支持 12+ 种编程语言语法高亮
- **一键复制**：代码块支持一键复制
- **流式响应**：打字机效果，实时显示 AI 回复
- **主题选择**：底部提供创作主题入口

## 文件索引

- `index.ts` - 模块导出入口
- `ChatPage.tsx` - 通用对话主页面
- `types.ts` - 类型定义

### components/

- `CodeBlock.tsx` - 代码块组件（语法高亮 + 复制）
- `MessageItem.tsx` - 单条消息组件
- `MessageList.tsx` - 消息列表组件
- `InputBar.tsx` - 输入栏组件
- `ThemeSelector.tsx` - 主题选择器
- `ModeSelector.tsx` - 创作模式选择器
- `EmptyState.tsx` - 空状态欢迎界面
- `index.ts` - 组件导出入口

### hooks/

- `useChat.ts` - 对话状态管理 Hook
- `useStreaming.ts` - 流式响应处理 Hook
- `index.ts` - Hooks 导出入口

## 使用示例

```tsx
import { ChatPage } from '@/components/chat'

function App() {
  return <ChatPage />
}
```

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
