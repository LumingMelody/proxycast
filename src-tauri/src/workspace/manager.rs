//! Workspace 管理器
//!
//! 提供 Workspace 的 CRUD 操作和与 Aster Session 的关联。

use super::types::{Workspace, WorkspaceId, WorkspaceSettings, WorkspaceType, WorkspaceUpdate};
use crate::database::DbConnection;
use chrono::Utc;
use rusqlite::params;
use std::path::PathBuf;
use uuid::Uuid;

/// Workspace 管理器
#[derive(Clone)]
pub struct WorkspaceManager {
    db: DbConnection,
}

impl WorkspaceManager {
    /// 创建新的 WorkspaceManager
    pub fn new(db: DbConnection) -> Self {
        Self { db }
    }

    /// 创建新 workspace
    pub fn create(&self, name: String, root_path: PathBuf) -> Result<Workspace, String> {
        self.create_with_type(name, root_path, WorkspaceType::Persistent)
    }

    /// 创建指定类型的 workspace
    pub fn create_with_type(
        &self,
        name: String,
        root_path: PathBuf,
        workspace_type: WorkspaceType,
    ) -> Result<Workspace, String> {
        let now = Utc::now();
        let id = Uuid::new_v4().to_string();
        let root_path_str = root_path.to_str().ok_or("无效的路径")?.to_string();

        let workspace = Workspace {
            id: id.clone(),
            name,
            workspace_type,
            root_path,
            is_default: false,
            created_at: now,
            updated_at: now,
            settings: WorkspaceSettings::default(),
        };

        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        // 检查路径是否已存在
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM workspaces WHERE root_path = ?)",
                params![&root_path_str],
                |row| row.get(0),
            )
            .map_err(|e| format!("检查路径失败: {}", e))?;

        if exists {
            return Err(format!("路径已存在: {}", root_path_str));
        }

        let settings_json =
            serde_json::to_string(&workspace.settings).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO workspaces (id, name, workspace_type, root_path, is_default, settings_json, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                &workspace.id,
                &workspace.name,
                workspace.workspace_type.as_str(),
                &root_path_str,
                workspace.is_default,
                &settings_json,
                workspace.created_at.timestamp_millis(),
                workspace.updated_at.timestamp_millis(),
            ],
        )
        .map_err(|e| format!("创建 workspace 失败: {}", e))?;

        tracing::info!(
            "[Workspace] 创建: id={}, name={}, path={}",
            workspace.id,
            workspace.name,
            root_path_str
        );

        Ok(workspace)
    }

    /// 获取 workspace
    pub fn get(&self, id: &WorkspaceId) -> Result<Option<Workspace>, String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        let result = conn.query_row(
            "SELECT id, name, workspace_type, root_path, is_default, settings_json, created_at, updated_at
             FROM workspaces WHERE id = ?",
            params![id],
            |row| {
                Ok(Self::row_to_workspace(row)?)
            },
        );

        match result {
            Ok(workspace) => Ok(Some(workspace)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("获取 workspace 失败: {}", e)),
        }
    }

    /// 通过路径获取 workspace
    pub fn get_by_path(&self, root_path: &PathBuf) -> Result<Option<Workspace>, String> {
        let root_path_str = root_path.to_str().ok_or("无效的路径")?;

        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        let result = conn.query_row(
            "SELECT id, name, workspace_type, root_path, is_default, settings_json, created_at, updated_at
             FROM workspaces WHERE root_path = ?",
            params![root_path_str],
            |row| {
                Ok(Self::row_to_workspace(row)?)
            },
        );

        match result {
            Ok(workspace) => Ok(Some(workspace)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("获取 workspace 失败: {}", e)),
        }
    }

    /// 列出所有 workspace
    pub fn list(&self) -> Result<Vec<Workspace>, String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        let mut stmt = conn
            .prepare(
                "SELECT id, name, workspace_type, root_path, is_default, settings_json, created_at, updated_at
                 FROM workspaces ORDER BY updated_at DESC",
            )
            .map_err(|e| format!("准备查询失败: {}", e))?;

        let workspaces = stmt
            .query_map([], |row| Ok(Self::row_to_workspace(row)?))
            .map_err(|e| format!("查询失败: {}", e))?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("解析结果失败: {}", e))?;

        Ok(workspaces)
    }

    /// 更新 workspace
    pub fn update(&self, id: &WorkspaceId, updates: WorkspaceUpdate) -> Result<Workspace, String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;
        let now = Utc::now().timestamp_millis();

        // 构建更新语句
        let mut set_clauses = vec!["updated_at = ?"];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now)];

        if let Some(ref name) = updates.name {
            set_clauses.push("name = ?");
            params_vec.push(Box::new(name.clone()));
        }

        if let Some(ref settings) = updates.settings {
            let settings_json = serde_json::to_string(settings).map_err(|e| e.to_string())?;
            set_clauses.push("settings_json = ?");
            params_vec.push(Box::new(settings_json));
        }

        params_vec.push(Box::new(id.clone()));

        let sql = format!(
            "UPDATE workspaces SET {} WHERE id = ?",
            set_clauses.join(", ")
        );

        let params_refs: Vec<&dyn rusqlite::ToSql> =
            params_vec.iter().map(|p| p.as_ref()).collect();

        conn.execute(&sql, params_refs.as_slice())
            .map_err(|e| format!("更新 workspace 失败: {}", e))?;

        drop(conn);

        self.get(id)?.ok_or_else(|| "Workspace 不存在".to_string())
    }

    /// 删除 workspace
    pub fn delete(&self, id: &WorkspaceId) -> Result<bool, String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        let affected = conn
            .execute("DELETE FROM workspaces WHERE id = ?", params![id])
            .map_err(|e| format!("删除 workspace 失败: {}", e))?;

        if affected > 0 {
            tracing::info!("[Workspace] 删除: id={}", id);
        }

        Ok(affected > 0)
    }

    /// 设置默认 workspace
    pub fn set_default(&self, id: &WorkspaceId) -> Result<(), String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        // 先清除所有默认标记
        conn.execute("UPDATE workspaces SET is_default = 0", [])
            .map_err(|e| format!("清除默认标记失败: {}", e))?;

        // 设置新的默认
        let affected = conn
            .execute(
                "UPDATE workspaces SET is_default = 1, updated_at = ? WHERE id = ?",
                params![Utc::now().timestamp_millis(), id],
            )
            .map_err(|e| format!("设置默认 workspace 失败: {}", e))?;

        if affected == 0 {
            return Err("Workspace 不存在".to_string());
        }

        tracing::info!("[Workspace] 设置默认: id={}", id);
        Ok(())
    }

    /// 获取默认 workspace
    pub fn get_default(&self) -> Result<Option<Workspace>, String> {
        let conn = self
            .db
            .lock()
            .map_err(|e| format!("数据库锁定失败: {}", e))?;

        let result = conn.query_row(
            "SELECT id, name, workspace_type, root_path, is_default, settings_json, created_at, updated_at
             FROM workspaces WHERE is_default = 1",
            [],
            |row| {
                Ok(Self::row_to_workspace(row)?)
            },
        );

        match result {
            Ok(workspace) => Ok(Some(workspace)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("获取默认 workspace 失败: {}", e)),
        }
    }

    /// 从数据库行解析 Workspace
    fn row_to_workspace(row: &rusqlite::Row) -> Result<Workspace, rusqlite::Error> {
        let id: String = row.get(0)?;
        let name: String = row.get(1)?;
        let workspace_type_str: String = row.get(2)?;
        let root_path_str: String = row.get(3)?;
        let is_default: bool = row.get(4)?;
        let settings_json: String = row.get(5)?;
        let created_at_ms: i64 = row.get(6)?;
        let updated_at_ms: i64 = row.get(7)?;

        let settings: WorkspaceSettings = serde_json::from_str(&settings_json).unwrap_or_default();

        Ok(Workspace {
            id,
            name,
            workspace_type: WorkspaceType::from_str(&workspace_type_str),
            root_path: PathBuf::from(root_path_str),
            is_default,
            created_at: chrono::DateTime::from_timestamp_millis(created_at_ms)
                .unwrap_or_else(Utc::now),
            updated_at: chrono::DateTime::from_timestamp_millis(updated_at_ms)
                .unwrap_or_else(Utc::now),
            settings,
        })
    }
}
