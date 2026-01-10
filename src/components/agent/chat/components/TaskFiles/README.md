# TaskFiles 任务文件组件

显示任务过程中生成的文件列表，支持点击查看文件内容。

## 功能

- 可折叠的文件列表，显示在输入框上方
- 支持文件夹和文档类型
- 点击文件后在右侧画布显示内容
- 文件类型过滤器

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 组件导出入口 |
| `types.ts` | 类型定义 |
| `TaskFileList.tsx` | 文件列表主组件 |
| `TaskFileItem.tsx` | 单个文件项组件 |

## 使用示例

```tsx
import { TaskFileList, type TaskFile } from './components/TaskFiles';

const [files, setFiles] = useState<TaskFile[]>([]);
const [expanded, setExpanded] = useState(false);

<TaskFileList
  files={files}
  selectedFileId={selectedId}
  onFileClick={(file) => console.log('点击文件:', file)}
  expanded={expanded}
  onExpandedChange={setExpanded}
/>
```

## 依赖

- `@/lib/utils` - cn 工具函数
- `lucide-react` - 图标
