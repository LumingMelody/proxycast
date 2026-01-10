/**
 * @file 消息项组件
 * @description 单条消息的渲染，支持 Markdown 和代码高亮
 * @module components/chat/components/MessageItem
 */

import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";
import { User, Bot, Copy, Check, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/agent/chat/components/MarkdownRenderer";
import { Message } from "../types";

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid hsl(var(--border) / 0.5);

  &:last-child {
    border-bottom: none;
  }

  &:hover .message-actions {
    opacity: 1;
  }
`;

const AvatarCircle = styled.div<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isUser }) =>
    $isUser ? "hsl(var(--primary))" : "hsl(var(--muted))"};
  color: ${({ $isUser }) =>
    $isUser
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--muted-foreground))"};
`;

const ContentColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SenderName = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: hsl(var(--foreground));
`;

const TimeStamp = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const MessageContent = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: hsl(var(--foreground));

  /* 用户消息样式 */
  &.user-message {
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const MessageActions = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
`;

const ActionButton = styled(Button)`
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
`;

interface MessageItemProps {
  /** 消息数据 */
  message: Message;
  /** 是否正在生成（用于显示光标） */
  isGenerating?: boolean;
  /** 删除消息回调 */
  onDelete?: (id: string) => void;
  /** 重试消息回调 */
  onRetry?: (id: string) => void;
}

/**
 * 消息项组件
 *
 * 渲染单条消息，支持：
 * - Markdown 渲染
 * - 代码高亮
 * - 复制、删除、重试操作
 */
export const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message, isGenerating, onDelete, onRetry }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";

    const formatTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("复制失败:", err);
      }
    }, [message.content]);

    const handleDelete = useCallback(() => {
      onDelete?.(message.id);
    }, [message.id, onDelete]);

    const handleRetry = useCallback(() => {
      onRetry?.(message.id);
    }, [message.id, onRetry]);

    return (
      <MessageWrapper $isUser={isUser}>
        <AvatarCircle $isUser={isUser}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </AvatarCircle>

        <ContentColumn>
          <MessageHeader>
            <SenderName>{isUser ? "你" : "AI 助手"}</SenderName>
            <TimeStamp>{formatTime(message.timestamp)}</TimeStamp>
          </MessageHeader>

          <MessageContent className={isUser ? "user-message" : ""}>
            {isUser ? (
              message.content
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {isGenerating && !message.content && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
                )}
              </>
            )}
          </MessageContent>

          {message.content && (
            <MessageActions className="message-actions">
              <ActionButton variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="ml-1">{copied ? "已复制" : "复制"}</span>
              </ActionButton>

              {!isUser && onRetry && (
                <ActionButton variant="ghost" size="sm" onClick={handleRetry}>
                  <RotateCcw size={14} />
                  <span className="ml-1">重试</span>
                </ActionButton>
              )}

              {onDelete && (
                <ActionButton variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} />
                  <span className="ml-1">删除</span>
                </ActionButton>
              )}
            </MessageActions>
          )}
        </ContentColumn>
      </MessageWrapper>
    );
  },
);

MessageItem.displayName = "MessageItem";
