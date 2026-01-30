/**
 * ASR Provider 类型定义
 *
 * 定义语音识别服务相关的类型，与 Rust 后端保持一致。
 */

import { invoke } from "@tauri-apps/api/core";

// ============ ASR Provider 类型 ============

/** ASR Provider 类型 */
export type AsrProviderType = "whisper_local" | "xunfei" | "baidu" | "openai";

/** Whisper 模型大小 */
export type WhisperModelSize = "tiny" | "base" | "small" | "medium";

/** Whisper 本地配置 */
export interface WhisperLocalConfig {
  model: WhisperModelSize;
  model_path?: string;
}

/** 讯飞配置 */
export interface XunfeiConfig {
  app_id: string;
  api_key: string;
  api_secret: string;
}

/** 百度配置 */
export interface BaiduConfig {
  api_key: string;
  secret_key: string;
}

/** OpenAI ASR 配置 */
export interface OpenAIAsrConfig {
  api_key: string;
  base_url?: string;
  proxy_url?: string;
}

/** ASR 凭证条目 */
export interface AsrCredentialEntry {
  id: string;
  provider: AsrProviderType;
  name?: string;
  is_default: boolean;
  disabled: boolean;
  language: string;
  whisper_config?: WhisperLocalConfig;
  xunfei_config?: XunfeiConfig;
  baidu_config?: BaiduConfig;
  openai_config?: OpenAIAsrConfig;
}

// ============ 语音输入配置类型 ============

/** 语音输出模式 */
export type VoiceOutputMode = "type" | "clipboard" | "both";

/** 语音处理配置 */
export interface VoiceProcessorConfig {
  polish_enabled: boolean;
  polish_provider?: string;
  polish_model?: string;
  default_instruction_id: string;
}

/** 语音输出配置 */
export interface VoiceOutputConfig {
  mode: VoiceOutputMode;
  type_delay_ms: number;
}

/** 语音处理指令 */
export interface VoiceInstruction {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  shortcut?: string;
  is_preset: boolean;
  icon?: string;
}

/** 语音输入功能配置 */
export interface VoiceInputConfig {
  enabled: boolean;
  shortcut: string;
  processor: VoiceProcessorConfig;
  output: VoiceOutputConfig;
  instructions: VoiceInstruction[];
}

// ============ Tauri 命令封装 ============

/** 获取 ASR 凭证列表 */
export async function getAsrCredentials(): Promise<AsrCredentialEntry[]> {
  return invoke<AsrCredentialEntry[]>("get_asr_credentials");
}

/** 添加 ASR 凭证 */
export async function addAsrCredential(
  entry: Omit<AsrCredentialEntry, "id">,
): Promise<AsrCredentialEntry> {
  return invoke<AsrCredentialEntry>("add_asr_credential", { entry });
}

/** 更新 ASR 凭证 */
export async function updateAsrCredential(
  entry: AsrCredentialEntry,
): Promise<void> {
  return invoke("update_asr_credential", { entry });
}

/** 删除 ASR 凭证 */
export async function deleteAsrCredential(id: string): Promise<void> {
  return invoke("delete_asr_credential", { id });
}

/** 设置默认 ASR 凭证 */
export async function setDefaultAsrCredential(id: string): Promise<void> {
  return invoke("set_default_asr_credential", { id });
}

/** 测试 ASR 凭证连通性 */
export async function testAsrCredential(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return invoke("test_asr_credential", { id });
}

// ============ 语音输入配置命令 ============

/** 获取语音输入配置 */
export async function getVoiceInputConfig(): Promise<VoiceInputConfig> {
  return invoke<VoiceInputConfig>("get_voice_input_config");
}

/** 保存语音输入配置 */
export async function saveVoiceInputConfig(
  config: VoiceInputConfig,
): Promise<void> {
  return invoke("save_voice_input_config", { voiceConfig: config });
}

/** 获取指令列表 */
export async function getVoiceInstructions(): Promise<VoiceInstruction[]> {
  return invoke<VoiceInstruction[]>("get_voice_instructions");
}

/** 保存指令 */
export async function saveVoiceInstruction(
  instruction: VoiceInstruction,
): Promise<void> {
  return invoke("save_voice_instruction", { instruction });
}

/** 删除指令 */
export async function deleteVoiceInstruction(id: string): Promise<void> {
  return invoke("delete_voice_instruction", { id });
}

// ============ 语音识别和润色命令 ============

/** 语音识别结果 */
export interface TranscribeResult {
  text: string;
  provider: string;
}

/** 润色结果 */
export interface PolishResult {
  text: string;
  instruction_name: string;
}

/** 执行语音识别 */
export async function transcribeAudio(
  audioData: Uint8Array,
  sampleRate: number,
  credentialId?: string,
): Promise<TranscribeResult> {
  return invoke<TranscribeResult>("transcribe_audio", {
    audioData: Array.from(audioData),
    sampleRate,
    credentialId,
  });
}

/** 润色文本 */
export async function polishVoiceText(
  text: string,
  instructionId?: string,
): Promise<PolishResult> {
  return invoke<PolishResult>("polish_voice_text", {
    text,
    instructionId,
  });
}

/** 打开语音输入窗口 */
export async function openVoiceWindow(): Promise<void> {
  return invoke("open_voice_window");
}

/** 关闭语音输入窗口 */
export async function closeVoiceWindow(): Promise<void> {
  return invoke("close_voice_window");
}

/** 输出文本到系统 */
export async function outputVoiceText(
  text: string,
  mode?: "type" | "clipboard" | "both",
): Promise<void> {
  return invoke("output_voice_text", { text, mode });
}

// ============ 录音控制命令 ============

/** 录音状态 */
export interface RecordingStatus {
  /** 是否正在录音 */
  is_recording: boolean;
  /** 当前音量级别（0-100） */
  volume: number;
  /** 录音时长（秒） */
  duration: number;
}

/** 停止录音结果 */
export interface StopRecordingResult {
  /** 音频数据（i16 样本的字节数组，小端序） */
  audio_data: number[];
  /** 采样率 */
  sample_rate: number;
  /** 录音时长（秒） */
  duration: number;
}

/** 开始录音 */
export async function startRecording(): Promise<void> {
  return invoke("start_recording");
}

/** 停止录音并返回音频数据 */
export async function stopRecording(): Promise<StopRecordingResult> {
  return invoke<StopRecordingResult>("stop_recording");
}

/** 取消录音 */
export async function cancelRecording(): Promise<void> {
  return invoke("cancel_recording");
}

/** 获取录音状态 */
export async function getRecordingStatus(): Promise<RecordingStatus> {
  return invoke<RecordingStatus>("get_recording_status");
}

/** 打开带预填文本的输入框 */
export async function openInputWithText(text: string): Promise<void> {
  return invoke("open_input_with_text", { text });
}
