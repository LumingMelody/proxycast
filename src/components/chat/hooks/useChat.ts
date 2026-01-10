/**
 * @file useChat Hook
 * @description 通用对话状态管理 Hook
 * @module components/chat/hooks/useChat
 */

import { useState, useCallback, useRef } from "react";
import { Message, ChatState, ChatActions } from "../types";
import { useStreaming } from "./useStreaming";

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 通用对话状态管理 Hook
 *
 * 提供消息管理、发送、重试、停止等功能
 *
 * @returns 对话状态和操作方法
 */
export function useChat(): ChatState & ChatActions {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAiMessageIdRef = useRef<string | null>(null);

  const { streamChat } = useStreaming();

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isGenerating) return;

      setError(null);

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      // 创建 AI 消息占位
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      currentAiMessageIdRef.current = aiMessage.id;
      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setIsGenerating(true);

      // 创建 AbortController
      abortControllerRef.current = new AbortController();

      const startTime = Date.now();

      try {
        await streamChat(
          [...messages, userMessage],
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessage.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg,
              ),
            );
          },
          abortControllerRef.current.signal,
        );

        // 更新元数据
        const duration = Date.now() - startTime;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? { ...msg, metadata: { ...msg.metadata, duration } }
              : msg,
          ),
        );
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          // 移除空的 AI 消息
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMessage.id));
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
        currentAiMessageIdRef.current = null;
      }
    },
    [messages, isGenerating, streamChat],
  );

  /**
   * 清空消息
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * 重试最后一条消息
   */
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      // 移除最后一条 AI 消息
      setMessages((prev) => {
        const lastAiIndex = [...prev]
          .reverse()
          .findIndex((m: Message) => m.role === "assistant");
        if (lastAiIndex > -1) {
          return prev.slice(0, prev.length - 1 - lastAiIndex);
        }
        return prev;
      });
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    stopGeneration,
  };
}
