//! voice-core - 语音输入核心库
//!
//! 提供音频录制、语音识别、文字输出等功能。
//! 不依赖 Tauri，可被任何 Rust 项目使用。

pub mod asr_client;
pub mod error;
pub mod output;
pub mod recorder;
pub mod transcriber;
pub mod types;

pub use error::{Result, VoiceError};
pub use output::OutputHandler;
pub use recorder::AudioRecorder;
pub use transcriber::WhisperTranscriber;
pub use types::*;
