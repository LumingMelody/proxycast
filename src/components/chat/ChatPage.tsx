/**
 * @file 通用对话页面
 * @description ProxyCast 核心功能 - 通用对话页面
 * @module components/chat/ChatPage
 */

import React, { useState, useCallback, memo } from "react";
import styled from "styled-components";
import { MessageList, InputBar, ThemeSelector, EmptyState } from "./components";
import { useChat } from "./hooks";
import { ThemeType } from "./types";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: hsl(var(--background));
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ErrorBanner = styled.div`
  padding: 12px 16px;
  margin: 0 16px;
  border-radius: 8px;
  background: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
  font-size: 14px;
  text-align: center;
`;

/**
 * 通用对话页面
 *
 * ProxyCast 的核心功能，提供：
 * - 即时对话，打开即用
 * - Markdown 渲染和代码高亮
 * - 流式响应
 * - 主题选择入口
 */
export const ChatPage: React.FC = memo(() => {
  const {
    messages,
    isGenerating,
    error,
    sendMessage,
    clearMessages: _clearMessages,
    retryLastMessage,
    stopGeneration,
  } = useChat();

  const [currentTheme, setCurrentTheme] = useState<ThemeType>("general");

  const hasMessages = messages.length > 0;

  // 处理建议点击
  const handleSuggestionClick = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  // 处理删除消息
  const handleDeleteMessage = useCallback((id: string) => {
    // TODO: 实现单条消息删除
    console.log("删除消息:", id);
  }, []);

  // 处理重试消息
  const handleRetryMessage = useCallback(
    (_id: string) => {
      retryLastMessage();
    },
    [retryLastMessage],
  );

  // 处理主题变更
  const handleThemeChange = useCallback((theme: ThemeType) => {
    setCurrentTheme(theme);
    // TODO: 切换到创作模式
    console.log("切换主题:", theme);
  }, []);

  return (
    <PageContainer>
      <ChatArea>
        {error && <ErrorBanner>⚠️ {error}</ErrorBanner>}

        {hasMessages ? (
          <MessageList
            messages={messages}
            isGenerating={isGenerating}
            onDeleteMessage={handleDeleteMessage}
            onRetryMessage={handleRetryMessage}
          />
        ) : (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        )}
      </ChatArea>

      <InputBar
        onSend={sendMessage}
        isGenerating={isGenerating}
        onStop={stopGeneration}
        placeholder={
          currentTheme === "general"
            ? "输入消息，按 Enter 发送..."
            : `开始${currentTheme}创作...`
        }
      />

      {!hasMessages && (
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
    </PageContainer>
  );
});

ChatPage.displayName = "ChatPage";
