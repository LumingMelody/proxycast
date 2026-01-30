/**
 * @file screenshot-chat.tsx
 * @description 截图对话悬浮窗口 - 参考 Google Gemini 浮动栏设计
 *              半透明药丸形状，简洁的输入界面
 *              支持语音输入模式
 * @module pages/screenshot-chat
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Image as ImageIcon,
  ArrowUp,
  X,
  GripVertical,
  Mic,
  Loader2,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./screenshot-chat.css";

// ProxyCast Logo组件
function Logo() {
  return (
    <svg
      viewBox="0 0 128 128"
      width="20"
      height="20"
      className="screenshot-logo"
    >
      <defs>
        <linearGradient id="leftP" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#4fc3f7" }} />
          <stop offset="100%" style={{ stopColor: "#1a237e" }} />
        </linearGradient>
        <linearGradient id="rightP" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#7c4dff" }} />
          <stop offset="100%" style={{ stopColor: "#e91e63" }} />
        </linearGradient>
      </defs>
      <g>
        <rect x="36" y="32" width="10" height="64" rx="3" fill="url(#leftP)" />
        <rect x="46" y="32" width="28" height="9" rx="3" fill="url(#rightP)" />
        <rect x="46" y="60" width="24" height="8" rx="2" fill="url(#rightP)" />
        <rect x="70" y="41" width="8" height="27" rx="3" fill="url(#rightP)" />
      </g>
    </svg>
  );
}

function getImagePathFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const imagePath = params.get("image");
  return imagePath ? decodeURIComponent(imagePath) : null;
}

function getPrefilledTextFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const text = params.get("text");
  return text ? decodeURIComponent(text) : "";
}

function getVoiceModeFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("voice") === "true";
}

/** 语音状态 */
type VoiceState = "idle" | "recording" | "transcribing" | "polishing";

