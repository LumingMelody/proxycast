# content_creator

> 版本: 1.0.0
> 更新: 2026-01-10

## 模块说明

内容创作服务模块，提供 AI 辅助内容创作的核心后端功能。

## 架构说明

```
content_creator/
├── mod.rs              # 模块入口
├── types.rs            # 类型定义
├── workflow_service.rs # 工作流状态管理
├── step_executor.rs    # 步骤执行器
└── progress_store.rs   # 进度持久化（SQLite）
```

## 文件索引

| 文件 | 说明 |
|------|------|
| `mod.rs` | 模块入口，导出公共 API |
| `types.rs` | 核心类型定义（ThemeType, CreationMode, StepType 等） |
| `workflow_service.rs` | 工作流服务，管理工作流生命周期 |
| `step_executor.rs` | 步骤执行器，执行 AI 任务 |
| `progress_store.rs` | 进度存储，SQLite 持久化 |

## 核心类型

### ThemeType - 创作主题
- `General` - 通用对话
- `Knowledge` - 知识探索
- `SocialMedia` - 社媒内容
- `Document` - 文档写作
- 等 11 种主题

### CreationMode - 创作模式
- `Guided` - 引导模式（AI 提问，用户回答）
- `Fast` - 快速模式（AI 直接生成）
- `Hybrid` - 混合模式（AI 框架 + 用户核心）
- `Framework` - 框架模式（用户框架 + AI 填充）

### StepType - 步骤类型
- `Clarify` - 明确需求
- `Research` - 调研收集
- `Outline` - 生成大纲
- `Write` - 撰写内容
- `Polish` - 润色优化
- `Adapt` - 适配发布

## 使用示例

```rust
use crate::services::content_creator::{
    WorkflowService, StepExecutor, ProgressStore,
    ThemeType, CreationMode,
};

// 创建服务
let workflow_service = WorkflowService::new();
let step_executor = StepExecutor::new();
let progress_store = ProgressStore::new("proxycast.db")?;

// 创建工作流
let workflow = workflow_service
    .create_workflow(ThemeType::Document, CreationMode::Guided)
    .await?;

// 完成步骤
let result = StepResult { user_input: Some(data), ..Default::default() };
let updated = workflow_service
    .complete_step(&workflow.id, result)
    .await?;

// 保存进度
progress_store.save_progress(&updated).await?;
```

## 依赖

- `serde` - 序列化
- `rusqlite` - SQLite 数据库
- `tokio` - 异步运行时
- `tracing` - 日志
- `uuid` - ID 生成
- `chrono` - 时间处理

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
