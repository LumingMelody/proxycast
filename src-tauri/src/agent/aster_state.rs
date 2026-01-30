//! Aster Agent 状态管理
//!
//! 管理 Aster Agent 实例和相关状态
//! 提供 Tauri 应用与 Aster 框架的桥接
//! 支持从 ProxyCast 凭证池自动选择凭证

use aster::agents::{Agent, SessionConfig};
use aster::model::ModelConfig;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio_util::sync::CancellationToken;

use crate::agent::credential_bridge::{
    create_aster_provider, AsterProviderConfig, CredentialBridge,
};
use crate::database::DbConnection;

/// Provider 配置信息
#[derive(Debug, Clone)]
pub struct ProviderConfig {
    /// Provider 名称 (openai, anthropic, google, ollama 等)
    pub provider_name: String,
    /// 模型名称
    pub model_name: String,
    /// API Key (可选，某些 provider 从环境变量读取)
    pub api_key: Option<String>,
    /// Base URL (可选，用于自定义端点)
    pub base_url: Option<String>,
    /// 凭证 UUID（来自凭证池，用于记录使用和健康状态）
    pub credential_uuid: Option<String>,
}

/// Aster Agent 全局状态
///
/// 在 Tauri 应用中作为 managed state 使用
pub struct AsterAgentState {
    /// Aster Agent 实例
    agent: Arc<RwLock<Option<Agent>>>,
    /// 当前活跃的取消令牌（用于中止正在进行的对话）
    cancel_tokens: Arc<RwLock<std::collections::HashMap<String, CancellationToken>>>,
    /// 当前 Provider 配置
    current_provider_config: Arc<RwLock<Option<ProviderConfig>>>,
    /// 凭证桥接器
    credential_bridge: CredentialBridge,
}

impl Default for AsterAgentState {
    fn default() -> Self {
        Self::new()
    }
}

impl AsterAgentState {
    /// 创建新的 Aster Agent 状态
    pub fn new() -> Self {
        Self {
            agent: Arc::new(RwLock::new(None)),
            cancel_tokens: Arc::new(RwLock::new(std::collections::HashMap::new())),
            current_provider_config: Arc::new(RwLock::new(None)),
            credential_bridge: CredentialBridge::new(),
        }
    }

    /// 初始化 Agent
    ///
    /// 如果 Agent 尚未初始化，则创建新的 Agent 实例
    pub async fn init_agent(&self) -> Result<(), String> {
        let mut agent_guard = self.agent.write().await;
        if agent_guard.is_none() {
            let agent = Agent::new();
            *agent_guard = Some(agent);
            tracing::info!("Aster Agent initialized");
        }
        Ok(())
    }

    /// 配置 Provider
    ///
    /// 根据配置创建并设置 Provider
    pub async fn configure_provider(
        &self,
        config: ProviderConfig,
        session_id: &str,
    ) -> Result<(), String> {
        // 确保 Agent 已初始化
        self.init_agent().await?;

        // 设置环境变量（Aster 的 provider 从环境变量读取配置）
        self.set_provider_env_vars(&config);

        // 创建 ModelConfig
        let model_config = ModelConfig::new(&config.model_name)
            .map_err(|e| format!("创建 ModelConfig 失败: {}", e))?;

        // 创建 Provider
        let provider = aster::providers::create(&config.provider_name, model_config)
            .await
            .map_err(|e| format!("创建 Provider 失败: {}", e))?;

        // 更新 Agent 的 Provider
        let agent_guard = self.agent.read().await;
        if let Some(agent) = agent_guard.as_ref() {
            agent
                .update_provider(provider, session_id)
                .await
                .map_err(|e| format!("更新 Provider 失败: {}", e))?;
        }

        // 保存当前配置
        let mut config_guard = self.current_provider_config.write().await;
        *config_guard = Some(config.clone());

        tracing::info!(
            "[AsterAgent] Provider 配置成功: {} / {}",
            config.provider_name,
            config.model_name
        );

        Ok(())
    }

