# Workspace 组件

Workspace 相关的 React 组件。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 组件导出 |
| `WorkspaceSelector.tsx` | Workspace 选择器下拉组件 |

## 组件

### WorkspaceSelector

Workspace 选择器组件，用于切换和管理工作目录。

```tsx
import { WorkspaceSelector } from '@/components/workspace';

<WorkspaceSelector
  onSelect={(workspace) => console.log('选中:', workspace)}
  onAddClick={() => openAddDialog()}
/>
```

## 相关 Hook

- `useWorkspace` - Workspace 管理 Hook
