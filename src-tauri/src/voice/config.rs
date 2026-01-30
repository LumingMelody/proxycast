//! 语音输入配置管理
//!
//! 加载和保存语音输入相关配置

use crate::config::{
    load_config, save_config, AsrCredentialEntry, VoiceInputConfig, VoiceInstruction,
};

/// 加载语音输入配置
pub fn load_voice_config() -> Result<VoiceInputConfig, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    Ok(config.experimental.voice_input)
}

/// 保存语音输入配置
pub fn save_voice_config(voice_config: VoiceInputConfig) -> Result<(), String> {
    let mut config = load_config().map_err(|e| e.to_string())?;
    config.experimental.voice_input = voice_config;
    save_config(&config).map_err(|e| e.to_string())?;
    Ok(())
}

/// 获取默认 ASR 凭证
pub fn get_default_asr_credential() -> Result<Option<AsrCredentialEntry>, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    Ok(config
        .credential_pool
        .asr
        .into_iter()
        .find(|c| c.is_default && !c.disabled))
}

/// 获取指令列表
pub fn get_instructions() -> Result<Vec<VoiceInstruction>, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    Ok(config.experimental.voice_input.instructions)
}

/// 获取指定 ID 的指令
pub fn get_instruction(id: &str) -> Result<Option<VoiceInstruction>, String> {
    let instructions = get_instructions()?;
    Ok(instructions.into_iter().find(|i| i.id == id))
}
