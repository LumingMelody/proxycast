# hooks

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

React 自定义 Hooks，封装业务逻辑和状态管理。
通过 Tauri invoke 与 Rust 后端通信。

## 文件索引

- `index.ts` - Hooks 导出入口
- `useApiKeyProvider.ts` - API Key Provider 管理 Hook（Requirements 9.1）
- `useConnectCallback.ts` - Connect 统计回调 Hook（Requirements 5.3）
- `useDeepLink.ts` - Deep Link 事件处理 Hook（Requirements 5.1, 5.2, 5.3, 5.4）
- `useErrorHandler.ts` - 错误处理 Hook
- `useFileMonitoring.ts` - 文件监控 Hook
- `useFlowActions.ts` - 流量操作 Hook
- `useFlowEvents.ts` - 流量事件 Hook
- `useFlowNotifications.ts` - 流量通知 Hook
- `useMcpServers.ts` - MCP 服务器管理 Hook
- `useOAuthCredentials.ts` - OAuth 凭证管理 Hook
- `usePrompts.ts` - Prompt 管理 Hook
- `useProviderPool.ts` - Provider 池管理 Hook
- `useProviderState.ts` - Provider 状态 Hook
- `useRelayRegistry.ts` - Relay Registry 管理 Hook（Requirements 2.1, 7.2, 7.3）
- `useSkills.ts` - 技能管理 Hook
- `useSound.ts` - 音效管理 Hook（工具调用和打字机音效）
- `useSwitch.ts` - 开关状态 Hook
- `useTauri.ts` - Tauri 通用 Hook
- `useWindowResize.ts` - 窗口大小 Hook
- `useWorkspace.ts` - Workspace 工作目录管理 Hook

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