    /// 从凭证池配置 Provider
    ///
    /// 自动从 ProxyCast 凭证池选择可用凭证并配置 Aster Provider
    ///
    /// # 参数
    /// - `db`: 数据库连接
    /// - `provider_type`: Provider 类型 (openai, anthropic, kiro 等)
    /// - `model`: 模型名称
    /// - `session_id`: 会话 ID
    pub async fn configure_provider_from_pool(
        &self,
        db: &DbConnection,
        provider_type: &str,
        model: &str,
        session_id: &str,
    ) -> Result<AsterProviderConfig, String> {
        // 确保 Agent 已初始化
        self.init_agent().await?;

        // 从凭证池选择凭证并获取配置
        let aster_config = self
            .credential_bridge
            .select_and_configure(db, provider_type, model)
            .await
            .map_err(|e| format!("从凭证池选择凭证失败: {}", e))?;

        // 创建 Provider
        let provider = create_aster_provider(&aster_config)
            .await
            .map_err(|e| format!("创建 Provider 失败: {}", e))?;

        // 更新 Agent 的 Provider
        let agent_guard = self.agent.read().await;
        if let Some(agent) = agent_guard.as_ref() {
            agent
                .update_provider(provider, session_id)
                .await
                .map_err(|e| format!("更新 Provider 失败: {}", e))?;
        }

        // 保存当前配置
        let config = ProviderConfig {
            provider_name: aster_config.provider_name.clone(),
            model_name: aster_config.model_name.clone(),
            api_key: aster_config.api_key.clone(),
            base_url: aster_config.base_url.clone(),
            credential_uuid: Some(aster_config.credential_uuid.clone()),
        };
        let mut config_guard = self.current_provider_config.write().await;
        *config_guard = Some(config);

        // 记录凭证使用
        if let Err(e) = self
            .credential_bridge
            .record_usage(db, &aster_config.credential_uuid)
        {
            tracing::warn!("[AsterAgent] 记录凭证使用失败: {}", e);
        }

        tracing::info!(
            "[AsterAgent] 从凭证池配置 Provider 成功: {} / {} (凭证: {})",
            aster_config.provider_name,
            aster_config.model_name,
            aster_config.credential_uuid
        );

        Ok(aster_config)
    }

    /// 标记当前凭证为健康
    pub fn mark_current_healthy(&self, db: &DbConnection, model: Option<&str>) {
        if let Ok(config_guard) = self.current_provider_config.try_read() {
            if let Some(config) = config_guard.as_ref() {
                if let Some(uuid) = &config.credential_uuid {
                    if let Err(e) = self.credential_bridge.mark_healthy(db, uuid, model) {
                        tracing::warn!("[AsterAgent] 标记凭证健康失败: {}", e);
                    }
                }
            }
        }
    }

    /// 标记当前凭证为不健康
    pub fn mark_current_unhealthy(&self, db: &DbConnection, error: Option<&str>) {
        if let Ok(config_guard) = self.current_provider_config.try_read() {
            if let Some(config) = config_guard.as_ref() {
                if let Some(uuid) = &config.credential_uuid {
                    if let Err(e) = self.credential_bridge.mark_unhealthy(db, uuid, error) {
                        tracing::warn!("[AsterAgent] 标记凭证不健康失败: {}", e);
                    }
                }
            }
        }
    }

    /// 设置 Provider 相关的环境变量
    fn set_provider_env_vars(&self, config: &ProviderConfig) {
        // 根据 provider 类型设置对应的环境变量
        let env_key = match config.provider_name.as_str() {
            "openai" => "OPENAI_API_KEY",
            "anthropic" => "ANTHROPIC_API_KEY",
            "google" => "GOOGLE_API_KEY",
            "deepseek" | "custom_deepseek" => "DEEPSEEK_API_KEY",
            "groq" => "GROQ_API_KEY",
            "mistral" => "MISTRAL_API_KEY",
            "openrouter" => "OPENROUTER_API_KEY",
            "ollama" => return, // Ollama 不需要 API Key
            _ => {
                // 通用 OpenAI 兼容格式
                if let Some(api_key) = &config.api_key {
                    std::env::set_var("OPENAI_API_KEY", api_key);
                }
                if let Some(base_url) = &config.base_url {
                    std::env::set_var("OPENAI_BASE_URL", base_url);
                }
                return;
            }
        };

        if let Some(api_key) = &config.api_key {
            std::env::set_var(env_key, api_key);
        }

        if let Some(base_url) = &config.base_url {
            let base_url_key = format!(
                "{}_BASE_URL",
                config.provider_name.to_uppercase().replace("_", "")
            );
            std::env::set_var(base_url_key, base_url);
        }
    }

