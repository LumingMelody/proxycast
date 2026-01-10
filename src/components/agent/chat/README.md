# AI Agent 聊天模块

> 版本: 1.1.0
> 更新: 2026-01-10

## 模块说明

AI Agent 聊天页面，支持通用对话和内容创作两种模式。集成了布局过渡、步骤引导等内容创作功能。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.tsx` | AgentChatPage 主组件，集成布局过渡和工作流 |
| `types.ts` | 类型定义（Message、Provider 配置等） |

### components/

| 文件 | 说明 |
|------|------|
| `ChatNavbar.tsx` | 顶部导航栏（模型选择、设置等） |
| `ChatSidebar.tsx` | 侧边栏（话题列表） |
| `ChatSettings.tsx` | 设置面板 |
| `MessageList.tsx` | 消息列表组件 |
| `Inputbar.tsx` | 输入栏组件 |
| `EmptyState.tsx` | 空状态引导（主题选择、模式选择） |

### hooks/

| 文件 | 说明 |
|------|------|
| `useAgentChat.ts` | 聊天状态管理 Hook |

## 核心功能

### 1. 通用对话
- 多轮对话上下文
- 流式响应
- Markdown 渲染
- 代码高亮

### 2. 内容创作模式
- 6 种创作主题（知识探索、计划规划、社媒内容、图文海报、办公文档、短视频）
- 4 种创作模式（引导/快速/混合/框架）
- 步骤进度条（仅内容创作主题）
- 布局过渡（对话 ↔ 对话+画布）

## 依赖模块

- `@/components/content-creator/core/LayoutTransition` - 布局过渡
- `@/components/content-creator/core/StepGuide` - 步骤引导
- `@/components/content-creator/hooks/useWorkflow` - 工作流状态

## 使用示例

```tsx
import { AgentChatPage } from '@/components/agent/chat'

function App() {
  return <AgentChatPage onNavigate={(page) => console.log(page)} />
}
```
