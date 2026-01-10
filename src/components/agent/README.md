# Agent 模块

> 版本: 1.0.0
> 更新: 2026-01-10

## 模块说明

AI Agent 相关组件，包括聊天页面和技能面板。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `AgentChatPage.tsx` | Agent 聊天页面（旧版，已迁移到 chat/） |
| `AgentSkillsPanel.tsx` | Agent 技能面板 |

### chat/

AI Agent 聊天模块，详见 [chat/README.md](./chat/README.md)

| 文件 | 说明 |
|------|------|
| `index.tsx` | AgentChatPage 主组件 |
| `types.ts` | 类型定义 |
| `components/` | 子组件（Navbar、Sidebar、MessageList 等） |
| `hooks/` | Hooks（useAgentChat） |