    /// 获取当前 Provider 配置
    pub async fn get_provider_config(&self) -> Option<ProviderConfig> {
        self.current_provider_config.read().await.clone()
    }

    /// 检查 Provider 是否已配置
    pub async fn is_provider_configured(&self) -> bool {
        self.current_provider_config.read().await.is_some()
    }

    /// 获取 Agent 的只读引用并执行同步操作
    pub async fn with_agent<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&Agent) -> R,
    {
        let guard = self.agent.read().await;
        match guard.as_ref() {
            Some(agent) => Ok(f(agent)),
            None => Err("Agent not initialized".to_string()),
        }
    }

    /// 获取 Agent 的可变引用并执行同步操作
    pub async fn with_agent_mut<F, R>(&self, f: F) -> Result<R, String>
    where
        F: FnOnce(&mut Agent) -> R,
    {
        let mut guard = self.agent.write().await;
        match guard.as_mut() {
            Some(agent) => Ok(f(agent)),
            None => Err("Agent not initialized".to_string()),
        }
    }

    /// 获取 Agent 的 Arc 引用
    ///
    /// 用于需要长期持有 Agent 引用的场景
    pub fn get_agent_arc(&self) -> Arc<RwLock<Option<Agent>>> {
        self.agent.clone()
    }

    /// 创建新的取消令牌
    pub async fn create_cancel_token(&self, session_id: &str) -> CancellationToken {
        let token = CancellationToken::new();
        let mut tokens = self.cancel_tokens.write().await;
        tokens.insert(session_id.to_string(), token.clone());
        token
    }

    /// 取消指定会话的操作
    pub async fn cancel_session(&self, session_id: &str) -> bool {
        let tokens = self.cancel_tokens.read().await;
        if let Some(token) = tokens.get(session_id) {
            token.cancel();
            true
        } else {
            false
        }
    }

    /// 移除取消令牌
    pub async fn remove_cancel_token(&self, session_id: &str) {
        let mut tokens = self.cancel_tokens.write().await;
        tokens.remove(session_id);
    }

    /// 检查 Agent 是否已初始化
    pub async fn is_initialized(&self) -> bool {
        self.agent.read().await.is_some()
    }
}

/// 会话配置构建器
///
/// 用于构建 Aster SessionConfig
pub struct SessionConfigBuilder {
    id: String,
    max_turns: Option<u32>,
}

impl SessionConfigBuilder {
    pub fn new(id: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            max_turns: None,
        }
    }

    pub fn max_turns(mut self, turns: u32) -> Self {
        self.max_turns = Some(turns);
        self
    }

    pub fn build(self) -> SessionConfig {
        SessionConfig {
            id: self.id,
            schedule_id: None,
            max_turns: self.max_turns,
            retry_config: None,
        }
    }
}

/// 消息构建辅助函数
pub mod message_helpers {
    use aster::conversation::message::Message;

    /// 创建用户文本消息
    pub fn user_text(text: impl Into<String>) -> Message {
        Message::user().with_text(text)
    }

    /// 创建助手文本消息
    pub fn assistant_text(text: impl Into<String>) -> Message {
        Message::assistant().with_text(text)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_aster_state_init() {
        let state = AsterAgentState::new();
        assert!(!state.is_initialized().await);

        state.init_agent().await.unwrap();
        assert!(state.is_initialized().await);
    }

    #[tokio::test]
    async fn test_cancel_token() {
        let state = AsterAgentState::new();
        let session_id = "test-session";

        let token = state.create_cancel_token(session_id).await;
        assert!(!token.is_cancelled());

        assert!(state.cancel_session(session_id).await);
        assert!(token.is_cancelled());

        state.remove_cancel_token(session_id).await;
        assert!(!state.cancel_session(session_id).await);
    }
}
