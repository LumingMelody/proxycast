//! 步骤执行器
//!
//! 负责执行工作流中的 AI 任务

use super::types::*;
use anyhow::Result;
use tracing::{debug, info};

/// 步骤执行器
pub struct StepExecutor;

impl StepExecutor {
    /// 创建新的步骤执行器
    pub fn new() -> Self {
        Self
    }

    /// 执行步骤的 AI 任务
    pub async fn execute_step(
        &self,
        step: &WorkflowStep,
        context: &StepExecutionContext,
    ) -> Result<StepResult> {
        let task = step
            .definition
            .ai_task
            .as_ref()
            .ok_or_else(|| anyhow::anyhow!("步骤没有 AI 任务配置"))?;

        info!("执行步骤: {} ({})", step.definition.title, task.task_type);

        match task.task_type.as_str() {
            "research" => self.execute_research(context).await,
            "outline" => self.execute_outline(context).await,
            "write" => self.execute_write(context).await,
            "polish" => self.execute_polish(context).await,
            _ => Err(anyhow::anyhow!("未知的任务类型: {}", task.task_type)),
        }
    }

    /// 执行调研任务
    async fn execute_research(&self, context: &StepExecutionContext) -> Result<StepResult> {
        debug!("执行调研任务，主题: {:?}", context.topic);

        // TODO: 集成实际的 AI 调研功能
        // 目前返回 mock 数据

        Ok(StepResult {
            user_input: None,
            ai_output: Some(serde_json::json!({
                "sources": [
                    {
                        "title": "相关资料 1",
                        "summary": "这是一段关于主题的摘要...",
                        "url": "https://example.com/1"
                    },
                    {
                        "title": "相关资料 2",
                        "summary": "另一段相关内容的摘要...",
                        "url": "https://example.com/2"
                    }
                ],
                "key_points": [
                    "关键点 1",
                    "关键点 2",
                    "关键点 3"
                ]
            })),
            artifacts: None,
        })
    }

    /// 执行大纲生成任务
    async fn execute_outline(&self, context: &StepExecutionContext) -> Result<StepResult> {
        debug!("执行大纲生成任务，主题: {:?}", context.topic);

        // TODO: 集成实际的 AI 大纲生成功能

        Ok(StepResult {
            user_input: None,
            ai_output: Some(serde_json::json!({
                "sections": [
                    {
                        "title": "引言",
                        "description": "介绍主题背景和重要性",
                        "subsections": []
                    },
                    {
                        "title": "核心内容",
                        "description": "详细阐述主要观点",
                        "subsections": [
                            { "title": "观点一", "description": "..." },
                            { "title": "观点二", "description": "..." }
                        ]
                    },
                    {
                        "title": "总结",
                        "description": "总结全文，展望未来",
                        "subsections": []
                    }
                ]
            })),
            artifacts: None,
        })
    }

    /// 执行内容撰写任务
    async fn execute_write(&self, context: &StepExecutionContext) -> Result<StepResult> {
        debug!("执行内容撰写任务，主题: {:?}", context.topic);

        // TODO: 集成实际的 AI 内容生成功能

        Ok(StepResult {
            user_input: None,
            ai_output: Some(serde_json::json!({
                "content": "# 文章标题\n\n这是 AI 生成的内容...\n\n## 第一部分\n\n详细内容...",
                "word_count": 500
            })),
            artifacts: Some(vec![ContentFile {
                id: uuid::Uuid::new_v4().to_string(),
                name: "draft.md".to_string(),
                file_type: "markdown".to_string(),
                content: Some("# 文章标题\n\n这是 AI 生成的内容...".to_string()),
                created_at: chrono::Utc::now().timestamp_millis(),
                updated_at: chrono::Utc::now().timestamp_millis(),
                thumbnail: None,
                metadata: None,
            }]),
        })
    }

    /// 执行润色优化任务
    async fn execute_polish(&self, context: &StepExecutionContext) -> Result<StepResult> {
        debug!("执行润色优化任务，主题: {:?}", context.topic);

        // TODO: 集成实际的 AI 润色功能

        Ok(StepResult {
            user_input: None,
            ai_output: Some(serde_json::json!({
                "suggestions": [
                    {
                        "type": "grammar",
                        "original": "原文",
                        "suggestion": "建议修改",
                        "reason": "修改原因"
                    }
                ],
                "score": {
                    "readability": 85,
                    "grammar": 90,
                    "style": 80
                }
            })),
            artifacts: None,
        })
    }
}

impl Default for StepExecutor {
    fn default() -> Self {
        Self::new()
    }
}

/// 步骤执行上下文
#[derive(Debug, Clone)]
pub struct StepExecutionContext {
    /// 工作流 ID
    pub workflow_id: String,
    /// 主题
    pub topic: Option<String>,
    /// 目标读者
    pub audience: Option<String>,
    /// 内容风格
    pub style: Option<String>,
    /// 之前步骤的结果
    pub previous_results: Vec<StepResult>,
}

impl StepExecutionContext {
    /// 从工作流状态创建执行上下文
    pub fn from_workflow(workflow: &WorkflowState) -> Self {
        let mut topic = None;
        let mut audience = None;
        let mut style = None;
        let mut previous_results = Vec::new();

        // 从已完成的步骤中提取信息
        for step in &workflow.steps {
            if let Some(result) = &step.result {
                previous_results.push(result.clone());

                // 从 clarify 步骤提取基本信息
                if step.definition.step_type == StepType::Clarify {
                    if let Some(input) = &result.user_input {
                        topic = input
                            .get("topic")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        audience = input
                            .get("audience")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        style = input
                            .get("style")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                    }
                }
            }
        }

        Self {
            workflow_id: workflow.id.clone(),
            topic,
            audience,
            style,
            previous_results,
        }
    }
}
