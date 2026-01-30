//! 语音输入悬浮窗口管理
//!
//! 创建和管理语音输入的悬浮窗口

use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

const VOICE_WINDOW_LABEL: &str = "voice-input";
const VOICE_WINDOW_WIDTH: f64 = 400.0;
const VOICE_WINDOW_HEIGHT: f64 = 80.0;

/// 打开语音输入窗口
pub fn open_voice_window(app: &AppHandle) -> Result<(), String> {
    // 检查窗口是否已存在
    if let Some(window) = app.get_webview_window(VOICE_WINDOW_LABEL) {
        // 发送重置事件，让前端重新开始录音
        window
            .emit("voice-reset", ())
            .map_err(|e| format!("发送重置事件失败: {}", e))?;
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        tracing::info!("[语音输入] 窗口已存在，发送重置事件");
        return Ok(());
    }

    // 创建新窗口
    let window = WebviewWindowBuilder::new(
        app,
        VOICE_WINDOW_LABEL,
        WebviewUrl::App("/voice-input".into()),
    )
    .title("语音输入")
    .inner_size(VOICE_WINDOW_WIDTH, VOICE_WINDOW_HEIGHT)
    .resizable(false)
    .decorations(false)
    .always_on_top(true)
    .transparent(false) // 关闭透明，避免 macOS 上的渲染问题
    .skip_taskbar(true)
    .center()
    .build()
    .map_err(|e| format!("创建窗口失败: {}", e))?;

    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    tracing::info!("[语音输入] 窗口已打开");
    Ok(())
}

/// 关闭语音输入窗口
pub fn close_voice_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(VOICE_WINDOW_LABEL) {
        window.close().map_err(|e| e.to_string())?;
        tracing::info!("[语音输入] 窗口已关闭");
    }
    Ok(())
}

/// 更新窗口状态（发送事件到前端）
pub fn update_window_state(app: &AppHandle, state: &str) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(VOICE_WINDOW_LABEL) {
        window
            .emit("voice-state-change", state)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// 发送停止录音事件到前端
pub fn send_stop_recording_event(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(VOICE_WINDOW_LABEL) {
        window
            .emit("voice-stop-recording", ())
            .map_err(|e| format!("发送停止录音事件失败: {}", e))?;
        tracing::info!("[语音输入] 已发送停止录音事件");
    }
    Ok(())
}
