# System Prompt 模块

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

为 Aster Agent 提供 System Prompt 配置，参考 claude-code-open 的设计。

### 设计决策

- **模块化模板**：将 System Prompt 拆分为多个独立模板，便于维护和定制
- **自动注入**：Agent 初始化时自动注入 System Prompt
- **环境感知**：自动添加当前日期、操作系统、工作目录等环境信息

## 文件索引

| 文件 | 说明 |
|------|------|
| `mod.rs` | 模块入口，导出公共类型 |
| `templates.rs` | 提示词模板定义 |
| `builder.rs` | 提示词构建器 |

## 模板内容

| 模板 | 说明 |
|------|------|
| `CORE_IDENTITY` | Agent 身份描述 |
| `TOOL_GUIDELINES` | 工具使用策略（read/write/edit/glob/grep/bash） |
| `CODING_GUIDELINES` | 代码编写指南 |
| `TASK_MANAGEMENT` | 任务管理（TodoWrite 使用） |
| `GIT_GUIDELINES` | Git 操作安全规则 |
| `OUTPUT_STYLE` | 输出风格指南 |

## 使用方式

### 基本使用

```rust
use crate::agent::prompt::SystemPromptBuilder;

let prompt = SystemPromptBuilder::new()
    .working_dir("/path/to/project")
    .build();
```

### 添加自定义指令

```rust
let prompt = SystemPromptBuilder::new()
    .working_dir("/path/to/project")
    .custom_instructions("额外的项目特定指令")
    .build();
```

### 在 AsterAgentState 中的集成

System Prompt 在 `init_agent()` 时自动注入：

```rust
// 初始化时自动注入 System Prompt
state.init_agent().await?;

// 也可以动态添加自定义指令
state.add_custom_instructions("额外指令").await?;
```
