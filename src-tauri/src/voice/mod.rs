//! 语音输入模块
//!
//! 提供系统级语音输入功能，包括：
//! - 全局快捷键触发
//! - 悬浮窗口管理
//! - 语音识别处理
//! - 文本输出

pub mod asr_service;
pub mod commands;
pub mod config;
pub mod output_service;
pub mod processor;
pub mod recording_service;
pub mod shortcut;
pub mod window;

use tauri::AppHandle;

/// 初始化语音输入模块
pub fn init(app: &AppHandle) -> Result<(), String> {
    // 加载配置
    let config = config::load_voice_config()?;

    // 如果功能未启用，直接返回
    if !config.enabled {
        tracing::info!("[语音输入] 功能未启用");
        return Ok(());
    }

    // 注册全局快捷键
    shortcut::register(app, &config.shortcut)?;

    tracing::info!("[语音输入] 模块初始化完成");
    Ok(())
}

/// 清理语音输入模块
pub fn cleanup(app: &AppHandle) -> Result<(), String> {
    // 注销快捷键
    shortcut::unregister(app)?;

    // 关闭悬浮窗口
    window::close_voice_window(app)?;

    tracing::info!("[语音输入] 模块已清理");
    Ok(())
}
