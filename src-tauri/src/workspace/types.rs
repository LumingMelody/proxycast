//! Workspace 类型定义
//!
//! 定义 Workspace 相关的数据结构和类型。

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Workspace 唯一标识
pub type WorkspaceId = String;

/// Workspace 类型
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceType {
    /// 持久化 workspace
    #[default]
    Persistent,
    /// 临时 workspace（自动清理）
    Temporary,
}

impl WorkspaceType {
    pub fn as_str(&self) -> &'static str {
        match self {
            WorkspaceType::Persistent => "persistent",
            WorkspaceType::Temporary => "temporary",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "temporary" => WorkspaceType::Temporary,
            _ => WorkspaceType::Persistent,
        }
    }
}

/// Workspace 级别设置
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkspaceSettings {
    /// Workspace 级 MCP 配置
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mcp_config: Option<serde_json::Value>,
    /// 默认 provider
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_provider: Option<String>,
    /// 自动压缩 context
    #[serde(default)]
    pub auto_compact: bool,
}

/// Workspace 元数据
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    /// 唯一标识
    pub id: WorkspaceId,
    /// 显示名称
    pub name: String,
    /// Workspace 类型
    pub workspace_type: WorkspaceType,
    /// 根目录路径（对应 Aster Session.working_dir）
    pub root_path: PathBuf,
    /// 是否为默认 workspace
    pub is_default: bool,
    /// 创建时间
    pub created_at: DateTime<Utc>,
    /// 更新时间
    pub updated_at: DateTime<Utc>,
    /// Workspace 级别设置
    pub settings: WorkspaceSettings,
}

/// Workspace 更新请求
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WorkspaceUpdate {
    /// 新名称
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// 新设置
    #[serde(skip_serializing_if = "Option::is_none")]
    pub settings: Option<WorkspaceSettings>,
}

/// Workspace 创建请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceCreateRequest {
    /// 显示名称
    pub name: String,
    /// 根目录路径
    pub root_path: String,
    /// Workspace 类型（可选，默认 persistent）
    #[serde(default)]
    pub workspace_type: WorkspaceType,
}