export function ScreenshotChatPage() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceMode, setVoiceMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 开始语音模式
  const startVoiceMode = useCallback(async () => {
    if (voiceState !== "idle") {
      console.log("[语音输入] 已在录音状态，跳过");
      return;
    }
    setVoiceMode(true);
    setVoiceState("recording");
    setInputValue(""); // 清空之前的输入
    try {
      const { startRecording } = await import("@/lib/api/asrProvider");
      await startRecording();
      console.log("[语音输入] 开始录音成功");
    } catch (err) {
      console.error("[语音输入] 开始录音失败:", err);
      setVoiceState("idle");
      setVoiceMode(false);
    }
  }, [voiceState]);

  // 从 URL 获取图片路径、预填文本和语音模式
  useEffect(() => {
    const path = getImagePathFromUrl();
    if (path) {
      setImagePath(path);
    }
    const prefilledText = getPrefilledTextFromUrl();
    if (prefilledText) {
      setInputValue(prefilledText);
    }
    const isVoiceMode = getVoiceModeFromUrl();
    console.log("[语音输入] URL 参数 voice=", isVoiceMode);
    if (isVoiceMode) {
      startVoiceMode();
    }
  }, [startVoiceMode]);

  // 监听后端发送的开始录音事件（窗口已存在时使用）
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen("voice-start-recording", () => {
          console.log("[语音输入] 收到开始录音事件");
          startVoiceMode();
        });
      } catch (err) {
        console.error("[语音输入] 监听开始录音事件失败:", err);
      }
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [startVoiceMode]);

  // 自动聚焦（非语音模式时）
  useEffect(() => {
    if (!voiceMode) {
      inputRef.current?.focus();
    }
  }, [voiceMode]);

  // 手动停止语音录音（点击按钮）
  const stopVoiceRecording = async () => {
    if (voiceState !== "recording") return;

    setVoiceState("transcribing");
    try {
      const {
        stopRecording,
        transcribeAudio,
        polishVoiceText,
        getVoiceInputConfig,
      } = await import("@/lib/api/asrProvider");

      const result = await stopRecording();
      console.log(
        "[语音输入] 录音完成，时长:",
        result.duration.toFixed(2),
        "秒",
      );

      if (result.duration < 0.5) {
        console.log("[语音输入] 录音时间过短");
        setVoiceState("idle");
        setVoiceMode(false);
        return;
      }

      const audioData = new Uint8Array(result.audio_data);
      const transcribeResult = await transcribeAudio(
        audioData,
        result.sample_rate,
      );
      console.log("[语音识别] 结果:", transcribeResult.text);

      if (!transcribeResult.text.trim()) {
        setVoiceState("idle");
        setVoiceMode(false);
        return;
      }

      // 检查是否启用润色
      let finalText = transcribeResult.text;
      try {
        const config = await getVoiceInputConfig();
        if (config.processor.polish_enabled) {
          setVoiceState("polishing");
          const polished = await polishVoiceText(transcribeResult.text);
          finalText = polished.text;
        }
      } catch (e) {
        console.error("[语音润色] 失败:", e);
      }

      setInputValue(finalText);
      setVoiceState("idle");
      setVoiceMode(false);
      inputRef.current?.focus();
    } catch (err) {
      console.error("[语音识别] 失败:", err);
      setVoiceState("idle");
      setVoiceMode(false);
    }
  };

  // 监听快捷键释放事件
  useEffect(() => {
    if (!voiceMode) return;

    const setupStopListener = async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        const unlisten = await listen("voice-stop-recording", async () => {
          console.log("[语音输入] 收到停止录音事件");
          // 直接在这里执行停止录音逻辑，避免闭包问题
          setVoiceState("transcribing");
          try {
            const {
              stopRecording,
              transcribeAudio,
              polishVoiceText,
              getVoiceInputConfig,
            } = await import("@/lib/api/asrProvider");

            const result = await stopRecording();
            console.log(
              "[语音输入] 录音完成，时长:",
              result.duration.toFixed(2),
              "秒",
            );

            if (result.duration < 0.5) {
              console.log("[语音输入] 录音时间过短");
              setVoiceState("idle");
              setVoiceMode(false);
              return;
            }

            const audioData = new Uint8Array(result.audio_data);
            const transcribeResult = await transcribeAudio(
              audioData,
              result.sample_rate,
            );
            console.log("[语音识别] 结果:", transcribeResult.text);

            if (!transcribeResult.text.trim()) {
              setVoiceState("idle");
              setVoiceMode(false);
              return;
            }

            // 检查是否启用润色
            let finalText = transcribeResult.text;
            try {
              const config = await getVoiceInputConfig();
              if (config.processor.polish_enabled) {
                setVoiceState("polishing");
                const polished = await polishVoiceText(transcribeResult.text);
                finalText = polished.text;
              }
            } catch (e) {
              console.error("[语音润色] 失败:", e);
            }

            setInputValue(finalText);
            setVoiceState("idle");
            setVoiceMode(false);
            inputRef.current?.focus();
          } catch (err) {
            console.error("[语音识别] 失败:", err);
            setVoiceState("idle");
            setVoiceMode(false);
          }
        });
        return unlisten;
      } catch (err) {
        console.error("[语音输入] 监听停止录音事件失败:", err);
        return () => {};
      }
    };

    const unlistenPromise = setupStopListener();
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [voiceMode]);

  // 关闭窗口
  const handleClose = useCallback(async () => {
    // 如果正在录音，先取消
    if (voiceState === "recording") {
      try {
        const { cancelRecording } = await import("@/lib/api/asrProvider");
        await cancelRecording();
      } catch (err) {
        console.error("[语音输入] 取消录音失败:", err);
      }
    }
    try {
      await getCurrentWindow().close();
    } catch (err) {
      console.error("关闭窗口失败:", err);
    }
  }, [voiceState]);

  // ESC 关闭窗口
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        await handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // 开始拖动窗口
  const handleStartDrag = useCallback(async (e: React.MouseEvent) => {
    // 只响应左键
    if (e.button !== 0) return;
    try {
      await getCurrentWindow().startDragging();
    } catch (err) {
      console.error("拖动窗口失败:", err);
    }
  }, []);

  // 移除图片附件
  const handleRemoveImage = () => {
    setImagePath(null);
  };

  // 发送到主应用
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const { safeInvoke } = await import("@/lib/dev-bridge");
      await safeInvoke("send_screenshot_chat", {
        message: inputValue,
        imagePath: imagePath,
      });

      await getCurrentWindow().close();
    } catch (err) {
      console.error("发送失败:", err);
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="screenshot-container">
      <div className="screenshot-input-bar">
        {/* 拖动手柄 */}
        <div
          className="screenshot-drag-handle"
          onMouseDown={handleStartDrag}
          title="拖动移动窗口"
        >
          <GripVertical size={14} />
        </div>

        {/* Logo */}
        <Logo />

        {/* 语音录音状态标签 */}
        {voiceState === "recording" && (
          <div className="screenshot-attachment recording">
            <Mic size={12} />
            <span>录音中...</span>
            <button
              className="screenshot-attachment-remove"
              onClick={stopVoiceRecording}
              title="停止录音"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* 语音识别/润色状态 */}
        {(voiceState === "transcribing" || voiceState === "polishing") && (
          <div className="screenshot-attachment processing">
            <Loader2 size={12} className="animate-spin" />
            <span>
              {voiceState === "transcribing" ? "识别中..." : "润色中..."}
            </span>
          </div>
        )}

        {/* 图片附件标签 */}
        {imagePath && (
          <div className="screenshot-attachment">
            <ImageIcon size={12} />
            <span>Image</span>
            <button
              className="screenshot-attachment-remove"
              onClick={handleRemoveImage}
              title="移除图片"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          className="screenshot-input"
          placeholder={
            voiceState === "recording"
              ? "点击 × 或松开快捷键停止录音"
              : "Ask anything..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isLoading || voiceState !== "idle"}
        />

        {/* 右侧按钮组 */}
        <div className="screenshot-actions">
          {/* 麦克风按钮 - 点击开始录音 */}
          {voiceState === "idle" && (
            <button
              className="screenshot-mic-btn"
              onClick={startVoiceMode}
              title="语音输入"
            >
              <Mic size={18} />
            </button>
          )}

          {/* 关闭按钮 */}
          <button
            className="screenshot-close-btn"
            onClick={handleClose}
            title="关闭 (ESC)"
          >
            <X size={14} />
          </button>

          {/* 发送按钮 */}
          <button
            className={`screenshot-send-btn ${inputValue.trim() ? "active" : ""}`}
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            title="发送 (Enter)"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenshotChatPage;
