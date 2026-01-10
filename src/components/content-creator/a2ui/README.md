# A2UI - Agent-to-User Interface

结构化 UI 响应系统，参考 Google A2UI 规范实现。

## 功能概述

A2UI 允许 AI 返回结构化的表单组件，用户通过点击选项来回答，而不是打字输入。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `types.ts` | A2UI 组件类型定义 |
| `parser.ts` | A2UI JSON 解析器，支持简化表单格式 |
| `components/` | React 组件渲染器 |

## 支持的格式

### 1. 简化表单格式（推荐）

AI 返回简单的 JSON 格式，系统自动转换为完整 A2UI：

```json
{
  "type": "form",
  "title": "收集偏好",
  "description": "请选择你的偏好设置",
  "fields": [
    {
      "id": "audience",
      "type": "choice",
      "label": "目标受众",
      "options": [
        {"value": "business", "label": "商务人士"},
        {"value": "consumer", "label": "普通消费者"}
      ],
      "default": "business"
    }
  ],
  "submitLabel": "确认"
}
```

### 2. 完整 A2UI 格式

符合 A2UI 规范的完整组件树结构。

## 支持的组件

- **布局**: Row, Column, Card, Divider
- **展示**: Text, Icon, Image
- **交互**: Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput

## 使用方式

AI 响应中使用 `\`\`\`a2ui` 代码块包裹 JSON：

```markdown
\`\`\`a2ui
{
  "type": "form",
  ...
}
\`\`\`
```

## 依赖关系

- 被 `StreamingRenderer` 组件使用
- 被 `AgentChatPage` 处理表单提交
